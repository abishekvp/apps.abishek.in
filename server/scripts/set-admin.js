/**
 * CLI script to promote a user to admin or update a user's role across SQLite and PostgreSQL databases.
 *
 * Usage:
 *   node server/scripts/set-admin.js <email> [role]
 * Example:
 *   node server/scripts/set-admin.js abishek.vp13@gmail.com
 *   node server/scripts/set-admin.js abishek.vp13@gmail.com admin
 *   node server/scripts/set-admin.js abishek.vp13@gmail.com user
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env files (root first, then server/.env fallback)
dotenv.config();
const serverEnvPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}

const targetEmail = process.argv[2]?.trim().toLowerCase();
const targetRole = (process.argv[3]?.trim().toLowerCase()) || 'admin';

if (!targetEmail) {
  console.error('Error: Please provide an email address.');
  console.log('Usage: node server/scripts/set-admin.js <email> [role]');
  process.exit(1);
}

if (!['admin', 'user'].includes(targetRole)) {
  console.error(`Error: Invalid role "${targetRole}". Allowed roles are: admin, user`);
  process.exit(1);
}

console.log(`Setting role of "${targetEmail}" to "${targetRole}"...\n`);

let sqliteUser = null;

// 1. Update SQLite if available
const sqliteDbPath = path.resolve(__dirname, '../../data/apps.db');
if (fs.existsSync(sqliteDbPath)) {
  try {
    const { DatabaseSync } = await import('node:sqlite');
    const sqlite = new DatabaseSync(sqliteDbPath);

    const user = sqlite.prepare('SELECT id, email, name, role, password_hash FROM users WHERE LOWER(email) = ?').get(targetEmail);
    if (user) {
      sqliteUser = user;
      sqlite.prepare('UPDATE users SET role = ? WHERE id = ?').run(targetRole, user.id);
      console.log(`[SQLite] Successfully updated "${user.email}" (ID: ${user.id}) role from "${user.role}" to "${targetRole}".`);
    } else {
      console.warn(`[SQLite] User with email "${targetEmail}" not found in local database.`);
    }
  } catch (err) {
    console.error(`[SQLite Error]:`, err.message);
  }
} else {
  console.log('[SQLite] Local database file not found, skipping SQLite update.');
}

// 2. Update PostgreSQL if DATABASE_URL is configured
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (databaseUrl) {
  try {
    console.log('\n[PostgreSQL] Connecting to remote PostgreSQL database...');
    const pg = (await import('pg')).default;
    const pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
    });

    const res = await pool.query('SELECT id, email, name, role FROM users WHERE LOWER(email) = $1', [targetEmail]);
    if (res.rows.length > 0) {
      const pgUser = res.rows[0];
      await pool.query('UPDATE users SET role = $1 WHERE id = $2', [targetRole, pgUser.id]);
      console.log(`[PostgreSQL] Successfully updated "${pgUser.email}" (ID: ${pgUser.id}) role from "${pgUser.role}" to "${targetRole}".`);
    } else {
      console.log(`[PostgreSQL] User "${targetEmail}" was not found in PostgreSQL.`);
      if (sqliteUser) {
        console.log(`[PostgreSQL] Found existing record in SQLite. Syncing user to PostgreSQL with role "${targetRole}"...`);
        const insertRes = await pool.query(
          `INSERT INTO users (email, password_hash, name, role, notify_new_tools)
           VALUES ($1, $2, $3, $4, 1) RETURNING id`,
          [sqliteUser.email, sqliteUser.password_hash, sqliteUser.name, targetRole]
        );
        console.log(`[PostgreSQL] Successfully created user in PostgreSQL (ID: ${insertRes.rows[0]?.id}) with role "${targetRole}".`);
      } else {
        console.warn(`[PostgreSQL] Could not replicate user because no local SQLite credentials exist. Create the user first.`);
      }
    }

    await pool.end();
  } catch (err) {
    console.error(`[PostgreSQL Error]:`, err.message);
  }
} else {
  console.log('[PostgreSQL] No DATABASE_URL configured, skipping PostgreSQL update.');
}

console.log('\nDone.');
