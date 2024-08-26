var currentPage = window.location.pathname;
var taskForm = document.getElementById("task-form");
var taskId = document.getElementById("task-id");
var taskTitle = document.getElementById("task-title");
var taskDescription = document.getElementById("task-description");
var taskStatus = document.getElementById("task-status");
var taskDueDate = document.getElementById("task-due-date");
var taskList = document.getElementById("task-list");
var tasks = [];
if (currentPage.includes("index.html")) {
    taskForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var id = taskId.value ? parseInt(taskId.value) : Date.now();
        var title = taskTitle.value.trim();
        var description = taskDescription.value.trim();
        var status = parseInt(taskStatus.value);
        var due_date = new Date(taskDueDate.value);
        if (!title)
            return;
        if (taskId.value) {
            updateTask(id, title, description, status, due_date);
        }
        else {
            createTask({
                id: id,
                title: title,
                description: description,
                status: status,
                due_date: due_date,
            });
        }
        taskId.value = "";
        taskTitle.value = "";
        taskDescription.value = "";
        taskStatus.value = "";
        taskDueDate.value = "";
        taskDueDate.value = new Date().toISOString().split("T")[0];
    });
}
else {
    function showTasks() {
        taskList.innerHTML = "";
        readTasks().forEach(function (task) {
            var li = document.createElement("li");
            li.innerHTML = "\n        <strong>".concat(task.title, "</strong><br>\n        Description: ").concat(task.description, "<br>\n        Status: ").concat(getStatusText(task.status), "<br>\n        Due Date: ").concat(task.due_date ? task.due_date.toLocaleDateString() : "", "\n      ");
            var editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.addEventListener("click", function () {
                taskId.value = task.id.toString();
                taskTitle.value = task.title;
                taskDescription.value = task.description;
                taskStatus.value = task.status.toString();
                taskDueDate.value = task.due_date.toLocaleDateString();
            });
            var deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", function () {
                deleteTask(task.id);
                showTasks();
            });
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    }
    function getStatusText(status) {
        switch (status) {
            case 0:
                return "Not Started";
            case 1:
                return "In Progress";
            case 2:
                return "Completed";
            default:
                return "Not Started";
        }
    }
}
function createTask(task) {
    tasks.push(task);
    saveTasksToLocalStorage(tasks);
}
function readTasks() {
    tasks = loadTasksFromLocalStorage();
    return tasks;
}
function updateTask(id, title, description, status, due_date) {
    var task = tasks.find(function (t) { return t.id === id; });
    if (task) {
        task.title = title;
        task.description = description;
        task.status = status;
        task.due_date = due_date;
        saveTasksToLocalStorage(tasks);
    }
}
function deleteTask(id) {
    tasks = tasks.filter(function (task) { return task.id !== id; });
    saveTasksToLocalStorage(tasks);
}
function saveTasksToLocalStorage(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
function loadTasksFromLocalStorage() {
    var tasks = localStorage.getItem("tasks");
    return tasks ? JSON.parse(tasks) : [];
}
document.addEventListener("DOMContentLoaded", function () {
    tasks = loadTasksFromLocalStorage();
    if (currentPage.includes("index.html")) {
        var today = new Date().toISOString().split("T")[0];
        console.log("entre aqui");
        taskDueDate.value = today;
    }
    else if (currentPage.includes("tasks.html")) {
        showTasks();
    }
});
