# Pruebas de Carga — k6

## Descripción y objetivo

Este directorio contiene las pruebas de carga para el UCE Lab Management System, implementadas usando **k6**. El objetivo de estas pruebas es validar el rendimiento del API Gateway y sus microservicios subyacentes bajo diversas condiciones de carga (Smoke, Load y Spike testing).

## Escenarios de Prueba

A continuación se detallan los 5 escenarios que forman parte de la suite, configurados para ejecutarse simultáneamente en la misma prueba.

| ID | Nombre | Endpoint | Tipo | VUs | Duración | Umbral Aceptación |
|----|--------|----------|------|-----|----------|-------------------|
| K6-LOAD-01 | smoke_health | `GET /health` | Smoke Test | 1 | 30s | p(95) < 500ms, err < 1% |
| K6-LOAD-02 | load_auth_login | `POST /api/auth/login` | Load Test | 0→50→0 | 3m30s | p(95) < 800ms, err < 2% |
| K6-LOAD-03 | load_laboratories | `GET /api/laboratories/laboratories` | Load Test | 30 | 2m | p(95) < 600ms, err < 1% |
| K6-LOAD-04 | load_reservations | `GET /api/reservations/my` | Load Test | 30 | 2m | p(95) < 600ms, err < 1% |
| K6-LOAD-05 | spike_mixed | `Múltiples Endpoints` | Spike Test | 10→80→10| 50s | p(99) < 2000ms, err < 5% |

## Prerrequisitos

Para ejecutar estas pruebas necesitas tener instalado `k6` en tu sistema:
- **Windows**: `winget install k6`
- **macOS**: `brew install k6`
- **Linux (Debian/Ubuntu)**: 
  ```bash
  sudo gpg -k
  sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
  echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
  sudo apt-get update
  sudo apt-get install k6
  ```

## Variables de Entorno Necesarias

Se deben configurar las siguientes variables de entorno:

- `API_GATEWAY_URL`: URL base del API Gateway (ej. `http://localhost:3000`).
- `TEST_USER_EMAIL`: Correo electrónico del usuario para obtener tokens de sesión.
- `TEST_USER_PASSWORD`: Contraseña del usuario.

## Ejecución Local

Para ejecutar las pruebas en tu entorno local:

```bash
# Definir variables (Windows PowerShell)
$env:API_GATEWAY_URL="http://localhost:3000"
$env:TEST_USER_EMAIL="admin@ejemplo.com"
$env:TEST_USER_PASSWORD="password123"

# Ejecutar k6
k6 run tests/performance/load-test-api-gateway.js
```

## Ejecución en CI/CD

Estas pruebas se ejecutan automáticamente (o de forma manual vía `workflow_dispatch`) en GitHub Actions. Se ha creado el workflow `.github/workflows/k6-load-test.yml` que:
1. Instala k6.
2. Extrae las variables desde GitHub Secrets (`QA_API_GATEWAY_URL`, `QA_TEST_USER_EMAIL`, `QA_TEST_USER_PASSWORD`).
3. Guarda el output y exporta los resultados detallados a `results.json` como un artefacto de GitHub.

**Nota:** Por requerimientos de QA, estas pruebas k6 se ejecutan estrictamente en el siguiente orden secuencial en pipelines más grandes: Selenium → ZAP → k6. Nunca en paralelo con otras suites.

## Métricas y Umbrales de Aceptación (Thresholds)

Los umbrales en k6 definen los criterios bajo los cuales la prueba pasará o fallará de forma automatizada:
- `http_req_duration`: Evalúa que el percentil 95 (o 99 en picos) del tiempo de respuesta se mantenga bajo un límite.
- `http_req_failed`: Evalúa la tasa de errores HTTP que puede ocurrir por carga (Timeout o Status >= 400).

Cada escenario cuenta con `tags` asociados, lo que permite evaluar thresholds independientes sin que un escenario afecte a las métricas del otro.

## Interpretación de Resultados

Al finalizar, observarás un resumen estándar de k6. Pon especial atención a:
- **✓ Thresholds**: Aparecerán en verde si todo fue exitoso. En rojo con una (x) si alguna métrica falló.
- **login_duration** y **authenticated_request_duration**: Estas métricas personalizadas (`Trend`) muestran el tiempo base de estos grupos específicos, aislados de las llamadas generales.

## Troubleshooting

- **Error al autenticarse en Setup**: Si loguea `Error de autenticación en setup: 401`, verifica que las credenciales (`TEST_USER_EMAIL` y `TEST_USER_PASSWORD`) sean correctas y existan en la BD del ambiente que se está probando.
- **VUs insuficientes**: Si ocurren timeouts de red masivos, revisa los límites de descriptores de archivos locales (ulimit en Linux) o si el API Gateway realmente colapsó.
- **Fallas en spike_mixed**: Un Spike test puede causar picos temporales de lentitud. Si esto excede 2s (p99), podría implicar cuellos de botella en la conexión base de datos o balanceador de AWS ALB.

---

### Consideración Crítica de QA: Setup de Token
Para evitar distorsionar artificialmente las métricas de carga con constantes inicios de sesión excesivos por cada VU (Usuario Virtual), el JWT Token se obtiene **UNA SOLA VEZ** usando la función `setup()` de k6. 
Este token se envía como un objeto compartido a todas las iteraciones de VUs. Solo el escenario `load_auth_login` evalúa explícitamente el rendimiento de generación de tokens durante alta concurrencia.

### Gestión de Datos de Prueba
Para pruebas de registro futuro, asegúrate de emplear sufijos dinámicos (`uuid`) en los correos (ej. `test_user_${uuid}@domain.com`) con el fin de evitar colisiones (409 Conflict) con datos estáticos.
