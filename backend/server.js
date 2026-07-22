// server.js
// Punto de entrada del servidor Express
const express = require('express');
const path = require('path');
require('dotenv').config();

const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// API routes
app.use('/api/tasks', tasksRouter);

// Servir el frontend estático (carpeta public)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Ruta catch-all para servir la SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
