// import addTaskDB from "./addTask.js";
// import updateTaskDB from "./updateTask.js";
// import changeStatusDB from "./changeStatus.js";
// import deleteTaskDB from "./deleteTask.js";

const tasks = {
    draft: [],
    'in-progress': [],
    editing: [],
    done: []
};

async function getTasks() {
    const { success, newTasks, error } = await window.electronAPI.getTasks();
    if (!success) {
        console.error('Ошибка при загрузке задач:', error);
        return {};
    }

    console.log(newTasks);

    tasks.draft = [];
    tasks['in-progress'] = [];
    tasks.editing = [];
    tasks.done = [];

    newTasks.forEach((task) => {
        tasks[task.status].push(task);
    })
    console.log(tasks);
}

async function addTask(status, name, description, startDate, deadline) {
    if (name) {
        const task = {
            name: name,
            description: description,
            startDate: startDate,
            deadline: deadline,
            status: status
        };
        const result = await window.electronAPI.addTask(task);
        if (result.success) {
            console.log(`Задача добавлена с ID: ${result.id}`);
            // loadTasks();
        } else {
            console.log(`Ошибка: ${result.error}`);
            return false;
        }
        // tasks[status].push(task);
        renderTasks();
        return true;
    }

}

const editTaskModal = document.getElementById('editTaskModal');
const closeEditModal = document.getElementById('closeEditModal');
const editTaskForm = document.getElementById('editTaskForm');

let currentEditTaskId = null;
let currentEditTaskStatus = null;

function openEditTaskModal(task) {
    currentEditTaskId = task.id;
    currentEditTaskStatus = task.status;

    document.getElementById('editTaskName').value = task.name;
    document.getElementById('editTaskDescription').value = task.description;
    document.getElementById('editTaskStartDate').value = task.startDate;
    document.getElementById('editTaskDeadline').value = task.deadline;

    editTaskModal.style.display = 'block';
}

closeEditModal.addEventListener('click', () => {
    editTaskModal.style.display = 'none';
});


editTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedTask = {
        name: document.getElementById('editTaskName').value.trim(),
        description: document.getElementById('editTaskDescription').value.trim(),
        startDate: document.getElementById('editTaskStartDate').value,
        deadline: document.getElementById('editTaskDeadline').value,
        status: currentEditTaskStatus
    };

    const result = await window.electronAPI.updateTask(currentEditTaskId, updatedTask);
    if (!result.success) {
        console.error('Ошибка при обновлении задачи:', result.error);
    } else {
        console.log('Задача успешно обновлена');
    }

    editTaskModal.style.display = 'none';
    renderTasks();
});

async function renderTasks() {
    await getTasks();

    document.getElementById('draft-tasks').innerHTML = '';
    document.getElementById('in-progress-tasks').innerHTML = '';
    document.getElementById('editing-tasks').innerHTML = '';
    document.getElementById('done-tasks').innerHTML = '';

    tasks.draft.forEach(task => renderTask(task, 'draft'));
    tasks['in-progress'].forEach(task => renderTask(task, 'in-progress'));
    tasks.editing.forEach(task => renderTask(task, 'editing'));
    tasks.done.forEach(task => renderTask(task, 'done'));
}

