from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


# clicking "Or Create Account" on the login page should take you to the register page
def test_login_link_navigates_to_register():
    driver = webdriver.Chrome()
    try:
        driver.get("http://localhost:5173/login")
        wait = WebDriverWait(driver, 15)

        register_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Or Create Account")))
        register_link.click()

        wait.until(EC.url_contains("/register"))
        assert "/register" in driver.current_url
    finally:
        driver.quit()


# trying to access /learning without being logged in should kick you to login
def test_protected_learning_redirects_to_login_when_not_authenticated():
    driver = webdriver.Chrome()
    try:
        driver.get("http://localhost:5173/learning")
        wait = WebDriverWait(driver, 15)

        wait.until(EC.url_contains("/login"))
        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        assert "/login" in driver.current_url
    finally:
        driver.quit()