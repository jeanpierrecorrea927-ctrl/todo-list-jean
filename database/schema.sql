-- Esquema de la base de datos para la aplicación To-Do List
-- Ejecutar con: psql -U tu_usuario -d todo_db -f schema.sql

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para acelerar búsquedas/filtrado por título
CREATE INDEX IF NOT EXISTS idx_tasks_title ON tasks (title);

-- Datos de ejemplo (opcional)
INSERT INTO tasks (title, description, completed)
VALUES
    ('Configurar VPS', 'Provisionar DigitalOcean y asegurar el servidor', TRUE),
    ('Crear pipeline CI/CD', 'GitHub Actions con despliegue vía SSH', FALSE)
ON CONFLICT DO NOTHING;
