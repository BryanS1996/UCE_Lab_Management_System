"""
Pruebas Funcionales E2E — Selenium
===================================
Suite de 5 pruebas E2E para el sistema UCE Lab Management.
Usa Page Object Pattern simplificado con Explicit Waits (WebDriverWait).

Consideraciones de QA:
- Cada test usa un driver independiente (scope='function') para aislamiento total.
- SEL-E2E-05 genera un email aleatorio con uuid4 para evitar colisiones.
- NUNCA se usa time.sleep() — solo WebDriverWait con expected_conditions.
- Screenshots automáticos en caso de fallo (vía conftest.py).
"""

import uuid
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


class LoginPage:
    """
    Page Object para la página de login/registro de UCE Lab Management.
    Los localizadores están basados en el HTML real de AuthSection.tsx.
    """

    # ── Localizadores del formulario de Login ────────────────────────────────
    EMAIL_INPUT = (By.CSS_SELECTOR, 'input[type="email"]')
    PASSWORD_INPUT = (By.CSS_SELECTOR, 'input[type="password"]')
    SUBMIT_BUTTON = (By.CSS_SELECTOR, 'button[type="submit"]')
    ERROR_MESSAGE = (By.CSS_SELECTOR, '.bg-red-50')

    # El botón toggle usa el texto "¿No tienes cuenta? Regístrate" / "¿Ya tienes cuenta? Inicia sesión"
    REGISTER_TOGGLE = (By.XPATH, '//button[contains(text(), "Reg") or contains(text(), "Crear")]')

    # ── Localizadores del formulario de Registro ─────────────────────────────
    # Los inputs del registro NO tienen atributo 'name'. Se seleccionan por
    # tipo y posición dentro del grid layout del formulario.
    # Estructura: email (type=email), 2 text inputs en grid (nombre, apellido), password
    REG_FIRST_NAME = (By.CSS_SELECTOR, '.grid input[type="text"]:first-child')
    REG_LAST_NAME = (By.XPATH, '(//div[contains(@class,"grid")]//input[@type="text"])[2]')

    def __init__(self, driver, base_url):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(self.driver, 15)

    def navigate(self, path="/login"):
        """Navega a la URL especificada y espera que el formulario cargue."""
        self.driver.get(f"{self.base_url}{path}")
        self.wait_for_page_load()

    def wait_for_page_load(self):
        """Espera explícita hasta que el input de email esté presente en el DOM."""
        self.wait.until(EC.presence_of_element_located(self.EMAIL_INPUT))

    def enter_email(self, email):
        """Limpia y escribe en el campo de email con espera explícita."""
        element = self.wait.until(EC.element_to_be_clickable(self.EMAIL_INPUT))
        element.clear()
        element.send_keys(email)

    def enter_password(self, password):
        """Limpia y escribe en el campo de contraseña con espera explícita."""
        element = self.wait.until(EC.element_to_be_clickable(self.PASSWORD_INPUT))
        element.clear()
        element.send_keys(password)

    def click_submit(self):
        """Hace clic en el botón de submit con espera explícita."""
        element = self.wait.until(EC.element_to_be_clickable(self.SUBMIT_BUTTON))
        element.click()

    def get_error_message(self):
        """Espera a que aparezca el mensaje de error y retorna su texto."""
        element = self.wait.until(EC.visibility_of_element_located(self.ERROR_MESSAGE))
        return element.text

    def toggle_register(self):
        """Cambia entre los formularios de login y registro."""
        element = self.wait.until(EC.element_to_be_clickable(self.REGISTER_TOGGLE))
        element.click()


# ══════════════════════════════════════════════════════════════════════════════
# SEL-E2E-01: Login Exitoso
# ══════════════════════════════════════════════════════════════════════════════
def test_sel_e2e_01_login_exitoso(driver, base_url, test_credentials):
    """
    SEL-E2E-01: Verificar inicio de sesión exitoso con credenciales válidas.
    
    Flujo:
      1. Navegar a /login
      2. Ingresar email y contraseña válidos
      3. Hacer clic en 'Iniciar Sesión'
      4. Verificar que la URL cambia a /laboratorios o /dashboard
    
    Precondición: El usuario de prueba debe existir en la BD de QA.
    """
    login_page = LoginPage(driver, base_url)
    login_page.navigate()

    login_page.enter_email(test_credentials['email'])
    login_page.enter_password(test_credentials['password'])
    login_page.click_submit()

    # Espera explícita: la URL debe dejar de contener '/login'
    wait = WebDriverWait(driver, 15)
    wait.until(lambda d: "/login" not in d.current_url)

    current_url = driver.current_url
    assert (
        "/laboratorios" in current_url or "/dashboard" in current_url
    ), (
        f"Se esperaba redirección a /laboratorios o /dashboard, "
        f"pero la URL actual es: {current_url}"
    )


# ══════════════════════════════════════════════════════════════════════════════
# SEL-E2E-02: Login Fallido
# ══════════════════════════════════════════════════════════════════════════════
def test_sel_e2e_02_login_fallido(driver, base_url):
    """
    SEL-E2E-02: Verificar que credenciales inválidas muestran un mensaje de error.
    
    Flujo:
      1. Navegar a /login
      2. Ingresar credenciales inválidas
      3. Hacer clic en 'Iniciar Sesión'
      4. Verificar que aparece un div con clase .bg-red-50 con mensaje de error
      5. Verificar que la URL sigue siendo /login
    """
    login_page = LoginPage(driver, base_url)
    login_page.navigate()

    login_page.enter_email("usuario_inexistente@uce.edu.ec")
    login_page.enter_password("ContraseñaInvalida123!")
    login_page.click_submit()

    error_text = login_page.get_error_message()
    assert error_text is not None and len(error_text) > 0, (
        "Debería mostrarse un mensaje de error visible tras un login fallido"
    )

    # Verificar que no se redirigió
    assert "/login" in driver.current_url or driver.current_url.endswith("/"), (
        f"La URL debería seguir en /login, pero es: {driver.current_url}"
    )


