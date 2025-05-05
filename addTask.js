// addTask.js
import db from "./database.js";

export default function addTask(title, description, status, start, deadline) {
  const sql = `
    INSERT INTO tasks (title, description, status, start_date, deadline)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(sql, [title, description, status, start, deadline], function (err) {
    if (err) return console.error('Ошибка добавления:', err.message);
    console.log(`Задача добавлена (id: ${this.lastID})`);
    return this.lastID;
  });
}
