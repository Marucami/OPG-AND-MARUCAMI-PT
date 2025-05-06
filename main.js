import { app, BrowserWindow, ipcMain } from "electron"
import { fileURLToPath } from 'url';
import path from "path"
import { db, getDbPath } from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1600,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // win.removeMenu()

  win.loadFile('index.html')
}

function setupDatabaseHandlers() {
  ipcMain.handle('add-task', (_, task) => {
    return new Promise((resolve) => {
      db.run(
        `INSERT INTO tasks (name, description, status, start_date, deadline) 
         VALUES (?, ?, ?, ?, ?)`,
        [task.name, task.description, task.status || 'todo', task.startDate, task.deadline],
        function(err) {
          if (err) {
            resolve({ success: false, error: err.message });
          } else {
            resolve({ success: true, id: this.lastID });
          }
        }
      );
    });
  });
  ipcMain.handle('get-tasks', async () => {
    return new Promise((resolve) => {
      db.all("SELECT * FROM tasks", [], (err, rows) => {
        if (err) {
          resolve({ success: false, error: err.message });
        } else {
          resolve({ success: true, newTasks: rows });
        }
      });
    });
  });
  ipcMain.handle('delete-task', async (_, id) => {
    return new Promise((resolve) => {
      db.run("DELETE FROM tasks WHERE id = ?", [id], function(err) {
        if (err) {
          resolve({ success: false, error: err.message });
        } else {
          resolve({ 
            success: true, 
            deleted: this.changes > 0,
            changes: this.changes 
          });
        }
      });
    });
  });
  ipcMain.handle('update-task-status', async (_, { id, newStatus }) => {
    return new Promise((resolve) => {
      db.run(
        "UPDATE tasks SET status = ? WHERE id = ?",
        [newStatus, id],
        function(err) {
          if (err) {
            resolve({ success: false, error: err.message });
          } else {
            resolve({ 
              success: true,
              updated: this.changes > 0,
              changes: this.changes
            });
          }
        }
      );
    });
  });
  ipcMain.handle('update-task', async (_, { id, taskData }) => {
    return new Promise((resolve) => {
      db.run(
        `UPDATE tasks SET 
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          status = COALESCE(?, status),
          start_date = COALESCE(?, start_date),
          deadline = COALESCE(?, deadline)
         WHERE id = ?`,
        [
          taskData.name,
          taskData.description,
          taskData.status,
          taskData.startDate,
          taskData.deadline,
          id
        ],
        function(err) {
          if (err) {
            resolve({ success: false, error: err.message });
          } else {
            resolve({ 
              success: true,
              updated: this.changes > 0,
              changes: this.changes
            });
          }
        }
      );
    });
  });
}

app.whenReady().then(() => {
  setupDatabaseHandlers();
  console.log('DB path:', getDbPath());
  createWindow()
})

