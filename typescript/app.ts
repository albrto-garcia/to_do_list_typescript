interface Task {
  id: number;
  title: string;
  description: string;
  status: number;
  due_date: Date;
}

const currentPage = window.location.pathname;

const taskForm = document.getElementById("task-form") as HTMLFormElement;
const taskId = document.getElementById("task-id") as HTMLInputElement;
const taskTitle = document.getElementById("task-title") as HTMLInputElement;
const taskDescription = document.getElementById(
  "task-description"
) as HTMLInputElement;
const taskStatus = document.getElementById("task-status") as HTMLInputElement;
const taskDueDate = document.getElementById(
  "task-due-date"
) as HTMLInputElement;
const taskList = document.getElementById("task-list") as HTMLUListElement;

let tasks: Task[] = [];

if (currentPage.includes("index.html")) {
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = taskId.value ? parseInt(taskId.value) : Date.now();
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const status = parseInt(taskStatus.value);
    const due_date = new Date(taskDueDate.value);

    if (!title) return;

    if (taskId.value) {
      updateTask(id, title, description, status, due_date);
    } else {
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
} else {
  function showTasks(): void {
    taskList.innerHTML = "";

    readTasks().forEach((task) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${task.title}</strong><br>
        Description: ${task.description}<br>
        Status: ${getStatusText(task.status)}<br>
        Due Date: ${task.due_date ? task.due_date.toLocaleDateString() : ""}
      `;

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => {
        taskId.value = task.id.toString();
        taskTitle.value = task.title;
        taskDescription.value = task.description;
        taskStatus.value = task.status.toString();
        taskDueDate.value = task.due_date.toLocaleDateString();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        deleteTask(task.id);
        showTasks();
      });

      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      taskList.appendChild(li);
    });
  }

  function getStatusText(status: number): string {
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

function createTask(task: Task): void {
  tasks.push(task);
  saveTasksToLocalStorage(tasks);
}

function readTasks(): Task[] {
  tasks = loadTasksFromLocalStorage();
  return tasks;
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
}

function saveTasksToLocalStorage(tasks: Task[]): void {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage(): Task[] {
  const tasks = localStorage.getItem("tasks");
  return tasks ? JSON.parse(tasks) : [];
}

document.addEventListener("DOMContentLoaded", () => {
  tasks = loadTasksFromLocalStorage();

  if (currentPage.includes("index.html")) {
    const today = new Date().toISOString().split("T")[0];
    console.log("entre aqui");
    taskDueDate.value = today;
  } else if (currentPage.includes("tasks.html")) {
    showTasks();
  }
});
