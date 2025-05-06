const submitButton = document.getElementById

export function submitValidation(taskValidation, submitButton) {
    const isValid = Object.values(taskValidation).every((value) => value === true);
    if (!isValid) {
        submitButton.disabled = true;
    } else {
        submitButton.disabled = false;
    }
}

export function resetAddTaskValidation() {
    const taskName = document.getElementById("taskName");
    const taskStatus = document.getElementById("taskStatus");
    const taskDescription = document.getElementById("taskDescription");
    const taskStartDate = document.getElementById("taskStartDate");
    const taskDeadline = document.getElementById("taskDeadline");
    const inputs = [taskName, taskStatus, taskDescription, taskStartDate, taskDeadline]
    inputs.forEach((input) => {
        input.classList.remove("error");
        input.classList.remove("valid");
    })
}

export function validateTextInput(input) {
    if (!input.value) {
        input.classList.add('error');
        input.classList.remove('valid');
        return false;
    } else {
        input.classList.remove('error');
        input.classList.add('valid');
        return true;
    }
}

export function validateTaskStatus(taskStatus) {
    if (taskStatus.value === "none") {
        taskStatus.classList.add('error');
        taskStatus.classList.remove('valid');
        return false;
    } else {
        taskStatus.classList.remove('error');
        taskStatus.classList.add('valid');
        return true;
    }
}

export function validateTaskDates(taskStartDate, taskDeadline) {
    const start = taskStartDate.value;
    const deadline = taskDeadline.value;
    const startDate = new Date(start);
    const deadlineDate = new Date(deadline);
    if (!start || !deadline || startDate > deadlineDate || startDate.getFullYear() < 1900 || startDate.getFullYear() > 2100 || deadlineDate.getFullYear() < 1900 || deadlineDate.getFullYear() > 2100) {
        taskStartDate.classList.add('error');
        taskStartDate.classList.remove('valid');
        taskDeadline.classList.add('error');
        taskDeadline.classList.remove('valid');
        return false;
    } else {
        taskStartDate.classList.remove('error');
        taskStartDate.classList.add('valid');
        taskDeadline.classList.remove('error');
        taskDeadline.classList.add('valid');
        return true;
    }
}