document.getElementById('add-task-btn').addEventListener('click', addOrUpdateTask);
document.getElementById('search-input').addEventListener('input', filterTasks);
document.querySelectorAll('input[name="filter"]').forEach(radio => {
    radio.addEventListener('change', filterTasks);
});

document.addEventListener('DOMContentLoaded', loadTasksFromLocalStorage);

let editTaskIndex = -1; // Keeps track of the task being edited

function addOrUpdateTask() {
    const title = document.getElementById('task-title').value;
    const desc = document.getElementById('task-desc').value;
    const date = document.getElementById('task-date').value;

    if (title && date) {
        if (editTaskIndex === -1) {
            // Add new task
            const task = { title, desc, date, completed: false };
            const taskList = document.getElementById('task-list');
            const taskItem = createTaskElement(task);
            taskList.appendChild(taskItem);

            saveTaskToLocalStorage(task);
        } else {
            // Update existing task
            const taskItem = document.querySelectorAll('.task-item')[editTaskIndex];
            taskItem.querySelector('strong').textContent = title;
            taskItem.childNodes[2].textContent = ` - ${desc} (Due: ${date})`;
            updateTaskInLocalStorage(taskItem);

            editTaskIndex = -1; // Reset edit index
            document.getElementById('add-task-btn').textContent = 'Add Task';
        }

        clearInputs();
        updateSerialNumbers(); // Update serial numbers after adding or updating a task
    }
}

function createTaskElement(task) {
    const taskItem = document.createElement('li');
    taskItem.classList.add('task-item');
    if (task.completed) {
        taskItem.classList.add('completed');
    }

    taskItem.innerHTML = `
        <span class="serial-number"></span> <strong>${task.title}</strong> - ${task.desc} (Due: ${task.date})
        <div>
            <button class="complete-btn">Complete</button>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;

    addTaskEventListeners(taskItem);
    return taskItem;
}

function clearInputs() {
    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value = '';
    document.getElementById('task-date').value = '';
    editTaskIndex = -1;
    document.getElementById('add-task-btn').textContent = 'Add Task';
}

function addTaskEventListeners(taskItem) {
    taskItem.querySelector('.complete-btn').addEventListener('click', () => {
        taskItem.classList.toggle('completed');
        updateTaskInLocalStorage(taskItem);
        updateSerialNumbers(); // Update serial numbers after completing a task
    });

    taskItem.querySelector('.delete-btn').addEventListener('click', () => {
        taskItem.remove();
        removeTaskFromLocalStorage(taskItem);
        updateSerialNumbers(); // Update serial numbers after deleting a task
    });

    taskItem.querySelector('.edit-btn').addEventListener('click', () => {
        const taskIndex = Array.from(document.querySelectorAll('.task-item')).indexOf(taskItem);
        const title = taskItem.querySelector('strong').textContent;
        const desc = taskItem.childNodes[2].textContent.split(' - ')[1].split(' (Due: ')[0].trim();
        const date = taskItem.childNodes[2].textContent.split(' (Due: ')[1].replace(')', '');

        document.getElementById('task-title').value = title;
        document.getElementById('task-desc').value = desc;
        document.getElementById('task-date').value = date;

        editTaskIndex = taskIndex;
        document.getElementById('add-task-btn').textContent = 'Update Task';
    });
}

function filterTasks() {
    const filterValue = document.querySelector('input[name="filter"]:checked').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const tasks = document.querySelectorAll('.task-item');

    tasks.forEach(task => {
        const taskText = task.textContent.toLowerCase();
        const matchesSearch = taskText.includes(searchTerm);
        const isCompleted = task.classList.contains('completed');

        let shouldDisplay = matchesSearch;
        if (filterValue === 'completed') {
            shouldDisplay = shouldDisplay && isCompleted;
        } else if (filterValue === 'incomplete') {
            shouldDisplay = shouldDisplay && !isCompleted;
        }

        task.style.display = shouldDisplay ? '' : 'none';
    });

    updateSerialNumbers(); // Update serial numbers after filtering tasks
}

function loadTasksFromLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        const taskList = document.getElementById('task-list');
        const taskItem = createTaskElement(task);
        taskList.appendChild(taskItem);
    });

    updateSerialNumbers(); // Update serial numbers after loading tasks
}

function saveTaskToLocalStorage(task) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTaskInLocalStorage(taskItem) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = Array.from(document.querySelectorAll('.task-item')).indexOf(taskItem);
    const task = tasks[taskIndex];

    task.title = taskItem.querySelector('strong').textContent;
    task.desc = taskItem.childNodes[2].textContent.split(' - ')[1].split(' (Due: ')[0].trim();
    task.date = taskItem.childNodes[2].textContent.split(' (Due: ')[1].replace(')', '');
    task.completed = taskItem.classList.contains('completed');

    tasks[taskIndex] = task;
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function removeTaskFromLocalStorage(taskItem) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = Array.from(document.querySelectorAll('.task-item')).indexOf(taskItem);

    tasks.splice(taskIndex, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateSerialNumbers() {
    const tasks = document.querySelectorAll('.task-item');
    tasks.forEach((task, index) => {
        task.querySelector('.serial-number').textContent = `${index + 1}.`;
    });
}
