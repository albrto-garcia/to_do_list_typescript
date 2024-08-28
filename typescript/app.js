// Variables principales
var currentPage = window.location.pathname;
var taskForm = document.getElementById("task-form");
var taskId = document.getElementById("task-id");
var taskTitle = document.getElementById("task-title");
var taskDescription = document.getElementById("task-description");
var taskStatus = document.getElementById("task-status");
var taskDueDate = document.getElementById("task-due-date");
var taskList = document.getElementById("task-list");
// Cargar el Navbar y gestionar el menú
document.addEventListener("DOMContentLoaded", function () {
    var navbarPlaceholder = document.getElementById("navbar-placeholder");
    if (navbarPlaceholder) {
        fetch("/html/partials/navbar.html")
            .then(function (response) { return response.text(); })
            .then(function (data) {
            navbarPlaceholder.innerHTML = data;
            initNavbar(); // Inicializar la funcionalidad del menú
        })
            .catch(function (error) { return console.error("Error al mostrar el navbar:", error); });
    }
    var urlParams = new URLSearchParams(window.location.search);
    var taskIdParam = urlParams.get("id");
    if (currentPage.includes("index.html") && !taskIdParam) {
        var today = new Date().toISOString().split("T")[0];
        if (taskStatus && taskDueDate) {
            taskStatus.value = "0"; // Estado predeterminado
            taskDueDate.value = today; // Fecha predeterminada
        }
    }
});
// Inicialización del menú de navegación
function initNavbar() {
    var hamburger = document.querySelector(".hamburger");
    var navMenu = document.querySelector(".nav-menu");
    var navLinks = document.querySelectorAll(".nav-link");
    if (hamburger && navMenu) {
        hamburger.addEventListener("click", function () {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
        navLinks.forEach(function (link) {
            link.addEventListener("click", function (e) {
                var targetId = link.getAttribute("href");
                if (targetId && targetId.startsWith("#")) {
                    e.preventDefault();
                    var targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.getBoundingClientRect().top +
                                window.pageYOffset -
                                55,
                            behavior: "smooth",
                        });
                    }
                }
                else {
                    hamburger.classList.remove("active");
                    navMenu.classList.remove("active");
                }
            });
        });
    }
    else {
        console.error("Error con los elementos del menú o el hamburguer");
    }
}
// Cargar tareas desde LocalStorage
var tasks = loadTasksFromLocalStorage();
// Manejo del formulario de tareas
if (currentPage.includes("index.html") && taskForm) {
    var urlParams = new URLSearchParams(window.location.search);
    var taskIdParam_1 = urlParams.get("id");
    if (taskIdParam_1 &&
        taskId &&
        taskTitle &&
        taskDescription &&
        taskStatus &&
        taskDueDate) {
        var task = tasks.find(function (t) { return t.id === parseInt(taskIdParam_1); });
        if (task) {
            taskId.value = task.id.toString();
            taskTitle.value = task.title;
            taskDescription.value = task.description;
            taskStatus.value = task.status.toString();
            taskDueDate.value = task.due_date.toString().split("T")[0];
        }
    }
    taskForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (taskId && taskTitle && taskDescription && taskStatus && taskDueDate) {
            var id = taskId.value ? parseInt(taskId.value) : Date.now();
            var title = taskTitle.value.trim();
            var description = taskDescription.value.trim();
            var status_1 = parseInt(taskStatus.value);
            var due_date = new Date(taskDueDate.value);
            if (!title)
                return;
            if (taskId.value) {
                updateTask(id, title, description, status_1, due_date);
            }
            else {
                createTask({ id: id, title: title, description: description, status: status_1, due_date: due_date });
            }
            saveTasksToLocalStorage(tasks);
            taskId.value = "";
            taskTitle.value = "";
            taskDescription.value = "";
            taskStatus.value = "0";
            taskDueDate.value = new Date().toISOString().split("T")[0];
        }
    });
}
else if (currentPage.includes("tasks.html") && taskList) {
    showTasks();
}
// Funciones relacionadas con las tareas
function createTask(task) {
    tasks.push(task);
    saveTasksToLocalStorage(tasks);
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
    showTasks();
}
function saveTasksToLocalStorage(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
function loadTasksFromLocalStorage() {
    var tasks = localStorage.getItem("tasks");
    return tasks ? JSON.parse(tasks) : [];
}
function showTasks() {
    if (!taskList)
        return;
    taskList.innerHTML = ""; // Limpia la lista actual
    if (tasks.length === 0) {
        // Muestra un mensaje en caso de que no hayan tareas
        var emptyMessage = document.createElement("li");
        emptyMessage.textContent = "No hay tareas guardadas.";
        emptyMessage.style.textAlign = "center";
        emptyMessage.style.color = "#000000";
        taskList.appendChild(emptyMessage);
    }
    else {
        tasks.forEach(function (task) {
            var li = document.createElement("li");
            li.innerHTML = "\n        <strong>".concat(task.title, "</strong><br>\n        Descripci\u00F3n: ").concat(task.description, "<br><br>\n        Estado: ").concat(getStatusText(task.status), "<br><br>\n        Fecha l\u00EDmite: ").concat(task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "", "<br><br>\n      ");
            var editBtn = document.createElement("button");
            editBtn.textContent = "Editar";
            editBtn.addEventListener("click", function () {
                window.location.href = "index.html?id=".concat(task.id);
            });
            var deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Eliminar";
            deleteBtn.addEventListener("click", function () {
                deleteTask(task.id);
                showTasks(); // Refresca la lista luego de eliminar
            });
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    }
}
// Función auxiliar
function getStatusText(status) {
    switch (status) {
        case 0:
            return "No iniciada";
        case 1:
            return "En progreso";
        case 2:
            return "Completada";
        default:
            return "No iniciada";
    }
}
