/**
 * Universal Database Adapter for apps.abishek.in
 * Uses embedded node:sqlite locally or PostgreSQL in production via DATABASE_URL
 */
import fs from 'node:fs';
import path from 'node:path';
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
      const res = await pool.query(toPgSql(sql), normalizeParams(params));
      return { changes: res.rowCount ?? 0, lastInsertRowid: res.rows[0]?.id };
    },
    async exec(sql) {
      await pool.query(sql);
    }
  };
}

async function createSqlite() {
  const { DatabaseSync } = await import('node:sqlite');
  const dataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const dbPath = path.join(dataDir, 'apps.db');
  const rawDb = new DatabaseSync(dbPath);

  // Enable WAL mode for high concurrency
  rawDb.exec('PRAGMA journal_mode = WAL;');
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
