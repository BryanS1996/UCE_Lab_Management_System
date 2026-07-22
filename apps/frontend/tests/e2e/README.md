# Pruebas Funcionales E2E — Selenium

## Descripción y objetivo
Este conjunto de pruebas funcionales End-to-End (E2E) está diseñado para validar los flujos críticos de la interfaz de usuario del sistema UCE Lab Management System. Utiliza Selenium WebDriver con Pytest y el patrón de diseño Page Object Model (POM) para mantener los tests modulares y fáciles de mantener.

## Casos de Prueba

| ID | Nombre | Flujo | Precondición | Resultado Esperado |
|---|---|---|---|---|
| SEL-E2E-01 | Login Exitoso | Navegar a /login → ingresar credenciales válidas → enviar | Usuario válido registrado en la base de datos | Redirección a /laboratorios o /dashboard, carga del contenido principal |
| SEL-E2E-02 | Login Fallido | Navegar a /login → ingresar credenciales inválidas → enviar | Ninguna | Se muestra un mensaje de error visual (fondo rojo) al usuario |
| SEL-E2E-03 | Navegación Laboratorios | Login exitoso → esperar redirección → verificar DOM | Usuario válido | El contenido principal (main) carga correctamente |
| SEL-E2E-04 | Validación de Formulario | Navegar a /login → dejar vacío → intentar enviar | Ninguna | La validación HTML5 impide el envío (estado pseudo-class :invalid) |
| SEL-E2E-05 | Flujo de Registro | Navegar a /login → clic en "Crear Cuenta" → rellenar campos | Ninguna | Los campos del formulario de registro aparecen y son editables |

## Prerrequisitos
- Python 3.11+
- Google Chrome o Chromium instalado en el sistema
- Entorno virtual recomendado (venv o conda)

## Variables de Entorno Necesarias
Para la ejecución, se requieren las siguientes variables de entorno. Si no se definen, se utilizarán los valores por defecto:
- `QA_FRONTEND_URL`: URL del frontend (por defecto `http://localhost`)
- `QA_API_GATEWAY_URL`: URL del API Gateway (por defecto `http://localhost:3000`)
- `QA_TEST_USER_EMAIL`: Email del usuario de prueba
- `QA_TEST_USER_PASSWORD`: Contraseña del usuario de prueba

## Ejecución Local
1. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
2. Ejecutar pruebas con reporte HTML:
   ```bash
   pytest test_login_flow.py --html=report.html --self-contained-html
   ```

## Ejecución en CI/CD
Las pruebas están preparadas para ejecutarse en GitHub Actions usando runners ubuntu-latest. El navegador se inicializa en modo headless (`--headless=new`) y se configura con opciones óptimas para CI (no-sandbox, disable-dev-shm-usage, disable-gpu).

## Buenas Prácticas Implementadas
- **Esperas explícitas (Explicit Waits)**: Uso estricto de `WebDriverWait` en lugar de `time.sleep()`.
- **Page Object Model (POM)**: Separación de la lógica de negocio (tests) de la interacción con la UI (LoginPage).
- **Evidencia en Fallos**: Captura automática de pantalla en caso de fallo, gestionada en `conftest.py`.
- **Aislamiento de pruebas**: Navegador (driver) nuevo por cada función de test para evitar contaminación de estado.

## Gestión de Datos de Prueba
Para evitar colisiones en la creación de usuarios y pruebas de registro iterativas (SEL-E2E-05), se generan correos aleatorios utilizando la librería `uuid` para el sufijo (ej: `test+a1b2c3d4@uce.edu.ec`).

## Solución de Problemas (Troubleshooting)
- **Error: ChromeDriver executable needs to be in PATH**: Asegúrate de instalar las dependencias correctamente. `webdriver-manager` o el propio Selenium gestionarán el driver automáticamente en versiones recientes.
- **Fallos por timeouts**: Verifica que las URLs en las variables de entorno son correctas y el sistema frontend local está levantado en el puerto correcto.

## Estructura de Reportes
Se puede utilizar `pytest-html` para generar reportes estructurados donde se pueden adjuntar evidencias visuales en caso de fallo.
