# Build frontend
FROM node:18 AS build
WORKDIR /app
COPY frontend ./frontend
COPY backend ./backend
COPY package*.json ./
RUN npm install
RUN npm --prefix frontend run build

# Prepare production image
FROM node:18
WORKDIR /app

# Copy backend and built frontend
COPY backend ./backend
COPY --from=build /app/frontend/dist ./frontend/dist
COPY package*.json ./
RUN npm install --production

EXPOSE 8080
ENV PORT=8080

CMD ["node", "backend/server.js"]