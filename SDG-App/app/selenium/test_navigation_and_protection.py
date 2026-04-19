from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from helpers import BASE_URL


# clicking "Create account" on the login page should navigate to /register
# (old link text was "Or Create Account" — remastered copy is "Create account")
def test_login_link_navigates_to_register():
    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/login")
        wait = WebDriverWait(driver, 15)

        # Remastered login page uses "Create account" as the register link text
        register_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Create account")))
        register_link.click()

        wait.until(EC.url_contains("/register"))
        assert "/register" in driver.current_url
    finally:
        driver.quit()


# trying to access /learning without being logged in should kick you to login
def test_protected_learning_redirects_to_login_when_not_authenticated():
    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/learning")
        wait = WebDriverWait(driver, 15)

        wait.until(EC.url_contains("/login"))
        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        assert "/login" in driver.current_url
    finally:
        driver.quit()


# trying to access /dashboard without being logged in should also redirect to login
def test_protected_dashboard_redirects_to_login_when_not_authenticated():
    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/dashboard")
        wait = WebDriverWait(driver, 15)

        wait.until(EC.url_contains("/login"))
        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        assert "/login" in driver.current_url
    finally:
        driver.quit()


# trying to access /profile without being logged in should also redirect to login
def test_protected_profile_redirects_to_login_when_not_authenticated():
    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/profile")
        wait = WebDriverWait(driver, 15)

        wait.until(EC.url_contains("/login"))
        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        assert "/login" in driver.current_url
    finally:
        driver.quit()


# /forgot-password is a public route — unauthenticated users must be able to reach it
def test_forgot_password_page_accessible_without_auth():
    driver = webdriver.Chrome()
    try:
        # Navigate to the app domain first so localStorage.clear() targets localhost:5173
        driver.get(f"{BASE_URL}/login")
        driver.execute_script("window.localStorage.clear();")
        driver.get(f"{BASE_URL}/forgot-password")
        wait = WebDriverWait(driver, 15)

        wait.until(EC.presence_of_element_located((By.XPATH, "//button[normalize-space()='Send Reset Code']")))
        assert "/forgot-password" in driver.current_url
        assert "/login" not in driver.current_url
    finally:
        driver.quit()


# clicking "Forgot Password?" on the login page should navigate to /forgot-password
def test_login_forgot_password_link_navigates():
    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/login")
        wait = WebDriverWait(driver, 15)

        # Login.jsx renders <Link to="/forgot-password">Forgot Password?</Link>
        link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Forgot Password?")))
        link.click()

        wait.until(EC.url_contains("/forgot-password"))
        wait.until(EC.presence_of_element_located((By.XPATH, "//button[normalize-space()='Send Reset Code']")))
        assert "/forgot-password" in driver.current_url
    finally:
        driver.quit()
