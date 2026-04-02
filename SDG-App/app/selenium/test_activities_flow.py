import os
import re

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


# clears localStorage before logging in so we don't carry over state from a previous test
def _login(driver: webdriver.Chrome, wait: WebDriverWait) -> None:
    email_value = os.getenv("SELENIUM_TEST_EMAIL")
    password_value = os.getenv("SELENIUM_TEST_PASSWORD")
    if not email_value or not password_value:
        pytest.skip("Set SELENIUM_TEST_EMAIL and SELENIUM_TEST_PASSWORD for activities Selenium tests.")

    driver.get("http://localhost:5173/login")
    driver.execute_script("window.localStorage.clear();")
    driver.get("http://localhost:5173/login")

    wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(email_value)
    wait.until(EC.presence_of_element_located((By.NAME, "password"))).send_keys(password_value)
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Login']"))).click()
    wait.until(EC.url_contains("/learning"))


# checks the activities page loads and has at least 10 activity cards
def test_activities_page_loads_and_lists_cards():
    driver = _build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        _login(driver, wait)

        driver.get("http://localhost:5173/activities")
        wait.until(EC.url_contains("/activities"))
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Test Your Knowledge')]")))

        links = driver.find_elements(By.XPATH, "//a[contains(@href,'/activities/')]")
        assert len(links) >= 10
    finally:
        driver.quit()


# clicking the first activity card should navigate to that SDG's levels page
def test_click_first_activity_navigates_to_levels():
    driver = _build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        _login(driver, wait)

        driver.get("http://localhost:5173/activities")
        wait.until(EC.url_contains("/activities"))
        start_url = driver.current_url

        first_link = wait.until(
            EC.presence_of_element_located((By.XPATH, "(//section//a[contains(@href,'/activities/')])[1]"))
        )
        target_href = first_link.get_attribute("href") or ""

        # pull the SDG id out of the link so we can verify we land on the right page
        match = re.search(r"/activities/(\d+)", target_href)
        assert match is not None, f"Could not parse SDG id from first link href: {target_href}"
        clicked_sdg_id = match.group(1)

        driver.execute_script("arguments[0].click();", first_link)

        def _is_clicked_levels_url(url: str) -> bool:
            if url == start_url:
                return False
            return re.search(rf"/activities/{clicked_sdg_id}/?$", url) is not None

        wait.until(lambda d: _is_clicked_levels_url(d.current_url))

        assert _is_clicked_levels_url(driver.current_url)
        wait.until(
            EC.presence_of_element_located(
                (By.XPATH, f"//*[contains(@class,'rounded-xl') and normalize-space()='{clicked_sdg_id}']")
            )
        )
    finally:
        driver.quit()