# Dockerfile — Backend To-Do List (Node.js + Express)
# Build context: la RAIZ del repo (no la carpeta backend/), porque server.js
# sirve el frontend con path.join(__dirname, '..', 'public'), así que 'public'
# debe quedar como carpeta hermana de 'backend' también dentro del contenedor.

FROM node:20-alpine

WORKDIR /app

# Copiamos primero solo los manifiestos para aprovechar la cache de Docker:
# si no cambian las dependencias, no se reinstalan en cada build.
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Ahora copiamos el resto del código, respetando la estructura relativa
# (backend/ y public/ como hermanos, igual que en el VPS).
COPY backend ./backend
COPY public ./public

WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "server.js"]
