# ─── Stage 1: Build ─────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json si existe
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar el código fuente
COPY . .

# Compilar la aplicación React con Vite (genera carpeta dist/)
RUN npm run build

# ─── Stage 2: Runtime (Nginx) ────────────────────────────────────────
FROM nginx:alpine

# Copiar configuración personalizada de Nginx
ARG ENV=qa
COPY nginx.${ENV}.conf /etc/nginx/nginx.conf

# Copiar archivos compilados del stage anterior a la carpeta de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Crear archivo health.html para health checks
RUN echo "healthy" > /usr/share/nginx/html/health.html

# Exponer puerto 80
EXPOSE 80

# Liveness check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health.html || exit 1

# Iniciar Nginx en modo foreground
CMD ["nginx", "-g", "daemon off;"]
