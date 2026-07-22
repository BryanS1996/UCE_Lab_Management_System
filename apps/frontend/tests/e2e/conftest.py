import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

@pytest.fixture(scope='session')
def base_url():
    return os.environ.get('QA_FRONTEND_URL', 'http://localhost')

@pytest.fixture(scope='session')
def api_gateway_url():
    return os.environ.get('QA_API_GATEWAY_URL', 'http://localhost:3000')

@pytest.fixture(scope='session')
def test_credentials():
    return {
        'email': os.environ.get('QA_TEST_USER_EMAIL', 'test@test.com'),
        'password': os.environ.get('QA_TEST_USER_PASSWORD', 'testpass')
    }

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)

@pytest.fixture(scope='function')
def driver(request):
    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-web-security')
    
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)
    driver.set_page_load_timeout(30)
    
    yield driver
    
    if hasattr(request.node, "rep_call") and request.node.rep_call.failed:
        try:
            os.makedirs("screenshots", exist_ok=True)
            driver.save_screenshot(f"screenshots/{request.node.name}_failed.png")
        except Exception as e:
            print(f"Error taking screenshot: {e}")
            
    driver.quit()
