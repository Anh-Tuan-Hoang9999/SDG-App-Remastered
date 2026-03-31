import os
import time

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


# disable the password manager popup so it doesn't block the tests
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


# pulls credentials from env variables, skips the test if they're not set
def _get_credentials() -> tuple[str, str]:
    email_value = os.getenv("SELENIUM_TEST_EMAIL")
    password_value = os.getenv("SELENIUM_TEST_PASSWORD")
    if not email_value or not password_value:
        pytest.skip("Set SELENIUM_TEST_EMAIL and SELENIUM_TEST_PASSWORD for profile/auth Selenium tests.")
    return email_value, password_value


# clears localStorage before logging in so we don't carry over state from a previous test
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


# logout button can be tricky to click so we retry a few times and accept either a redirect or the login form appearing
def _click_logout_reliably(driver: webdriver.Chrome, wait: WebDriverWait) -> None:
    logout_xpath = "//button[normalize-space()='Logout' or normalize-space()='Log out']"

    for _ in range(4):
        btn = wait.until(EC.presence_of_element_located((By.XPATH, logout_xpath)))
        try:
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
            btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", btn)

        if "/login" in driver.current_url:
            return
        if driver.find_elements(By.NAME, "email"):
            return
        time.sleep(0.4)


# after logging in, the profile page should show the user's email
def test_profile_after_login_displays_user_info():
    driver = _build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        email_value, _ = _login(driver, wait)

        driver.get("http://localhost:5173/profile")
        wait.until(EC.url_contains("/profile"))

        wait.until(EC.presence_of_element_located((By.XPATH, "//button[normalize-space()='Logout']")))
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Email:')]")))

        assert email_value in driver.page_source
    finally:
        driver.quit()


# logging out should redirect to login and block access to the profile page
def test_logout_redirects_to_login_and_blocks_profile():
    driver = _build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        _login(driver, wait)

        driver.get("http://localhost:5173/profile")
        wait.until(EC.url_contains("/profile"))

        _click_logout_reliably(driver, wait)
        wait.until(lambda d: "/login" in d.current_url or len(d.find_elements(By.NAME, "email")) > 0)

        # try to go back to profile after logging out, should get kicked to login
        driver.get("http://localhost:5173/profile")
        wait.until(EC.url_contains("/login"))
        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        assert "/login" in driver.current_url
    finally:
        driver.quit()


# saving settings should navigate back to profile and show updated name
def test_settings_save_success_updates_profile():
    driver = _build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        _login(driver, wait)

        driver.get("http://localhost:5173/settings")
        wait.until(EC.url_contains("/settings"))
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'User Settings')]")))

        new_name = f"Selenium {int(time.time())}"
        # the name input is the text input that follows the "Name" label
        name_input = wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//label[normalize-space()='Name']/following-sibling::input[1]")
            )
        )
        driver.execute_script(
            """
            const el = arguments[0];
            const val = arguments[1];
            el.focus();
            const setter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              'value'
            ).set;
            setter.call(el, val);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            """,
            name_input,
            new_name,
        )
        wait.until(
            lambda d: d.find_element(
                By.XPATH, "//label[normalize-space()='Name']/following-sibling::input[1]"
            ).get_attribute("value") == new_name
        )

        save_btn = wait.until(EC.presence_of_element_located((By.XPATH, "//button[normalize-space()='Save Changes']")))
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", save_btn)
        try:
            wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Save Changes']")))
            save_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", save_btn)

        # dismiss the success alert then wait for profile redirect
        try:
            alert = WebDriverWait(driver, 4).until(EC.alert_is_present())
            alert.accept()
        except Exception:
            pass

        wait.until(EC.url_contains("/profile"))
        assert new_name in driver.page_source
    finally:
        driver.quit()
