import { app, BrowserWindow, ipcMain } from "electron"
import { fileURLToPath } from 'url';
import path from "path"
import db from "./database.js";

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
}

app.whenReady().then(() => {
  setupDatabaseHandlers();
  createWindow()
})

