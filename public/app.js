// app.js
// Lógica de la SPA: CRUD completo + filtro en tiempo real

const API_URL = '/api/tasks';

const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('title-input');
const descriptionInput = document.getElementById('description-input');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const filterInput = document.getElementById('filter-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');

let tasks = [];
let editingId = null;

// --- Cargar tareas desde la API ---
async function fetchTasks() {
  try {
    const res = await fetch(API_URL);
    tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    console.error('Error al cargar tareas:', err);
  }
}

// --- Renderizar lista de tareas ---
function renderTasks(list) {
  taskList.innerHTML = '';

  if (list.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  list.forEach((task) => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.innerHTML = `
      <div class="task-info">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
      </div>
      <div class="task-actions">
        <button class="btn-toggle" data-action="toggle" data-id="${task.id}">
          ${task.completed ? '↩️' : '✅'}
        </button>
        <button class="btn-edit" data-action="edit" data-id="${task.id}">✏️</button>
        <button class="btn-delete" data-action="delete" data-id="${task.id}">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- Crear o actualizar tarea (submit del formulario) ---
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) return;

  try {
    if (editingId) {
      // Actualizar (Update)
      await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      exitEditMode();
    } else {
      // Crear (Create)
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
    }

    taskForm.reset();
    await fetchTasks();
    applyFilter();
  } catch (err) {
    console.error('Error al guardar la tarea:', err);
  }
});

// --- Acciones sobre cada tarea: toggle, editar, eliminar ---
taskList.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const { action, id } = btn.dataset;
  const task = tasks.find((t) => String(t.id) === id);
  if (!task) return;

  if (action === 'delete') {
    if (!confirm(`¿Eliminar la tarea "${task.title}"?`)) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    await fetchTasks();
    applyFilter();
  }

  if (action === 'toggle') {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    });
    await fetchTasks();
    applyFilter();
  }

  if (action === 'edit') {
    enterEditMode(task);
  }
});

function enterEditMode(task) {
  editingId = task.id;
  titleInput.value = task.title;
  descriptionInput.value = task.description || '';
  submitBtn.textContent = 'Guardar cambios';
  cancelEditBtn.classList.remove('hidden');
  titleInput.focus();
}

function exitEditMode() {
  editingId = null;
  submitBtn.textContent = 'Agregar';
  cancelEditBtn.classList.add('hidden');
  taskForm.reset();
}

cancelEditBtn.addEventListener('click', exitEditMode);

// --- Filtro en tiempo real (sobre los datos ya cargados en memoria) ---
filterInput.addEventListener('input', applyFilter);

function applyFilter() {
  const query = filterInput.value.trim().toLowerCase();
  if (!query) {
    renderTasks(tasks);
    return;
  }
  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(query) ||
    (t.description && t.description.toLowerCase().includes(query))
  );
  renderTasks(filtered);
}

// --- Inicialización ---
fetchTasks();
