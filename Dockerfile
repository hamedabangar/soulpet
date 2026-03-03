# Build frontend
# ---------- Build stage: build frontend ----------
FROM node:18 AS build
WORKDIR /app

# Install root tools/scripts (if any). If your root has no deps, you can skip this.
COPY package*.json ./
RUN npm ci || npm install

# Install frontend deps and build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ---------- Runtime stage: backend + built frontend ----------
FROM node:18

# Security: create non-root user
RUN useradd -m appuser
WORKDIR /app

# Copy backend source
COPY backend/ ./backend

# Install backend production dependencies into /app/backend
# (This reads backend/package.json and installs only prod deps)
RUN npm ci --omit=dev --prefix backend || npm install --production --prefix backend

# Copy the built frontend artifacts from the build stage
COPY --from=build /app/frontend/dist ./frontend/dist

# Environment
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# (Optional) Drop privileges
USER appuser

# Start the server (must listen on 0.0.0.0:PORT)
CMD ["node", "backend/server.js"]