# ══════════════════════════════════════════════════════════════════════════════
# SEL-E2E-03: Navegación a Laboratorios post-login
# ══════════════════════════════════════════════════════════════════════════════
def test_sel_e2e_03_navegacion_laboratorios(driver, base_url, test_credentials):
    """
    SEL-E2E-03: Verificar que tras iniciar sesión, el contenido principal carga.
    
    Flujo:
      1. Login exitoso con credenciales válidas
      2. Esperar redirección
      3. Verificar que el elemento <main> o contenido principal renderiza
      4. Verificar que hay contenido visible en la página
    """
    login_page = LoginPage(driver, base_url)
    login_page.navigate()

    login_page.enter_email(test_credentials['email'])
    login_page.enter_password(test_credentials['password'])
    login_page.click_submit()

    wait = WebDriverWait(driver, 15)
    wait.until(lambda d: "/login" not in d.current_url)

    # Esperar a que el contenido principal renderice
    try:
        # Buscar contenido del dashboard o laboratorios
        wait.until(
            lambda d: d.find_elements(By.TAG_NAME, "main")
            or d.find_elements(By.CSS_SELECTOR, "[class*='dashboard'], [class*='laboratorio']")
        )
        content_loaded = True
    except TimeoutException:
        content_loaded = False

    assert content_loaded, (
        "El contenido principal no cargó después de iniciar sesión. "
        "Verifique que el backend QA está respondiendo correctamente."
    )


# ══════════════════════════════════════════════════════════════════════════════
# SEL-E2E-04: Validación de Formulario (HTML5)
# ══════════════════════════════════════════════════════════════════════════════
def test_sel_e2e_04_validacion_formulario(driver, base_url):
    """
    SEL-E2E-04: Verificar que el formulario HTML5 impide envío con campos vacíos.
    
    Flujo:
      1. Navegar a /login
      2. Limpiar el campo de email (que viene pre-llenado)
      3. Intentar submit
      4. Verificar que el campo de email reporta validity.valid = false
    """
    login_page = LoginPage(driver, base_url)
    login_page.navigate()

    # Limpiar campos pre-llenados del formulario
    email_element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable(LoginPage.EMAIL_INPUT)
    )
    email_element.clear()

    # Intentar enviar el formulario con el campo vacío
    login_page.click_submit()

    # Verificar que la validación HTML5 marca el campo como inválido
    is_valid = driver.execute_script(
        "return document.querySelector('input[type=\"email\"]').validity.valid"
    )
    assert not is_valid, (
        "El campo de email debería ser inválido (validity.valid = false) "
        "cuando está vacío, bloqueando el envío del formulario."
    )


# ══════════════════════════════════════════════════════════════════════════════
# SEL-E2E-05: Flujo de Registro (solo verificación de UI)
# ══════════════════════════════════════════════════════════════════════════════
def test_sel_e2e_05_flujo_registro(driver, base_url):
    """
    SEL-E2E-05: Verificar que el formulario de registro renderiza y es funcional.
    
    Flujo:
      1. Navegar a /login
      2. Hacer clic en el botón de toggle ('¿No tienes cuenta? Regístrate')
      3. Verificar que aparecen los campos: email, nombre, apellido, contraseña
      4. Llenar con email aleatorio (test+{uuid}@uce.edu.ec) para evitar colisiones
      5. NO se hace submit para evitar crear usuarios reales en QA
    
    Gestión de datos: Se usa un sufijo uuid4 aleatorio para el email de prueba.
    """
    login_page = LoginPage(driver, base_url)
    login_page.navigate()

    # Cambiar a formulario de registro
    login_page.toggle_register()

    wait = WebDriverWait(driver, 10)

    # Los inputs del registro NO tienen name — se seleccionan por tipo y posición.
    # Después del toggle, el formulario cambia y tiene:
    #   - 1 input type="email" (email del registro)
    #   - 2 inputs type="text" en un grid (nombre, apellido)
    #   - 1 input type="password" (contraseña del registro)

    # Esperar a que aparezcan los campos de texto del registro (nombre/apellido)
    text_inputs = wait.until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'input[type="text"]'))
    )
    assert len(text_inputs) >= 2, (
        f"Se esperaban al menos 2 campos de texto (nombre, apellido), "
        f"pero se encontraron {len(text_inputs)}"
    )

    email_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="email"]'))
    )
    password_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="password"]'))
    )

    # Generar email aleatorio con uuid4 para evitar colisiones entre ejecuciones
    unique_suffix = str(uuid.uuid4())[:8]
    test_email = f"test+{unique_suffix}@uce.edu.ec"

    # Llenar los campos (sin hacer submit para no crear usuarios reales)
    text_inputs[0].clear()
    text_inputs[0].send_keys("TestUser")

    text_inputs[1].clear()
    text_inputs[1].send_keys("TestLastname")

    email_input.clear()
    email_input.send_keys(test_email)

    password_input.clear()
    password_input.send_keys("Password123!")

    # Verificar que los valores se ingresaron correctamente
    assert email_input.get_attribute("value") == test_email, (
        f"El campo de correo debería contener '{test_email}', "
        f"pero tiene '{email_input.get_attribute('value')}'"
    )
    assert text_inputs[0].get_attribute("value") == "TestUser", (
        "El campo de nombre debería contener 'TestUser'"
    )
