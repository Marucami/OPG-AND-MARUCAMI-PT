const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  addTask: (task) => ipcRenderer.invoke('add-task', task),
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id),
  updateTaskStatus: (id, newStatus) => ipcRenderer.invoke('update-task-status', { id, newStatus }),
  updateTask: (id, taskData) => ipcRenderer.invoke('update-task', { id, taskData }),
  getComputerName: () => ipcRenderer.invoke('get-computer-name')
});