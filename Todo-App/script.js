const addBtn = document.getElementById("addBtn");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const themeBtn = document.getElementById("themeBtn");
const categorySelect = document.getElementById("category");
const dueDateInput = document.getElementById("dueDate");
const searchInput = document.getElementById("searchInput");

const allBtn = document.getElementById("allBtn");
const completedBtn = document.getElementById("completedBtn");
const pendingBtn = document.getElementById("pendingBtn");

/* =========================
   THEME ICON
========================= */

const themeIcon =
  themeBtn.querySelector("i");

/* =========================
   NOTIFICATIONS
========================= */

if ("Notification" in window) {

  if (Notification.permission !== "granted") {

    Notification.requestPermission();

  }

}

/* =========================
   LOCAL STORAGE
========================= */

let tasks =
  JSON.parse(localStorage.getItem("tasks")) || [];

/* =========================
   LOAD APP
========================= */

window.onload = () => {

  /* LOAD TASKS */

  tasks.forEach(task => {
    createTask(task);
  });

  updateTaskStats();

  /* LOAD THEME */

  const savedTheme =
    localStorage.getItem("theme");

  if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");

  }

};

/* =========================
   ADD TASK
========================= */

addBtn.addEventListener("click", () => {

  const taskText =
    taskInput.value.trim();

  const category =
    categorySelect.value;

  const dueDate =
    dueDateInput.value;

  if (taskText === "") {

    alert("Please enter a task");

    return;

  }

  const task = {
    text: taskText,
    category: category,
    dueDate: dueDate,
    completed: false
  };

  tasks.push(task);

  saveTasks();

  createTask(task);

  scheduleNotification(
    task.text,
    task.dueDate
  );

  taskInput.value = "";
  dueDateInput.value = "";

  updateTaskStats();

});

/* =========================
   CREATE TASK
========================= */

function createTask(task) {

  const li =
    document.createElement("li");

  li.setAttribute("draggable", true);

  const span =
    document.createElement("span");

  let dateText =
    task.dueDate
    ? `📅 ${task.dueDate}`
    : "";

  span.innerHTML = `
    <strong>[${task.category}]</strong>
    ${task.text}
    <small>${dateText}</small>
  `;

  if (task.completed) {

    span.classList.add("completed");

  }

  /* BUTTONS */

  const buttonDiv =
    document.createElement("div");

  buttonDiv.classList.add("task-buttons");

  /* COMPLETE BUTTON */

  const completeBtn =
    document.createElement("button");

  completeBtn.innerHTML =
    `<i class="fa-solid fa-check"></i>`;

  completeBtn.classList.add("complete-btn");

  completeBtn.addEventListener("click", () => {

    span.classList.toggle("completed");

    updateLocalStorage();

    updateTaskStats();

  });

  /* EDIT BUTTON */

  const editBtn =
    document.createElement("button");

  editBtn.innerHTML =
    `<i class="fa-solid fa-pen"></i>`;

  editBtn.classList.add("edit-btn");

  editBtn.addEventListener("click", () => {

    const newTask =
      prompt("Edit task:", task.text);

    if (
      newTask !== null &&
      newTask.trim() !== ""
    ) {

      task.text = newTask;

      span.innerHTML = `
        <strong>[${task.category}]</strong>
        ${task.text}
        <small>${dateText}</small>
      `;

      if (task.completed) {

        span.classList.add("completed");

      }

      updateLocalStorage();

    }

  });

  /* DELETE BUTTON */

  const deleteBtn =
    document.createElement("button");

  deleteBtn.innerHTML =
    `<i class="fa-solid fa-trash"></i>`;

  deleteBtn.classList.add("delete-btn");

  deleteBtn.addEventListener("click", () => {

    li.remove();

    updateLocalStorage();

    updateTaskStats();

  });

  /* APPEND BUTTONS */

  buttonDiv.appendChild(completeBtn);
  buttonDiv.appendChild(editBtn);
  buttonDiv.appendChild(deleteBtn);

  li.appendChild(span);
  li.appendChild(buttonDiv);

  taskList.appendChild(li);

  /* DRAG EVENTS */

  li.addEventListener("dragstart", () => {

    li.classList.add("dragging");

  });

  li.addEventListener("dragend", () => {

    li.classList.remove("dragging");

    updateLocalStorage();

  });

}

/* =========================
   SAVE TASKS
========================= */

function saveTasks() {

  localStorage.setItem(
    "tasks",
    JSON.stringify(tasks)
  );

}

/* =========================
   UPDATE STORAGE
========================= */

