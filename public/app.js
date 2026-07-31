document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("task-form");
  const titleInput = document.getElementById("title-input");
  const descriptionInput = document.getElementById("description-input");
  const taskList = document.getElementById("task-list");
  const emptyState = document.getElementById("empty-state");
  const filterInput = document.getElementById("filter-input");
  const submitBtn = document.getElementById("submit-btn");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let editingTaskId = null;

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function renderTasks(filterText = "") {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter((task) => {
      const text = `${task.title} ${task.description}`.toLowerCase();
      return text.includes(filterText.toLowerCase());
    });

    if (filteredTasks.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");

    filteredTasks.forEach((task) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <div class="task-content">
          <strong>${escapeHtml(task.title)}</strong>
          <p>${escapeHtml(task.description || "Sin descripción")}</p>
        </div>

        <div class="task-actions">
          <button type="button" class="edit-btn">
            Editar
          </button>

          <button type="button" class="delete-btn">
            Eliminar
          </button>
        </div>
      `;

      li.querySelector(".edit-btn").addEventListener("click", () => {
        startEditing(task.id);
      });

      li.querySelector(".delete-btn").addEventListener("click", () => {
        deleteTask(task.id);
      });

      taskList.appendChild(li);
    });
  }

  function startEditing(id) {
    const task = tasks.find((item) => item.id === id);

    if (!task) {
      return;
    }

    editingTaskId = id;
    titleInput.value = task.title;
    descriptionInput.value = task.description;

    submitBtn.textContent = "Guardar";
    cancelEditBtn.classList.remove("hidden");

    titleInput.focus();
  }

  function cancelEditing() {
    editingTaskId = null;
    taskForm.reset();

    submitBtn.textContent = "Agregar";
    cancelEditBtn.classList.add("hidden");
  }

  function deleteTask(id) {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar esta tarea?"
    );

    if (!confirmed) {
      return;
    }

    tasks = tasks.filter((task) => task.id !== id);

    saveTasks();
    renderTasks(filterInput.value);

    if (editingTaskId === id) {
      cancelEditing();
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!title) {
      alert("Escribe el título de la tarea.");
      return;
    }

    if (editingTaskId !== null) {
      tasks = tasks.map((task) =>
        task.id === editingTaskId
          ? {
              ...task,
              title,
              description
            }
          : task
      );
    } else {
      tasks.push({
        id: Date.now(),
        title,
        description
      });
    }

    saveTasks();
    cancelEditing();
    renderTasks(filterInput.value);
  });

  cancelEditBtn.addEventListener("click", cancelEditing);

  filterInput.addEventListener("input", () => {
    renderTasks(filterInput.value);
  });

  renderTasks();
});
