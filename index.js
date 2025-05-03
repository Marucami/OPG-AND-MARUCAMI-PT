const tasks = {
    draft: [],
    'in-progress': [],
    editing: [],
    done: []
};

function addTask(status) {
    // const taskText = prompt('Enter task description:');
    const taskText = 'Test Task'
    if (taskText) {
        const task = {
            id: Date.now(),
            text: taskText,
            status: status
        };
        tasks[status].push(task);
        renderTasks();
    }
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

function renderTaskOld(task, status) { //Эта функция нигде не вызывается, я её переименовал, после можно будет её удалить, на её замену функция ниже renderTask()
    const taskElement = document.createElement('div');
    taskElement.className = 'task';
    let actions = `
        <span class="task-text">${task.text}</span>
        <div class="task-actions">
            <button onclick="editTask(${task.id}, '${status}')">Edit</button>
            <button onclick="deleteTask(${task.id}, '${status}')">Delete</button>
    `;

    if (status === 'draft') {
        actions += `<button onclick="moveTask(${task.id}, '${status}', 'in-progress')">In Progress</button>`;
    } else if (status === 'in-progress') {
        actions += `<button onclick="moveTask(${task.id}, '${status}', 'editing')">Editing</button>`;
    } else if (status === 'editing') {
        actions += `<button onclick="moveTask(${task.id}, '${status}', 'done')">Done</button>
                   <button onclick="moveTask(${task.id}, '${status}', 'in-progress')">Back to In Progress</button>`;
    }

    actions += `</div>`;
    taskElement.innerHTML = actions;
    document.getElementById(`${status}-tasks`).appendChild(taskElement);
}

function renderTask(task, status) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');

    //<span class="task-text">${task.text}</span>
    const taskText = document.createElement('span');
    taskText.classList.add('task-text');
    taskText.innerText = task.text;

    //<div class="task-actions">
    const taskActions = document.createElement('div');
    taskActions.classList.add('task-actions');

    //<button onclick="editTask(${task.id}, '${status}')">Edit</button>
    const editTaskButton = document.createElement('button');
    editTaskButton.innerText = 'Edit'
    editTaskButton.addEventListener('click', (e) => {
        e.preventDefault;
        editTask(task.id, status);
    })

    //<button onclick="deleteTask(${task.id}, '${status}')">Delete</button>
    const deleteTaskButton = document.createElement('button');
    deleteTaskButton.innerText = 'Delete'
    deleteTaskButton.addEventListener('click', (e) => {
        e.preventDefault;
        deleteTask(task.id, status);
    })

    taskActions.append(editTaskButton, deleteTaskButton);

    if (status === 'editing') {
        const backButton = document.createElement('button');
        backButton.innerText = 'Back to In Progress';
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            moveTask(task.id, status, 'in-progress')
        })
        taskActions.append(backButton);
    }

    if (status !== 'done') {
        const moveTaskButton = document.createElement('button');
        switch(status) {
            case 'draft':
                moveTaskButton.innerText = 'In Progress'
                moveTaskButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    moveTask(task.id, status, 'in-progress')
                })
                break;
            case 'in-progress':
                moveTaskButton.innerText = 'Editing'
                moveTaskButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    moveTask(task.id, status, 'editing')
                })
                break;
            case 'editing':
                moveTaskButton.innerText = 'Done'
                moveTaskButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    moveTask(task.id, status, 'done')
                })
                break;
        }
        taskActions.append(moveTaskButton)
    }

    taskElement.append(taskText)
    taskElement.append(taskActions);
    document.getElementById(`${status}-tasks`).appendChild(taskElement);
}

function editTask(id, status) {
    const task = tasks[status].find(t => t.id === id);
    if (task) {
        //const newText = prompt('Edit task:', task.text);
        const newText = 'Edited Task'
        if (newText !== null) {
            task.text = newText.trim();
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

const addTaskButton = document.getElementById('addTask');

addTaskButton.addEventListener('click', (e) => {
    e.preventDefault();
    addTask('draft')
})

renderTasks();