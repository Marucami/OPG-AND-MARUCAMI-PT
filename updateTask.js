// updateTask.js
import db from "./database.js";

export default function updateTask(id, title, description, start, deadline) {
  const sql = `
    UPDATE tasks
    SET title = ?, description = ?, start_date = ?, deadline = ?
    WHERE id = ?
  `;
  db.run(sql, [title, description, start, deadline, id], function (err) {
    if (err) return console.error('Ошибка обновления:', err.message);
    console.log(`Задача ${id} обновлена`);
  });
}

