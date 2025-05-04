const tasks = {
    draft: [],
    'in-progress': [],
    editing: [],
    done: []
};

function addTask(status, name, description, startDate, deadline) {
    if (name) {
        const task = {
            id: Date.now(),
            name: name,
            description: description,
            startDate: startDate,
            deadline: deadline,
            status: status
        };
        tasks[status].push(task);
        renderTasks();
        return true;
    }
    return false;
}

function renderTasks() {
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
    taskStartDate.innerText = `Start Date: ${task.startDate}`;

    const taskDeadline = document.createElement('p');
    taskDeadline.classList.add('task-deadline');
    taskDeadline.innerText = `Deadline: ${task.deadline}`;

    const taskActions = document.createElement('div');
    taskActions.classList.add('task-actions');

    const editTaskButton = document.createElement('button');
    editTaskButton.innerText = 'Edit';
    editTaskButton.addEventListener('click', (e) => {
        e.preventDefault();
        editTask(task.id, status);
    });

    const deleteTaskButton = document.createElement('button');
    deleteTaskButton.innerText = 'Delete';
    deleteTaskButton.addEventListener('click', (e) => {
        e.preventDefault();
        deleteTask(task.id, status);
    });

    taskActions.append(editTaskButton, deleteTaskButton);

    if (status === 'editing') {
        const backButton = document.createElement('button');
        backButton.innerText = 'Back to In Progress';
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            moveTask(task.id, status, 'in-progress');
        });
        taskActions.append(backButton);
    }

    if (status !== 'done') {
        const moveTaskButton = document.createElement('button');
        switch (status) {
            case 'draft':
                moveTaskButton.innerText = 'In Progress';
                moveTaskButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    moveTask(task.id, status, 'in-progress');
                });
                break;
            case 'in-progress':
                moveTaskButton.innerText = 'Editing';
                moveTaskButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    moveTask(task.id, status, 'editing');
                });
                break;
            case 'editing':
                moveTaskButton.innerText = 'Done';
                moveTaskButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    moveTask(task.id, status, 'done');
                });
                break;
        }
        taskActions.append(moveTaskButton);
    }

    taskElement.append(taskName, taskDescription, taskStartDate, taskDeadline, taskActions);
    document.getElementById(`${status}-tasks`).appendChild(taskElement);
}

function editTask(id, status) {
    const task = tasks[status].find(t => t.id === id);
    if (task) {
        const newName = prompt('Edit task name:', task.name);
        const newDescription = prompt('Edit task description:', task.description);
        const newStartDate = prompt('Edit start date:', task.startDate);
        const newDeadline = prompt('Edit deadline:', task.deadline);
        if (newName !== null && newDescription !== null && newStartDate !== null && newDeadline !== null) {
            task.name = newName.trim();
            task.description = newDescription.trim();
            task.startDate = newStartDate.trim();
            task.deadline = newDeadline.trim();
            renderTasks();
        }
    }
}

function deleteTask(id, status) {
    const index = tasks[status].findIndex(t => t.id === id);
    if (index !== -1) {
        tasks[status].splice(index, 1);
        renderTasks();
    }
}

function moveTask(id, fromStatus, toStatus) {
    const index = tasks[fromStatus].findIndex(t => t.id === id);
    if (index !== -1) {
        const taskToMove = tasks[fromStatus][index];
        tasks[fromStatus].splice(index, 1);
        taskToMove.status = toStatus;
        tasks[toStatus].push(taskToMove);
        renderTasks();
    }
}

function openModal() {
    document.getElementById('taskModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
}

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
