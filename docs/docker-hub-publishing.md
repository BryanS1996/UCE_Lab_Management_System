# 🐳 Docker Hub Publishing Workflow

Este documento explica cómo GitHub Actions publica automáticamente las imágenes Docker en Docker Hub con los tags `prod` y `qa`.

---

## 📋 Setup Inicial (Una sola vez)

### 1. Crear Repositorios en Docker Hub

Ve a https://hub.docker.com y crea estos repositorios (si no existen):

- [ ] `bryanfabricio96/auth-service` ✅ (Ya existe)
- [ ] `bryanfabricio96/reservation-service` ✅ (Ya existe)
- [ ] `bryanfabricio96/laboratory-service` ⚠️ (Crear)
- [ ] `bryanfabricio96/notification-service` ⚠️ (Crear)

**Pasos para crear un repositorio:**
1. Log in a Docker Hub
2. Click en "Create Repository"
3. Repository name: `laboratory-service` (o `notification-service`)
4. Visibility: **Public**
5. Click "Create"

Repite para cada servicio que falte.

### 2. Verificar GitHub Secrets

Ve a tu repositorio → **Settings → Secrets and variables → Actions**

Verifica que existan estos secrets:
- `DOCKERHUB_USERNAME` → Tu usuario de Docker Hub
- `DOCKERHUB_TOKEN` → Token de acceso (crea uno en Docker Hub → Account Settings → Security)

Si faltan, agrégalos.

---

## 🚀 Cómo Funciona

### Workflow: `docker-publish.yml`

**Trigger**: `push` a las ramas `main` o `qa`

**Flujo automático:**

```
Push a main/qa
    ↓
Detecta servicios que cambiaron (dorny/paths-filter)
    ↓
Para cada servicio que cambió:
  - Determina TAG (prod si main, qa si qa)
  - Construye imagen Docker
  - Publica en Docker Hub con TAG
    ↓
Resultado:
  - bryanfabricio96/auth-service:prod (si push a main)
  - bryanfabricio96/auth-service:qa (si push a qa)
  - (mismo para otros servicios)
```

### Servicios Publicados

Actualmente configurados en `docker-publish.yml`:

| Servicio | Dockerfile | Path |
|----------|-----------|------|
| Auth | ✅ Sí | `services/auth-service/Dockerfile` |
| Reservation | ✅ Sí | `services/reservation-service/Dockerfile` |
| Laboratory | ✅ Sí | `services/laboratory-service/Dockerfile` |
| Notification | ✅ Sí | `services/notification-service/Dockerfile` |

---

## 📊 Tags Automáticos

### Basados en la rama:

```
Push a main (producción)
    ↓
TAG = prod
    ↓
bryanfabricio96/laboratory-service:prod
```

```
Push a qa
    ↓
TAG = qa
    ↓
bryanfabricio96/laboratory-service:qa
```

---

## ✅ Verificar que Funciona

### 1. Hacer un push a `qa`

```bash
git add .
git commit -m "Test: trigger docker-publish for laboratory-service"
git push origin qa
```

### 2. Ver el workflow en GitHub

Ve a: **GitHub → Actions → "Build and Push Docker Images"**

Deberías ver:
- ✅ `detect-changes` completado
- ✅ `build-laboratory` ejecutándose
- ✅ `build-notification` ejecutándose (si también cambió)

### 3. Verificar en Docker Hub

Ve a: `https://hub.docker.com/r/bryanfabricio96/laboratory-service/tags`

Deberías ver un nuevo tag `qa` con timestamp reciente.

```
laboratory-service
├── qa (6 hours ago)      ← Nueva
└── prod (never)
```

---

## 🔄 Ciclo Completo (Ejemplo)

### Escenario: Pusheaste código a `laboratory-service`

```
1. Commiteas cambios
   git commit -am "feat: add new endpoint"

2. Haces push a qa
   git push origin qa

3. GitHub Actions dispara docker-publish.yml
   - Detecta cambios en services/laboratory-service/
   - Construye imagen en Docker
   - Publica en Docker Hub con tag: qa

4. Verificas en Docker Hub
   https://hub.docker.com/r/bryanfabricio96/laboratory-service
   └── Ves nuevo tag "qa"

5. Para deploy, tu EC2 hace:
   docker pull bryanfabricio96/laboratory-service:qa
   docker-compose up -d
   ✅ Servicio corriendo con código nuevo
```

---

## 🐛 Troubleshooting

### Problema: Build falló
```
Ver logs en GitHub Actions → Actions → [workflow name] → [job]
```

**Causas comunes:**
- Dockerfile no encontrado (verificar ruta)
- Errores en el build (npm install, compilación, etc.)
- Credenciales Docker Hub expiradas

### Problema: Push exitoso pero imagen no aparece en Docker Hub

1. Esperar 30-60 segundos
2. Refrescar Docker Hub
3. Verificar que el repositorio sea **Public**

### Problema: Workflow no se dispara

**Asegúrate:**
- Hiciste push a `main` o `qa` (no a otra rama)
- El código que pusheaste toca `services/*/`
- Los secrets existen y son válidos

---

## 📝 Configuración en `docker-publish.yml`

El workflow detecta cambios SOLO en estas rutas:

```yaml
filters:
  auth:
    - 'services/auth-service/**'      ← Push aquí dispara build-auth
  reservation:
    - 'services/reservation-service/**'  ← Push aquí dispara build-reservation
  laboratory:
    - 'services/laboratory-service/**'   ← Push aquí dispara build-laboratory
  notification:
    - 'services/notification-service/**' ← Push aquí dispara build-notification
```

Si pusheaste a `docs/` o `.github/`, el workflow NO se dispara.

---

## 🎯 Resumen

| Aspecto | Estado |
|--------|--------|
| Auth Service | ✅ Publicando en Docker Hub |
| Reservation Service | ✅ Publicando en Docker Hub |
| Laboratory Service | ✅ Ahora publicando (si existe repo) |
| Notification Service | ✅ Ahora publicando (si existe repo) |
| Tags automáticos | ✅ `prod` (main) y `qa` (qa) |
| Detección de cambios | ✅ Selective building |
| Docker Hub credentials | ✅ Via GitHub Secrets |

---

## 📚 Siguiente Paso

Después de verificar que las imágenes se publican correctamente:

1. Usar `docker-compose.prod.yml` en EC2 (descargará imágenes de Docker Hub)
2. Usar `docker-compose.qa.yml` en EC2 (descargará imágenes de Docker Hub)
3. Ejecutar deployment scripts: `./scripts/deploy-docker-compose.sh prod|qa /path/to/.env`

Ver: [docs/deployment/DOCKER_COMPOSE_EC2.md](../deployment/DOCKER_COMPOSE_EC2.md)
