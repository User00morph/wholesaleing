import sqlite3 from 'sqlite3';
import { config } from '../config/config';

const db = new sqlite3.Database(config.dbPath);

export function initDb(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        phone TEXT UNIQUE,
        stage TEXT,
        score INTEGER,
        priority TEXT,
        fields_json TEXT,
        updated_at TEXT
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id TEXT,
        direction TEXT,
        body TEXT,
        created_at TEXT
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS followups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id TEXT,
        phone TEXT,
        body TEXT,
        due_at TEXT,
        sent INTEGER DEFAULT 0
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id TEXT,
        event_type TEXT,
        payload_json TEXT,
        created_at TEXT
      )`, (err) => (err ? reject(err) : resolve()));
    });
  });
}

export function run(sql: string, params: unknown[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => (err ? reject(err) : resolve()));
  });
}

export function all<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows as T[])));
  });
}

export function get<T = any>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row as T | undefined)));
  });
}
