import os

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def _build_driver() -> webdriver.Chrome:
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


def _get_credentials() -> tuple[str, str]:
    email_value = os.getenv("SELENIUM_TEST_EMAIL")
    password_value = os.getenv("SELENIUM_TEST_PASSWORD")
    if not email_value or not password_value:
        pytest.skip("Set SELENIUM_TEST_EMAIL and SELENIUM_TEST_PASSWORD for top-nav/footer Selenium tests.")
    return email_value, password_value


def _login(driver: webdriver.Chrome, wait: WebDriverWait) -> tuple[str, str]:
    email_value, password_value = _get_credentials()

    driver.get("http://localhost:5173/login")
    driver.execute_script("window.localStorage.clear();")
    driver.get("http://localhost:5173/login")

    wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(email_value)
    wait.until(EC.presence_of_element_located((By.NAME, "password"))).send_keys(password_value)
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Login']"))).click()
    wait.until(EC.url_contains("/learning"))
    return email_value, password_value


def _open_profile_menu(driver: webdriver.Chrome, wait: WebDriverWait, email_value: str) -> None:
    menu_button = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//header//button[contains(@class,'rounded-xl')]"))
    )
    menu_button.click()
    wait.until(EC.presence_of_element_located((By.XPATH, f"//*[contains(text(),'{email_value}')]")))


def test_top_nav_profile_button_opens_profile_screen():
    driver = _build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        email_value, _ = _login(driver, wait)

        _open_profile_menu(driver, wait, email_value)
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Profile']"))).click()

        wait.until(EC.url_contains("/profile"))
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Email:')]")))
        assert email_value in driver.page_source
    finally:
        driver.quit()


def test_top_nav_settings_button_opens_settings_screen():
    driver = _build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        email_value, _ = _login(driver, wait)

        _open_profile_menu(driver, wait, email_value)
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Settings']"))).click()

        wait.until(EC.url_contains("/settings"))
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'User Settings')]")))
        wait.until(EC.presence_of_element_located((By.XPATH, "//label[normalize-space()='Name']")))
        wait.until(EC.presence_of_element_located((By.XPATH, "//button[normalize-space()='Save Changes']")))
    finally:
        driver.quit()


def test_footer_navigation_reaches_activities_and_progress():
    driver = _build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        _login(driver, wait)

        wait.until(EC.element_to_be_clickable((By.XPATH, "//span[normalize-space()='Activities']/ancestor::a[1]"))).click()
        wait.until(EC.url_contains("/activities"))
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Test Your Knowledge')]")))

        wait.until(EC.element_to_be_clickable((By.XPATH, "//span[normalize-space()='Progress']/ancestor::a[1]"))).click()
        wait.until(EC.url_contains("/progress"))
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Under Development')]")))
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'work in progress')]")))
    finally:
        driver.quit()
