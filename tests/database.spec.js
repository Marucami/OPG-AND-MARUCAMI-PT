import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let electronApp;
let window;
let dbPath;

test.beforeAll(async () => {
  dbPath = path.join(process.cwd(), 'tasks-test.db');
  await ensureDbNotLocked(dbPath);
  
  electronApp = await electron.launch({
    args: [path.join(__dirname, '../main.js')],
    env: {
      ...process.env,
      NODE_ENV: 'test'
    }
  });
  
  window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');
});

test.afterAll(async () => {
  await electronApp.close();
  await new Promise(resolve => setTimeout(resolve, 500));
  await ensureDbNotLocked(dbPath);
});

async function ensureDbNotLocked(dbPath) {
  if (fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath);
    } catch (err) {
      if (err.code === 'EBUSY') {
        console.warn(`Database file ${dbPath} is locked, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 200));
        fs.unlinkSync(dbPath);
      } else {
        throw err;
      }
    }
  }
}

async function createTestTask(taskData = {}) {
  const defaultTask = {
    name: 'Test Task',
    description: 'Test Description',
    status: 'draft',
    startDate: '2023-01-01',
    deadline: '2023-01-10'
  };
  
  const task = { ...defaultTask, ...taskData };
  return await window.evaluate((t) => window.electronAPI.addTask(t), task);
}

test('should add a task to the database', async () => {
  const result = await createTestTask();
  expect(result.success).toBe(true);
  expect(result.id).toBeDefined();
});

test('should retrieve all tasks from database', async () => {
  await createTestTask();
  
  const result = await window.evaluate(() => window.electronAPI.getTasks());

  expect(result.success).toBe(true);
  expect(Array.isArray(result.newTasks)).toBe(true);
  expect(result.newTasks.length).toBeGreaterThan(0);
  
  const task = result.newTasks[0];
  expect(task).toHaveProperty('id');
  expect(task).toHaveProperty('name');
  expect(task).toHaveProperty('description');
  expect(task).toHaveProperty('status');
});

test('should delete a task from database', async () => {
  const creationResult = await createTestTask();
  const taskId = creationResult.id;
  
  const deletionResult = await window.evaluate((id) => 
    window.electronAPI.deleteTask(id), 
    taskId
  );
  
  expect(deletionResult.success).toBe(true);
  expect(deletionResult.deleted).toBe(true);
  
  const tasksResult = await window.evaluate(() => window.electronAPI.getTasks());
  const taskExists = tasksResult.newTasks.some(t => t.id === taskId);
  expect(taskExists).toBe(false);
});

test('should handle attempt to delete non-existent task', async () => {
  const nonExistentId = 9999;
  const result = await window.evaluate((id) => 
    window.electronAPI.deleteTask(id), 
    nonExistentId
  );
  
  expect(result.success).toBe(true);
  expect(result.deleted).toBe(false);
  expect(result.changes).toBe(0);
});

test('should update task status', async () => {
  const creationResult = await createTestTask();
  const taskId = creationResult.id;
  
  const newStatus = 'in-progress';
  const updateResult = await window.evaluate(({id, status}) => 
    window.electronAPI.updateTaskStatus(id, status), 
    { id: taskId, status: newStatus }
  );
  
  expect(updateResult.success).toBe(true);
  expect(updateResult.updated).toBe(true);
  
  const tasksResult = await window.evaluate(() => window.electronAPI.getTasks());
  
  const updatedTask = tasksResult.newTasks.find(t => t.id === taskId);
  expect(updatedTask.status).toBe(newStatus);
});

test('should not update status for non-existent task', async () => {
  const nonExistentId = 9999;
  const newStatus = 'in-progress';
  const result = await window.evaluate(({id, status}) => 
    window.electronAPI.updateTaskStatus(id, status), 
    { id: nonExistentId, newStatus }
  );
  
  expect(result.success).toBe(true);
  expect(result.updated).toBe(false);
  expect(result.changes).toBe(0);
});

test('should update task with all fields', async () => {
  const creationResult = await createTestTask();
  const taskId = creationResult.id;
  
  const updates = {
    name: 'Updated Name',
    description: 'Updated Description',
    status: 'done',
    startDate: '2023-02-01',
    deadline: '2023-02-28'
  };
  
  const updateResult = await window.evaluate(({ id, taskData }) => 
    window.electronAPI.updateTask(id, taskData), 
    { id: taskId, taskData: updates }
  );
  
  expect(updateResult.success).toBe(true);
  expect(updateResult.updated).toBe(true);
  
  const tasksResult = await window.evaluate(() => window.electronAPI.getTasks());
  const updatedTask = tasksResult.newTasks.find(t => t.id === taskId);
  
  expect(updatedTask.name).toBe(updates.name);
  expect(updatedTask.description).toBe(updates.description);
  expect(updatedTask.status).toBe(updates.status);
  expect(updatedTask.start_date).toBe(updates.startDate);
  expect(updatedTask.deadline).toBe(updates.deadline);
});

test('should partially update task fields', async () => {
  const creationResult = await createTestTask();
  const taskId = creationResult.id;
  
  const initialTasks = await window.evaluate(() => window.electronAPI.getTasks());
  const initialTask = initialTasks.newTasks.find(t => t.id === taskId);
  
  const updates = {
    name: 'Partially Updated Name',
    status: 'in-progress'
  };
  
  const updateResult = await window.evaluate(({ id, taskData }) => 
    window.electronAPI.updateTask(id, taskData), 
    { id: taskId, taskData: updates }
  );
  
  expect(updateResult.success).toBe(true);
  expect(updateResult.updated).toBe(true);
  
  const tasksResult = await window.evaluate(() => window.electronAPI.getTasks());
  const updatedTask = tasksResult.newTasks.find(t => t.id === taskId);
  
  expect(updatedTask.name).toBe(updates.name);
  expect(updatedTask.status).toBe(updates.status);
  
  expect(updatedTask.description).toBe(initialTask.description);
  expect(updatedTask.start_date).toBe(initialTask.start_date);
  expect(updatedTask.deadline).toBe(initialTask.deadline);
});

test('should handle update for non-existent task', async () => {
  const nonExistentId = 9999;
  const updates = {
    name: 'Updated Name'
  };
  
  const result = await window.evaluate(({id, taskData}) => 
    window.electronAPI.updateTask(id, taskData), 
    { id: nonExistentId, taskData: updates }
  );
  
  expect(result.success).toBe(true);
  expect(result.updated).toBe(false);
  expect(result.changes).toBe(0);
});