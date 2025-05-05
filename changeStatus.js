// changeStatus.js
import db from "./database.js";

export default function changeStatus(id, newStatus) {
  const sql = `UPDATE tasks SET status = ? WHERE id = ?`;
  db.run(sql, [newStatus, id], function (err) {
    if (err) return console.error('Ошибка смены статуса:', err.message);
    console.log(`Статус задачи ${id} изменён на ${newStatus}`);
  });
}

