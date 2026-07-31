// routes/tasks.js
// Endpoints CRUD para las tareas
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { body, param, validationResult } = require('express-validator');

// GET /api/tasks -> listar todas las tareas (soporta ?q= para filtrar en el servidor también)
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let result;
    if (q) {
      // Sanitizar el parámetro de búsqueda
      const sanitizedQuery = q.trim().slice(0, 100); // Limitar longitud
      result = await pool.query(
        'SELECT * FROM tasks WHERE title ILIKE $1 ORDER BY created_at DESC',
        [`%${sanitizedQuery}%`]
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
router.get('/:id', [
  param('id').isInt().withMessage('ID debe ser un entero')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
router.post('/', [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ max: 255 }).withMessage('El título no puede exceder 255 caracteres')
    .escape(),
  body('description')
    .optional()
    .trim()
    .escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;
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
router.put('/:id', [
  param('id').isInt().withMessage('ID debe ser un entero'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('El título no puede estar vacío')
    .isLength({ max: 255 }).withMessage('El título no puede exceder 255 caracteres')
    .escape(),
  body('description')
    .optional()
    .trim()
    .escape(),
  body('completed')
    .optional()
    .isBoolean().withMessage('completed debe ser un booleano')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
        title !== undefined ? title : current.title,
        description !== undefined ? description : current.description,
        completed !== undefined ? completed : current.completed,
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
router.delete('/:id', [
  param('id').isInt().withMessage('ID debe ser un entero')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
