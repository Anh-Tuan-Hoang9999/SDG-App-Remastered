import os
import time

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


# checks the register page loads and has all the fields we need
def test_register_page_loads():
    driver = webdriver.Chrome()
    try:
        driver.get("http://localhost:5173/register")
        wait = WebDriverWait(driver, 15)

        wait.until(EC.presence_of_element_located((By.NAME, "name")))
        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        wait.until(EC.presence_of_element_located((By.NAME, "password")))
        wait.until(EC.presence_of_element_located((By.NAME, "confirmPassword")))

        assert "Register" in driver.page_source
    finally:
        driver.quit()


# mismatched passwords should show an error before even hitting the server
def test_register_shows_password_mismatch_error():
    driver = webdriver.Chrome()
    try:
        driver.get("http://localhost:5173/register")
        wait = WebDriverWait(driver, 15)

        wait.until(EC.presence_of_element_located((By.NAME, "name"))).send_keys("Selenium User")
        wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys("selenium_user@trentu.ca")
        wait.until(EC.presence_of_element_located((By.NAME, "password"))).send_keys("Password123!")
        wait.until(EC.presence_of_element_located((By.NAME, "confirmPassword"))).send_keys("Different123!")

        submit = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Create Account']")))
        submit.click()

        error = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Passwords do not match')]")))
        assert error.is_displayed()
    finally:
        driver.quit()


# clicking "Or Login Here" should take you back to the login page
def test_register_link_navigates_to_login():
    driver = webdriver.Chrome()
    try:
        driver.get("http://localhost:5173/register")
        wait = WebDriverWait(driver, 15)

        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Or Login Here")))
        login_link.click()

        wait.until(EC.url_contains("/login"))
        assert "/login" in driver.current_url
    finally:
        driver.quit()


# only runs when SELENIUM_RUN_REGISTER_SUCCESS=1 since it creates a real user in the db
def test_register_success_redirects_to_login():
    if os.getenv("SELENIUM_RUN_REGISTER_SUCCESS") != "1":
        pytest.skip("Set SELENIUM_RUN_REGISTER_SUCCESS=1 to run backend registration flow.")

    driver = webdriver.Chrome()
    try:
        driver.get("http://localhost:5173/register")
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

        submit = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Create Account']")))
        submit.click()

        # successful registration should redirect to login
        wait.until(EC.url_contains("/login"))
        assert "/login" in driver.current_url
    finally:
        driver.quit()