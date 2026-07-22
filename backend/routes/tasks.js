// routes/tasks.js
// Endpoints CRUD para las tareas
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/tasks -> listar todas las tareas (soporta ?q= para filtrar en el servidor también)
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let result;
    if (q) {
      result = await pool.query(
        'SELECT * FROM tasks WHERE title ILIKE $1 ORDER BY created_at DESC',
        [`%${q}%`]
      );
    } else {
      result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las tareas' });
  }
});

// GET /api/tasks/:id -> obtener una tarea específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la tarea' });
  }
});

// POST /api/tasks -> crear una nueva tarea
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }
    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
});

// PUT /api/tasks/:id -> actualizar una tarea (título, descripción, completado)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const current = existing.rows[0];
    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, completed = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [
        title ?? current.title,
        description ?? current.description,
        completed ?? current.completed,
        id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
});

// DELETE /api/tasks/:id -> eliminar una tarea
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea eliminada', task: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
});

module.exports = router;
