# ---------- Build stage: build frontend with Node 22 ----------
FROM node:22-slim AS build
WORKDIR /app

# Copy only frontend manifests first for better layer caching
COPY frontend/package*.json ./frontend/

# Install deps (prefer npm ci if lock exists, else fallback to npm install)
# This satisfies npm's lockfile requirement in CI while unblocking if it's missing.
RUN if [ -f frontend/package-lock.json ]; then \
      npm ci --prefix frontend; \
    else \
      npm install --prefix frontend; \
    fi

# Copy the rest of the frontend and build
COPY frontend ./frontend
RUN npm run --prefix frontend build

# ---------- Runtime stage: backend + built frontend ----------
FROM node:22-slim
WORKDIR /app

# Copy backend source
COPY backend ./backend

# Install backend production deps into /app/backend
RUN npm ci --omit=dev --prefix backend || npm install --production --prefix backend

# Copy built frontend artifact
COPY --from=build /app/frontend/dist ./frontend/dist

# Environment & port for Cloud Run
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "backend/server.js"]