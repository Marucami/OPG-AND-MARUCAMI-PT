import { resetAddTaskValidation, submitValidation, validateTaskDates, validateTaskStatus, validateTextInput } from "./validation.js";

async function changeUsername() {
    const usernameField = document.querySelector('.username');
    usernameField.innerText = await window.electronAPI.getComputerName();
}

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

    tasks.draft = [];
    tasks['in-progress'] = [];
    tasks.editing = [];
    tasks.done = [];

    newTasks.forEach((task) => {
        tasks[task.status].push(task);
    })
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
        } else {
            console.log(`Ошибка: ${result.error}`);
            return false;
        }
        renderTasks();
        return true;
    }

}

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

async function deleteTask(id) {
    await window.electronAPI.deleteTask(id);
    renderTasks();
}

async function moveTask(id, status) {
    await window.electronAPI.updateTaskStatus(id, status);
    renderTasks();
}

function openModal() {
    document.getElementById('taskModal').style.display = 'block';
};

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
    resetAddTaskValidation();
    document.getElementById('taskForm').reset();
};

document.getElementById('addTask').addEventListener('click', openModal);

document.getElementById('closeModal').addEventListener('click', closeModal);

document.getElementById('taskForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const data = new FormData(e.target);
    const name = data.get("taskName")
    const description = data.get("taskDescription")
    const startDate = data.get("taskStartDate")
    const deadline = data.get("taskDeadline")
    const status = data.get("taskStatus")

    if (addTask(status, name, description, startDate, deadline)) {
        e.target.reset();
        resetAddTaskValidation();
        closeModal();
    }
});

const addTaskValidation = {
    taskName: false,
    taskStartDate: false,
    taskDeadline: false,
    taskStatus: false,
    taskDescription: false
}

const submitAddTask = document.getElementById("taskSubmit");

document.getElementById("taskName").addEventListener('input', (e) => {
    addTaskValidation.taskName = validateTextInput(e.target);
    submitValidation(addTaskValidation, submitAddTask);
})

const addTaskStartDateInput = document.getElementById("taskStartDate");
const addTaskDeadlineInput = document.getElementById("taskDeadline");

addTaskStartDateInput.addEventListener('input', () => {
    addTaskValidation.taskStartDate = validateTaskDates(addTaskStartDateInput, addTaskDeadlineInput);
    addTaskValidation.taskDeadline = addTaskValidation.taskStartDate
    submitValidation(addTaskValidation, submitAddTask);
})

addTaskDeadlineInput.addEventListener('input', () => {
    addTaskValidation.taskDeadline = validateTaskDates(addTaskStartDateInput, addTaskDeadlineInput);
    addTaskValidation.taskStartDate = addTaskValidation.taskDeadline;
    submitValidation(addTaskValidation, submitAddTask);
})

document.getElementById("taskStatus").addEventListener('input', (e) => {
    addTaskValidation.taskStatus = validateTaskStatus(e.target);
    submitValidation(addTaskValidation, submitAddTask);
})

document.getElementById("taskDescription").addEventListener('input', (e) => {
    addTaskValidation.taskDescription = validateTextInput(e.target);
    submitValidation(addTaskValidation, submitAddTask);
})

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
    document.getElementById('editTaskStartDate').value = task.start_date;
    document.getElementById('editTaskDeadline').value = task.deadline;

    editTaskModal.style.display = 'block';
}

closeEditModal.addEventListener('click', () => {
    editTaskModal.style.display = 'none';
});


editTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);

    const task = {
        name: data.get("name"),
        description: data.get("description"),
        startDate: data.get("startDate"),
        deadline: data.get("deadline"),
        status: currentEditTaskStatus
    }

    updateTask(currentEditTaskId, task)
    editTaskModal.style.display = 'none';
});

async function updateTask(id, task) {
    const result = await window.electronAPI.updateTask(id, task);
    if (!result.success) {
        console.error('Ошибка при обновлении задачи:', result.error);
    } else {
        console.log('Задача успешно обновлена');
    }

    renderTasks();
}

const editTaskValidation = {
    taskName: true,
    taskStartDate: true,
    taskDeadline: true,
    taslDescription: true
}

const submitEditTask = document.getElementById("editTaskSubmit")

document.getElementById("editTaskName").addEventListener('input', (e) => {
    editTaskValidation.taskName = validateTextInput(e.target);
    submitValidation(editTaskValidation, submitEditTask);
})

const editTaskStartDateInput = document.getElementById("editTaskStartDate");
const editTaskDeadlineInput = document.getElementById("editTaskDeadline");

editTaskStartDateInput.addEventListener('input', () => {
    editTaskValidation.taskStartDate = validateTaskDates(editTaskStartDateInput, editTaskDeadlineInput);
    editTaskValidation.taskDeadline = editTaskValidation.taskStartDate
    submitValidation(editTaskValidation, submitEditTask);
})

editTaskDeadlineInput.addEventListener('input', () => {
    editTaskValidation.taskDeadline = validateTaskDates(editTaskStartDateInput, editTaskDeadlineInput);
    editTaskValidation.taskStartDate = editTaskValidation.taskDeadline;
    submitValidation(editTaskValidation, submitEditTask);
})

document.getElementById("editTaskDescription").addEventListener('input', (e) => {
    editTaskValidation.taskName = validateTextInput(e.target);
    submitValidation(editTaskValidation, submitEditTask);
})

changeUsername();
renderTasks();
