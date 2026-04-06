"""
Shared helpers for Selenium tests.

Usage:
    from helpers import BASE_URL, build_driver, login, open_profile_menu
"""

import os

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

BASE_URL = "http://localhost:5173"

# Remastered UI uses "Sign In", not "Login"
SIGN_IN_BTN_XPATH = "//button[normalize-space()='Sign In']"

# After a successful login the app redirects to /dashboard
POST_LOGIN_PATH = "/dashboard"


def build_driver() -> webdriver.Chrome:
    """Return a Chrome driver with the password-manager popup suppressed."""
    options = webdriver.ChromeOptions()
    options.add_experimental_option(
        "prefs",
        {
            "credentials_enable_service": False,
            "profile.password_manager_enabled": False,
        },
    )
    options.add_argument("--disable-notifications")
    return webdriver.Chrome(options=options)


def login(
    driver: webdriver.Chrome,
    wait: WebDriverWait,
    *,
    skip_msg: str = (
        "Set SELENIUM_TEST_EMAIL and SELENIUM_TEST_PASSWORD to run this test."
    ),
) -> tuple[str, str]:
    """
    Log in using SELENIUM_TEST_EMAIL / SELENIUM_TEST_PASSWORD env vars.

    - Clears localStorage first so no stale session bleeds across tests.
    - Waits for the post-login redirect to /dashboard.
    - Returns (email, password); skips the test if env vars are not set.
    """
    email_value = os.getenv("SELENIUM_TEST_EMAIL")
    password_value = os.getenv("SELENIUM_TEST_PASSWORD")
    if not email_value or not password_value:
        pytest.skip(skip_msg)

    driver.get(f"{BASE_URL}/login")
    driver.execute_script("window.localStorage.clear();")
    driver.get(f"{BASE_URL}/login")

    wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(email_value)
    wait.until(EC.presence_of_element_located((By.NAME, "password"))).send_keys(password_value)
    wait.until(EC.element_to_be_clickable((By.XPATH, SIGN_IN_BTN_XPATH))).click()
    wait.until(EC.url_contains(POST_LOGIN_PATH))

    return email_value, password_value


def open_profile_menu(
    driver: webdriver.Chrome,
    wait: WebDriverWait,
    email_value: str,
) -> None:
    """
    Click the avatar button in the top nav to open the profile dropdown,
    then wait until the user's email is visible inside the menu.

    The actual layout (AppLayout / Layout.jsx) uses aria-label="Open navigation menu"
    on the avatar button — not "Account menu".  Use that stable attribute rather than
    a brittle class-name selector.
    """
    menu_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Open navigation menu']"))
    )
    menu_btn.click()
    wait.until(
        EC.presence_of_element_located((By.XPATH, f"//*[contains(text(),'{email_value}')]"))
    )
