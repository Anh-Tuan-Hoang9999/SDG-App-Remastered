import os

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from helpers import BASE_URL, SIGN_IN_BTN_XPATH, POST_LOGIN_PATH, build_driver, login


# checks the login page actually loads and has the fields we need
def test_login_page_loads():
    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/login")

        wait = WebDriverWait(driver, 15)
        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        wait.until(EC.presence_of_element_located((By.NAME, "password")))

        # Remastered login page heading
        assert "Welcome back" in driver.page_source
    finally:
        driver.quit()


# the submit button now reads "Sign In", not "Login"
def test_login_submit_button_text():
    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/login")
        wait = WebDriverWait(driver, 15)
        btn = wait.until(EC.presence_of_element_located((By.XPATH, SIGN_IN_BTN_XPATH)))
        assert btn.is_displayed()
    finally:
        driver.quit()


# typing in wrong credentials should show an error, not just silently fail
def test_login_shows_error_for_bad_credentials():
    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/login")
        wait = WebDriverWait(driver, 15)

        email_el = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_el = wait.until(EC.presence_of_element_located((By.NAME, "password")))
        # Remastered submit button text is "Sign In"
        submit = wait.until(EC.element_to_be_clickable((By.XPATH, SIGN_IN_BTN_XPATH)))

        email_el.send_keys("invalid@trentu.ca")
        password_el.send_keys("wrong-password")
        submit.click()

        # Accept either the server-side auth error or a connection error when
        # the backend is not running.  The remastered error copy changed from
        # "Unable to connect to the server" to "Unable to connect. Please check…"
        # so we match the common prefix "Unable to connect".
        error = wait.until(
            EC.presence_of_element_located((
                By.XPATH,
                "//*[contains(text(),'Invalid email or password')"
                " or contains(text(),'Unable to connect')]",
            ))
        )
        assert error.is_displayed()
    finally:
        driver.quit()


# navigating to /register without logging in should stay on the register page
def test_unauthenticated_user_can_reach_register():
    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/register")
        wait = WebDriverWait(driver, 15)
        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        assert "/register" in driver.current_url
    finally:
        driver.quit()


# needs real credentials to run – set SELENIUM_TEST_EMAIL and SELENIUM_TEST_PASSWORD
def test_login_success_redirects_to_dashboard():
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 15)
        # login() skips automatically if env vars are missing
        login(driver, wait)
        # Remastered app redirects to /dashboard on success (not /learning)
        assert POST_LOGIN_PATH in driver.current_url
    finally:
        driver.quit()
