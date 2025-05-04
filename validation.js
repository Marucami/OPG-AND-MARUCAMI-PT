// validation.js

function validateTaskName(name, tasks) {
    if (!name) {
        return 'Task name is required.';
    }

    const allTasks = [...tasks.draft, ...tasks['in-progress'], ...tasks.editing, ...tasks.done];
    if (allTasks.some(task => task.name === name)) {
        return 'Task with this name already exists.';
    }

    return null;
}

function validateTaskDescription(description) {
    if (!description) {
        return 'Task description is required.';
    }
    return null;
}

function validateTaskDates(startDate, deadline) {
    if (!startDate) {
        return 'Start date is required.';
    }

    if (!deadline) {
        return 'Deadline is required.';
    }

    if (new Date(startDate) > new Date(deadline)) {
        return 'Start date cannot be after the deadline.';
    }

    return null;
}

function validateForm(tasks) {
    const name = document.getElementById('taskName').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const startDate = document.getElementById('taskStartDate').value;
    const deadline = document.getElementById('taskDeadline').value;

    const nameError = validateTaskName(name, tasks);
    if (nameError) {
        return nameError;
    }

    const descriptionError = validateTaskDescription(description);
    if (descriptionError) {
        return descriptionError;
    }

    const datesError = validateTaskDates(startDate, deadline);
    if (datesError) {
        return datesError;
    }

    return null;
}

module.exports = {
    validateTaskName,
    validateTaskDescription,
    validateTaskDates,
    validateForm
};