function updateLocalStorage() {

  const updatedTasks = [];

  document
    .querySelectorAll("#taskList li")
    .forEach(li => {

      const span =
        li.querySelector("span");

      const strong =
        span.querySelector("strong")
        .textContent;

      const category =
        strong.replace("[", "")
        .replace("]", "");

      const text =
        span.childNodes[2]
        .textContent.trim();

      const small =
        span.querySelector("small");

      const dueDate =
        small
        ? small.textContent
          .replace("📅", "")
          .trim()
        : "";

      updatedTasks.push({

        text: text,
        category: category,
        dueDate: dueDate,
        completed:
          span.classList.contains("completed")

      });

    });

  tasks = updatedTasks;

  localStorage.setItem(
    "tasks",
    JSON.stringify(tasks)
  );

}

/* =========================
   THEME TOGGLE
========================= */

themeBtn.addEventListener("click", () => {

  document.body.classList.toggle("dark");

  const icon = themeBtn.querySelector("i");

  if (document.body.classList.contains("dark")) {

    localStorage.setItem("theme", "dark");

    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");

  } else {

    localStorage.setItem("theme", "light");

    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");

  }

});

/* LOAD SAVED THEME */

window.addEventListener("load", () => {

  const savedTheme = localStorage.getItem("theme");

  const icon = themeBtn.querySelector("i");

  if (savedTheme === "dark") {

    document.body.classList.add("dark");

    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");

  } else {

    document.body.classList.remove("dark");

    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");

  }

});

/* =========================
   SEARCH
========================= */

searchInput.addEventListener("input", () => {

  const value =
    searchInput.value.toLowerCase();

  const taskItems =
    document.querySelectorAll("#taskList li");

  taskItems.forEach(task => {

    const text =
      task.textContent.toLowerCase();

    task.style.display =
      text.includes(value)
      ? "flex"
      : "none";

  });

});

/* =========================
   DRAG & DROP
========================= */

taskList.addEventListener("dragover", (e) => {

  e.preventDefault();

  const afterElement =
    getDragAfterElement(
      taskList,
      e.clientY
    );

  const dragging =
    document.querySelector(".dragging");

  if (afterElement == null) {

    taskList.appendChild(dragging);

  } else {

    taskList.insertBefore(
      dragging,
      afterElement
    );

  }

});

function getDragAfterElement(container, y) {

  const draggableElements = [

    ...container.querySelectorAll(
      "li:not(.dragging)"
    )

  ];

  return draggableElements.reduce(

    (closest, child) => {

      const box =
        child.getBoundingClientRect();

      const offset =
        y - box.top - box.height / 2;

      if (
        offset < 0 &&
        offset > closest.offset
      ) {

        return {
          offset: offset,
          element: child
        };

      } else {

        return closest;

      }

    },

    {
      offset: Number.NEGATIVE_INFINITY
    }

  ).element;

}

/* =========================
   NOTIFICATIONS
========================= */

function scheduleNotification(
  taskText,
  dueDate
) {

  if (!dueDate) return;

  const dueTime =
    new Date(dueDate).getTime();

  const now =
    new Date().getTime();

  const delay =
    dueTime - now;

  if (delay > 0) {

    setTimeout(() => {

      new Notification(
        "⏰ Task Reminder",
        {
          body: taskText
        }
      );

    }, delay);

  }

}

/* =========================
   FILTERS
========================= */

allBtn.addEventListener("click", () => {

  document
    .querySelectorAll("#taskList li")
    .forEach(task => {

      task.style.display = "flex";

    });

});

completedBtn.addEventListener("click", () => {

  document
    .querySelectorAll("#taskList li")
    .forEach(task => {

      const completed =
        task.querySelector("span")
        .classList.contains("completed");

      task.style.display =
        completed
        ? "flex"
        : "none";

    });

});

pendingBtn.addEventListener("click", () => {

  document
    .querySelectorAll("#taskList li")
    .forEach(task => {

      const completed =
        task.querySelector("span")
        .classList.contains("completed");

      task.style.display =
        !completed
        ? "flex"
        : "none";

    });

});

/* =========================
   TASK STATS
========================= */

function updateTaskStats() {

  const total =
    document.querySelectorAll(
      "#taskList li"
    ).length;

  const completed =
    document.querySelectorAll(
      ".completed"
    ).length;

  const remaining =
    total - completed;

  document.getElementById(
    "totalTasks"
  ).textContent = total;

  document.getElementById(
    "completedTasks"
  ).textContent = completed;

  document.getElementById(
    "remainingTasks"
  ).textContent = remaining;

}