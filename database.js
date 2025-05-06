import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from 'url';
import { app } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getDbPath() {
  if (process.env.NODE_ENV === 'development') {
    return path.join(process.cwd(), 'tasks.db');
  }
  return path.join(app.getPath('userData'), 'tasks.db');
}

const dbPath = getDbPath();

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('Ошибка подключения к БД:', err.message);
  console.log('✅ База данных подключена:', dbPath);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'todo',
      start_date DATE,
      deadline DATE
    )
  `);
});
