// db.js
import sqlite3 from "sqlite3";
import path from "path";

// Создаём/подключаем базу данных
const dbPath = path.join(__dirname, 'tasks.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('Ошибка подключения к БД:', err.message);
  console.log('✅ База данных подключена:', dbPath);
});

// Создаём таблицу
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'todo',
      start_date DATE,
      deadline DATE
    )
  `);
});

module.exports = db;
