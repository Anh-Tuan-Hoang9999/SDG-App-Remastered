import os

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


# checks the login page actually loads and has the fields we need
def test_login_page_loads():
    driver = webdriver.Chrome()
    try:
        driver.get("http://localhost:5173/login")

        wait = WebDriverWait(driver, 15)
        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        wait.until(EC.presence_of_element_located((By.NAME, "password")))

        assert "Sustainable Development Goals" in driver.page_source
    finally:
        driver.quit()


# typing in wrong credentials should show an error, not just silently fail
def test_login_shows_error_for_bad_credentials():
    driver = webdriver.Chrome()
    try:
        driver.get("http://localhost:5173/login")
        wait = WebDriverWait(driver, 15)

        email = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password = wait.until(EC.presence_of_element_located((By.NAME, "password")))
        submit = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Login']")))

        email.send_keys("invalid@trentu.ca")
        password.send_keys("wrong-password")
        submit.click()

        # accept either the server error or a connection error if the backend isn't running
        error = wait.until(
            EC.presence_of_element_located((
                By.XPATH,
                "//*[contains(text(),'Invalid email or password') or contains(text(),'Unable to connect to the server')]",
            ))
        )
        assert error.is_displayed()
    finally:
        driver.quit()


# needs real credentials to run - set SELENIUM_TEST_EMAIL and SELENIUM_TEST_PASSWORD in your env
def test_login_success_redirects_to_learning():
    email_value = os.getenv("SELENIUM_TEST_EMAIL")
    password_value = os.getenv("SELENIUM_TEST_PASSWORD")
    if not email_value or not password_value:
        pytest.skip("Set SELENIUM_TEST_EMAIL and SELENIUM_TEST_PASSWORD to run this test.")

    driver = webdriver.Chrome()
    try:
        driver.get("http://localhost:5173/login")
        wait = WebDriverWait(driver, 15)

        email = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password = wait.until(EC.presence_of_element_located((By.NAME, "password")))
        submit = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Login']")))

        email.send_keys(email_value)
        password.send_keys(password_value)
        submit.click()

        # after a successful login the app should redirect to /learning
        wait.until(EC.url_contains("/learning"))
        assert "/learning" in driver.current_url
    finally:
        driver.quit()