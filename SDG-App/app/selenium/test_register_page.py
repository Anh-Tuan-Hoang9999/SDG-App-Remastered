import os
import time
import json
from urllib.parse import urlencode
from urllib.error import HTTPError
from urllib.request import urlopen

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from helpers import BASE_URL

SEND_CODE_BTN_XPATH = "//button[normalize-space()='Send Verification Code']"
VERIFY_CREATE_BTN_XPATH = "//button[normalize-space()='Verify & Create Account']"
DEV_CODE_API_URL = "http://localhost:8000/api/auth/dev-verification-code"


# checks the register page loads and has all the fields we need
def test_register_page_loads():
    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/register")
        wait = WebDriverWait(driver, 15)

        wait.until(EC.presence_of_element_located((By.NAME, "name")))
        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        wait.until(EC.presence_of_element_located((By.NAME, "password")))
        wait.until(EC.presence_of_element_located((By.NAME, "confirmPassword")))

        # Remastered register page heading
        assert "Create your account" in driver.page_source
    finally:
        driver.quit()


# mismatched passwords should show an error before even hitting the server
def test_register_shows_password_mismatch_error():
    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/register")
        wait = WebDriverWait(driver, 15)

        wait.until(EC.presence_of_element_located((By.NAME, "name"))).send_keys("Selenium User")
        wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys("selenium_user@trentu.ca")
        wait.until(EC.presence_of_element_located((By.NAME, "password"))).send_keys("Password123!")
        wait.until(EC.presence_of_element_located((By.NAME, "confirmPassword"))).send_keys("Different123!")

        submit = wait.until(EC.element_to_be_clickable((By.XPATH, SEND_CODE_BTN_XPATH)))
        submit.click()

        error = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Passwords do not match')]")))
        assert error.is_displayed()
    finally:
        driver.quit()


# clicking "Sign in" should take you back to the login page
# (old link text was "Or Login Here" — remastered copy is simply "Sign in")
def test_register_link_navigates_to_login():
    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/register")
        wait = WebDriverWait(driver, 15)

        # Remastered register page uses "Sign in" as the back-to-login link text
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Sign in")))
        login_link.click()

        wait.until(EC.url_contains("/login"))
        assert "/login" in driver.current_url
    finally:
        driver.quit()


# only runs when SELENIUM_RUN_REGISTER_SUCCESS=1 and a real 6-digit verification code is provided
def test_register_success_redirects_to_login():
    if os.getenv("SELENIUM_RUN_REGISTER_SUCCESS") != "1":
        pytest.skip("Set SELENIUM_RUN_REGISTER_SUCCESS=1 to run backend registration flow.")

    driver = webdriver.Chrome()
    try:
        driver.get(f"{BASE_URL}/register")
        wait = WebDriverWait(driver, 15)

        # use a timestamp to make sure the email is unique each run
        unique = str(int(time.time()))
        name = f"Selenium {unique}"
        email = f"selenium_{unique}@trentu.ca"
        password = "Selenium@12345"

        wait.until(EC.presence_of_element_located((By.NAME, "name"))).send_keys(name)
        wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(email)
        wait.until(EC.presence_of_element_located((By.NAME, "password"))).send_keys(password)
        wait.until(EC.presence_of_element_located((By.NAME, "confirmPassword"))).send_keys(password)

        send_code = wait.until(EC.element_to_be_clickable((By.XPATH, SEND_CODE_BTN_XPATH)))
        send_code.click()

        wait.until(EC.presence_of_element_located((By.NAME, "verificationCode")))
        try:
            with urlopen(f"{DEV_CODE_API_URL}?{urlencode({'email': email})}", timeout=10) as response:
                if response.status != 200:
                    pytest.skip(
                        "Register success Selenium flow requires local EMAIL_PROVIDER=none and the dev code endpoint."
                    )
                payload = json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            if exc.code == 404:
                pytest.skip(
                    "Restart the local backend to load the dev verification-code endpoint, then rerun this Selenium test."
                )
            raise

        verification_code = payload.get("dev_code")
        if not verification_code:
            pytest.skip(
                "Register success Selenium flow requires the backend dev code endpoint to return a code."
            )

        wait.until(EC.presence_of_element_located((By.NAME, "verificationCode"))).send_keys(verification_code)
        verify_submit = wait.until(EC.element_to_be_clickable((By.XPATH, VERIFY_CREATE_BTN_XPATH)))
        verify_submit.click()

        # successful registration should redirect to login
        wait.until(EC.url_contains("/login"))
        assert "/login" in driver.current_url
    finally:
        driver.quit()
