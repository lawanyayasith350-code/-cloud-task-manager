const API_URL = "https://cloud-task-manager-3as8.onrender.com/api/tasks";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDateInput");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");

let tasks = [];

async function fetchTasks() {
  try {
    const response = await fetch(API_URL);
    tasks = await response.json();
    renderTasks();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    alert("Backend server එක connect වෙන්නේ නැහැ. node server.js run වෙලා තියෙනවද බලන්න.");
  }
}

function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = task.completed ? "task-item completed" : "task-item";

    li.innerHTML = `
      <input 
        type="checkbox" 
        class="task-check" 
        ${task.completed ? "checked" : ""}
        onchange="toggleTask(${task.id}, ${task.completed})"
      />

      <div class="task-content">
        <h3>${task.title}</h3>
        <p class="due-date">
          ${task.due_date ? "Due: " + task.due_date : "No due date"}
        </p>
      </div>

      <button class="delete-btn" onclick="deleteTask(${task.id})">
        Delete
      </button>
    `;

    taskList.appendChild(li);
  });

  updateStats();
}

function updateStats() {
  const completedCount = tasks.filter((task) => task.completed).length;

  totalTasks.textContent = `Total: ${tasks.length}`;
  completedTasks.textContent = `Completed: ${completedCount}`;
}

async function addTask(title, dueDate) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title,
        due_date: dueDate
      })
    });

    fetchTasks();
  } catch (error) {
    console.error("Error adding task:", error);
  }
}

async function toggleTask(id, currentCompleted) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        completed: currentCompleted ? 0 : 1
      })
    });

    fetchTasks();
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

async function deleteTask(id) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    fetchTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = taskInput.value.trim();
  const dueDate = dueDateInput.value;

  if (title === "") {
    alert("Please enter a task.");
    return;
  }

  addTask(title, dueDate);

  taskInput.value = "";
  dueDateInput.value = "";
  taskInput.focus();
});

fetchTasks();