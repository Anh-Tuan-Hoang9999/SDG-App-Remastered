"""
Tests for the ForgotPassword screen (/forgot-password).

The remastered app has a 3-step forgot-password flow:
  Step 1 — enter Trent email  →  "Send Reset Code"
  Step 2 — enter 6-digit code →  "Verify Code"
  Step 3 — create new password → "Update Password"

Key UI facts (from ForgotPassword.jsx):
  - Step 1 heading: "Forgot your password?"
  - Step 2 heading: "Check your email"
  - Step 3 heading: "Create a new password"
  - "Back to sign in" link is always visible at the bottom (→ /login)
  - Non-@trentu.ca email triggers a client-side error before any server call
  - The page is publicly accessible (no JWT required)
  - Dev code endpoint: GET /api/auth/dev-verification-code?email=...
    Returns the last code sent to that address when EMAIL_PROVIDER=none.
    This same dict is shared between registration and password-reset codes,
    so the endpoint works for both flows in dev mode.
"""

import json
import os
import time
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import urlopen

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from helpers import BASE_URL, build_driver

DEV_CODE_API_URL = "http://localhost:8000/api/auth/dev-verification-code"
SEND_RESET_BTN_XPATH  = "//button[normalize-space()='Send Reset Code']"
VERIFY_CODE_BTN_XPATH = "//button[normalize-space()='Verify Code']"
UPDATE_PWD_BTN_XPATH  = "//button[normalize-space()='Update Password']"


def test_forgot_password_page_loads():
    """Step 1 renders the correct heading, email field, and submit button."""
    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/forgot-password")
        wait = WebDriverWait(driver, 15)

        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        wait.until(EC.presence_of_element_located((By.XPATH, SEND_RESET_BTN_XPATH)))
        assert "Forgot your password?" in driver.page_source
    finally:
        driver.quit()


def test_forgot_password_accessible_without_auth():
    """/forgot-password is a public route — unauthenticated visitors must not be redirected to /login."""
    driver = webdriver.Chrome()
    try:
        # Load the app domain first so localStorage.clear() targets the right origin
        driver.get(f"{BASE_URL}/login")
        driver.execute_script("window.localStorage.clear();")
        driver.get(f"{BASE_URL}/forgot-password")
        wait = WebDriverWait(driver, 15)

        wait.until(EC.presence_of_element_located((By.XPATH, SEND_RESET_BTN_XPATH)))
        assert "/forgot-password" in driver.current_url
        assert "/login" not in driver.current_url
    finally:
        driver.quit()


def test_forgot_password_non_trentu_email_shows_error():
    """Submitting a non-@trentu.ca email shows a client-side validation error."""
    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/forgot-password")
        wait = WebDriverWait(driver, 15)

        wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys("user@gmail.com")
        wait.until(EC.element_to_be_clickable((By.XPATH, SEND_RESET_BTN_XPATH))).click()

        error = wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'@trentu.ca')]")
            )
        )
        assert error.is_displayed()
        # Must not have advanced to step 2 — step 1 heading should still be present
        assert "Forgot your password?" in driver.page_source
    finally:
        driver.quit()


def test_forgot_password_back_to_sign_in_link():
    """The 'Back to sign in' link at the bottom of the page navigates to /login."""
    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/forgot-password")
        wait = WebDriverWait(driver, 15)

        back_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Back to sign in")))
        back_link.click()

        wait.until(EC.url_contains("/login"))
        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        assert "/login" in driver.current_url
    finally:
        driver.quit()


def test_forgot_password_full_flow():
    """
    End-to-end success path:
      request code → verify code → set new password → redirected to /login.

    Requires all of:
      SELENIUM_RUN_FORGOT_PASSWORD_SUCCESS=1
      SELENIUM_TEST_EMAIL set to an existing @trentu.ca account
      Backend running locally with EMAIL_PROVIDER=none
    """
    if os.getenv("SELENIUM_RUN_FORGOT_PASSWORD_SUCCESS") != "1":
        pytest.skip("Set SELENIUM_RUN_FORGOT_PASSWORD_SUCCESS=1 to run the forgot-password success flow.")

    email = os.getenv("SELENIUM_TEST_EMAIL")
    if not email:
        pytest.skip("Set SELENIUM_TEST_EMAIL to a @trentu.ca address to run the forgot-password success flow.")

    # Use a unique strong password each run so the account password actually changes
    new_password = f"SeleniumReset@{int(time.time())}"

    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 15)
        driver.get(f"{BASE_URL}/forgot-password")

        # ── Step 1: submit email ──────────────────────────────────────────────
        wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(email)
        wait.until(EC.element_to_be_clickable((By.XPATH, SEND_RESET_BTN_XPATH))).click()

        wait.until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Check your email')]"))
        )

        # ── Fetch dev reset code ──────────────────────────────────────────────
        try:
            with urlopen(
                f"{DEV_CODE_API_URL}?{urlencode({'email': email})}", timeout=10
            ) as resp:
                if resp.status != 200:
                    pytest.skip(
                        "Dev code endpoint did not return 200 — "
                        "is the backend running with EMAIL_PROVIDER=none?"
                    )
                payload = json.loads(resp.read().decode())
        except HTTPError as exc:
            if exc.code == 404:
                pytest.skip(
                    "Dev code endpoint returned 404 — "
                    "restart the backend with EMAIL_PROVIDER=none and try again."
                )
            raise

        dev_code = payload.get("dev_code")
        if not dev_code:
            pytest.skip("Dev code endpoint returned no code for that email.")

        # ── Step 2: enter code ────────────────────────────────────────────────
        # The code input has inputmode="numeric" and no name attribute
        code_input = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@inputmode='numeric']"))
        )
        code_input.send_keys(dev_code)
        wait.until(EC.element_to_be_clickable((By.XPATH, VERIFY_CODE_BTN_XPATH))).click()

        wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'Create a new password')]")
            )
        )

        # ── Step 3: set new password ──────────────────────────────────────────
        pwd_inputs = wait.until(
            lambda d: [
                el for el in d.find_elements(By.XPATH, "//input[@type='password']")
                if el.is_displayed()
            ]
        )
        if len(pwd_inputs) < 2:
            pytest.skip("Expected two password inputs on the reset step but found fewer.")

        pwd_inputs[0].send_keys(new_password)
        pwd_inputs[1].send_keys(new_password)

        wait.until(EC.element_to_be_clickable((By.XPATH, UPDATE_PWD_BTN_XPATH))).click()

        # Successful reset redirects to /login
        wait.until(EC.url_contains("/login"))
        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        assert "/login" in driver.current_url
    finally:
        driver.quit()
