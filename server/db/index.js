/**
 * Universal Database Adapter for apps.abishek.in
 * Uses embedded node:sqlite locally or PostgreSQL in production via DATABASE_URL
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let db = null;

function normalizeParams(params = []) {
  return params.map((v) => {
    if (v === undefined) return null;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (v instanceof Uint8Array || v === null) return v;
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
}

function toPgSql(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function createPg(databaseUrl) {
  const pg = (await import('pg')).default;
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
  });

  return {
    dialect: 'pg',
    async all(sql, params = []) {
      const res = await pool.query(toPgSql(sql), normalizeParams(params));
      return res.rows;
    },
    async one(sql, params = []) {
      const res = await pool.query(toPgSql(sql), normalizeParams(params));
      return res.rows[0] ?? null;
    },
    async run(sql, params = []) {
      let pgSql = toPgSql(sql);
      if (/^\s*INSERT\s+INTO/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
        pgSql += ' RETURNING id';
      }
      const res = await pool.query(pgSql, normalizeParams(params));
      const rowId = res.rows[0]?.id;
      return {
        changes: res.rowCount ?? 0,
        lastInsertRowid: rowId !== undefined ? Number(rowId) : undefined
      };
    },
    async exec(sql) {
      await pool.query(sql);
    }
  };
}

async function createSqlite() {
  const { DatabaseSync } = await import('node:sqlite');
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  let dbPath;
  if (isServerless) {
    const tmpDir = os.tmpdir();
    dbPath = path.join(tmpDir, 'apps.db');

    // On serverless environments (e.g. Vercel), /var/task is read-only.
    // If /tmp/apps.db does not exist yet, copy the pre-seeded apps.db if available.
    if (!fs.existsSync(dbPath)) {
      const seedCandidates = [
        path.resolve(__dirname, '../../data/apps.db'),
        path.resolve(process.cwd(), 'data/apps.db'),
        '/var/task/data/apps.db'
      ];
      for (const candidate of seedCandidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, dbPath);
            console.log(`[DB] Copied seed SQLite database from ${candidate} to ${dbPath}`);
            break;
          } catch (e) {
            console.warn(`[DB] Failed copying ${candidate} to ${dbPath}:`, e.message);
          }
        }
      }
    }
  } else {
    const dataDir = path.resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    dbPath = path.join(dataDir, 'apps.db');
  }

  const rawDb = new DatabaseSync(dbPath);

  // Enable WAL mode for high concurrency where supported
  try {
    rawDb.exec('PRAGMA journal_mode = WAL;');
  } catch (e) {
    console.warn('[DB] WAL mode not enabled:', e.message);
  }
  rawDb.exec('PRAGMA foreign_keys = ON;');

  return {
    dialect: 'sqlite',
    async all(sql, params = []) {
      const stmt = rawDb.prepare(sql);
      return stmt.all(...normalizeParams(params));
    },
    async one(sql, params = []) {
      const stmt = rawDb.prepare(sql);
      return stmt.get(...normalizeParams(params)) ?? null;
    },
    async run(sql, params = []) {
      const stmt = rawDb.prepare(sql);
      const res = stmt.run(...normalizeParams(params));
      return { changes: res.changes, lastInsertRowid: Number(res.lastInsertRowid) };
    },
    async exec(sql) {
      rawDb.exec(sql);
    }
  };
}

export async function initDb() {
  if (db) return db;

  if (process.env.DATABASE_URL) {
    console.log('[DB] Connecting to PostgreSQL...');
    db = await createPg(process.env.DATABASE_URL);
  } else {
    console.log('[DB] Initializing local SQLite database...');
    db = await createSqlite();
  }

  const { runMigrations } = await import('./schema.js');
  await runMigrations(db);

  return db;
}
