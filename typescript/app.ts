// Definición de la interfaz Task
interface Task {
  id: number;
  title: string;
  description: string;
  status: number;
  due_date: Date;
}

// Variables principales
const currentPage = window.location.pathname;
const taskForm = document.getElementById("task-form") as HTMLFormElement | null;
const taskId = document.getElementById("task-id") as HTMLInputElement | null;
const taskTitle = document.getElementById(
  "task-title"
) as HTMLInputElement | null;
const taskDescription = document.getElementById(
  "task-description"
) as HTMLTextAreaElement | null;
const taskStatus = document.getElementById(
  "task-status"
) as HTMLSelectElement | null;
const taskDueDate = document.getElementById(
  "task-due-date"
) as HTMLInputElement | null;
const taskList = document.getElementById(
  "task-list"
) as HTMLUListElement | null;

// Cargar el Navbar y gestionar el menú
document.addEventListener("DOMContentLoaded", () => {
  const navbarPlaceholder = document.getElementById("navbar-placeholder");
  if (navbarPlaceholder) {
    fetch("/html/partials/navbar.html")
      .then((response) => response.text())
      .then((data) => {
        navbarPlaceholder.innerHTML = data;
        initNavbar(); // Inicializar la funcionalidad del menú
      })
      .catch((error) => console.error("Error al mostrar el navbar:", error));
  }

  const urlParams = new URLSearchParams(window.location.search);
  const taskIdParam = urlParams.get("id");

  if (currentPage.includes("index.html") && !taskIdParam) {
    const today = new Date().toISOString().split("T")[0];
    if (taskStatus && taskDueDate) {
      taskStatus.value = "0"; // Estado predeterminado
      taskDueDate.value = today; // Fecha predeterminada
    }
  }
});

// Inicialización del menú de navegación
function initNavbar(): void {
  const hamburger = document.querySelector(".hamburger") as HTMLElement | null;
  const navMenu = document.querySelector(".nav-menu") as HTMLElement | null;
  const navLinks = document.querySelectorAll(
    ".nav-link"
  ) as NodeListOf<HTMLAnchorElement>;

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");

        if (targetId && targetId.startsWith("#")) {
          e.preventDefault();
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            window.scrollTo({
              top:
                targetElement.getBoundingClientRect().top +
                window.pageYOffset -
                55,
              behavior: "smooth",
            });
          }
        } else {
          hamburger.classList.remove("active");
          navMenu.classList.remove("active");
        }
      });
    });
  } else {
    console.error("Error con los elementos del menú o el hamburguer");
  }
}

// Cargar tareas desde LocalStorage
let tasks: Task[] = loadTasksFromLocalStorage();

// Manejo del formulario de tareas
if (currentPage.includes("index.html") && taskForm) {
  const urlParams = new URLSearchParams(window.location.search);
  const taskIdParam = urlParams.get("id");

  if (
    taskIdParam &&
    taskId &&
    taskTitle &&
    taskDescription &&
    taskStatus &&
    taskDueDate
  ) {
    const task = tasks.find((t) => t.id === parseInt(taskIdParam));
    if (task) {
      taskId.value = task.id.toString();
      taskTitle.value = task.title;
      taskDescription.value = task.description;
      taskStatus.value = task.status.toString();
      taskDueDate.value = task.due_date.toString().split("T")[0];
    }
  }

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (taskId && taskTitle && taskDescription && taskStatus && taskDueDate) {
      const id = taskId.value ? parseInt(taskId.value) : Date.now();
      const title = taskTitle.value.trim();
      const description = taskDescription.value.trim();
      const status = parseInt(taskStatus.value);
      const due_date = new Date(taskDueDate.value);

      if (!title) return;

      if (taskId.value) {
        updateTask(id, title, description, status, due_date);
      } else {
        createTask({ id, title, description, status, due_date });
      }

      saveTasksToLocalStorage(tasks);

      taskId.value = "";
      taskTitle.value = "";
      taskDescription.value = "";
      taskStatus.value = "0";
      taskDueDate.value = new Date().toISOString().split("T")[0];
    }
  });
} else if (currentPage.includes("tasks.html") && taskList) {
  showTasks();
}

// Funciones relacionadas con las tareas
function createTask(task: Task): void {
  tasks.push(task);
  saveTasksToLocalStorage(tasks);
}

function updateTask(
  id: number,
  title: string,
  description: string,
  status: number,
  due_date: Date
): void {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.title = title;
    task.description = description;
    task.status = status;
    task.due_date = due_date;
    saveTasksToLocalStorage(tasks);
  }
}

function deleteTask(id: number): void {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasksToLocalStorage(tasks);
  showTasks();
}

function saveTasksToLocalStorage(tasks: Task[]): void {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage(): Task[] {
  const tasks = localStorage.getItem("tasks");
  return tasks ? JSON.parse(tasks) : [];
}

function showTasks(): void {
  if (!taskList) return;

  taskList.innerHTML = ""; // Limpia la lista actual

  if (tasks.length === 0) {
    // Muestra un mensaje en caso de que no hayan tareas
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "No hay tareas guardadas.";
    emptyMessage.style.textAlign = "center";
    emptyMessage.style.color = "#000000";
    taskList.appendChild(emptyMessage);
  } else {
    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${task.title}</strong><br>
        Descripción: ${task.description}<br><br>
        Estado: ${getStatusText(task.status)}<br><br>
        Fecha límite: ${
          task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : ""
        }<br><br>
      `;

      const editBtn = document.createElement("button");
      editBtn.textContent = "Editar";
      editBtn.addEventListener("click", () => {
        window.location.href = `index.html?id=${task.id}`;
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Eliminar";
      deleteBtn.addEventListener("click", () => {
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
function getStatusText(status: number): string {
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