function renderTask(task, status) {
    console.log('rendering task', task)
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');

    const taskName = document.createElement('h3');
    taskName.classList.add('task-name');
    taskName.innerText = task.name;

    const taskDescription = document.createElement('p');
    taskDescription.classList.add('task-description');
    taskDescription.innerText = task.description;

    const taskStartDate = document.createElement('p');
    taskStartDate.classList.add('task-start-date');
    taskStartDate.innerText = `Start Date: ${task.start_date}`;

    const taskDeadline = document.createElement('p');
    taskDeadline.classList.add('task-deadline');
    taskDeadline.innerText = `Deadline: ${task.deadline}`;

    const taskActions = document.createElement('div');
    taskActions.classList.add('task-actions');

    const editTaskButton = document.createElement('button');
    editTaskButton.classList.add('btn');
    editTaskButton.innerText = 'Edit';
    editTaskButton.addEventListener('click', (e) => {
        e.preventDefault();
        openEditTaskModal(task);
    });

    const deleteTaskButton = document.createElement('button');
    deleteTaskButton.innerText = 'Delete';
    deleteTaskButton.classList.add('btn');
    deleteTaskButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await deleteTask(task.id);
    });

    taskActions.append(editTaskButton, deleteTaskButton);

    if (status === 'editing') {
        const backButton = document.createElement('button');
        backButton.innerText = 'Back to In Progress';
        backButton.classList.add('btn');
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            moveTask(task.id, 'in-progress');
        });
        taskActions.append(backButton);
    }

    if (status !== 'done') {
        const moveTaskButton = document.createElement('button');
        moveTaskButton.classList.add('btn');
        switch (status) {
            case 'draft':
                moveTaskButton.innerText = 'In Progress';
                moveTaskButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    moveTask(task.id, 'in-progress');
                });
                break;
            case 'in-progress':
                moveTaskButton.innerText = 'Editing';
                moveTaskButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    moveTask(task.id, 'editing');
                });
                break;
            case 'editing':
                moveTaskButton.innerText = 'Done';
                moveTaskButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    moveTask(task.id, 'done');
                });
                break;
        }
        taskActions.append(moveTaskButton);
    }

    taskElement.append(taskName, taskDescription, taskStartDate, taskDeadline, taskActions);
    document.getElementById(`${status}-tasks`).appendChild(taskElement);
}

async function editTask(id, status) {
    // const task = tasks[status].find(t => t.id === id);
    // if (!task) return;
    // const { value: formValues } = await dialog.showMessageBox({
    //     type: 'question',
    //     buttons: ['Save', 'Cancel'],
    //     title: 'Edit Task',
    //     message: 'Edit task details:',
    //     detail: 'Enter the new task information:',
    //     inputs: [
    //         { label: 'Name', value: task.name },
    //         { label: 'Description', value: task.description },
    //         { label: 'Start Date', value: task.startDate },
    //         { label: 'Deadline', value: task.deadline }
    //     ],
    //     cancelId: 1
    // });

    // if (formValues !== undefined) {
    //     const [newName, newDescription, newStartDate, newDeadline] = formValues;
    //     if (newName && newDescription && newStartDate && newDeadline) {
    //         task.name = newName.trim();
    //         task.description = newDescription.trim();
    //         task.startDate = newStartDate.trim();
    //         task.deadline = newDeadline.trim();
    //         renderTasks();
    //     }
    // }

    const name = 'edited name';
    const description = 'edited description'
    const startDate = '1998-01-01'
    const deadline = '2026-01-01'


    const task = {
        name: name,
        description: description,
        startDate: startDate,
        deadline: deadline,
        status: status
    };

    const result = await window.electronAPI.updateTask(id, task);
    if (!result.success) {
        console.error('Ошибка', result.error);
    } else {
        console.log('Успешно обновлено')
    }

    renderTasks();
}

async function deleteTask(id) {
    await window.electronAPI.deleteTask(id);
    renderTasks();
}

async function moveTask(id, status) {
    await window.electronAPI.updateTaskStatus(id, status);
    renderTasks();
}

window.openModal = function () {
    document.getElementById('taskModal').style.display = 'block';
};

window.closeModal = function () {
    document.getElementById('taskModal').style.display = 'none';
};

document.getElementById('addTask').addEventListener('click', openModal);

document.getElementById('taskForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('taskName').value;
    const description = document.getElementById('taskDescription').value;
    const startDate = document.getElementById('taskStartDate').value;
    const deadline = document.getElementById('taskDeadline').value;
    const status = document.getElementById('taskStatus').value;

    if (addTask(status, name, description, startDate, deadline)) {
        e.target.reset();
        closeModal();
    }
});

renderTasks();
