import db from "./database.js";

export default function deleteTask(id) {
  db.run(`DELETE FROM tasks WHERE id = ?`, id, function (err) {
    if (err) return console.error('Ошибка удаления:', err.message);
    console.log(`Задача ${id} удалена`);
  });
}
