"""
Tests for the remastered Dashboard screen.

The Dashboard is the landing page after a successful login.
It shows a personalised welcome banner and quick-access tiles for core features.

Navigation notes (AppLayout):
  - Footer is static text only — there are no footer nav links.
  - The header nav contains: Dashboard, SDG Cards, Card Sort, Reflection Log,
    Progress, Resources.  Activities and Learning are NOT in the nav; they are
    accessed by direct URL navigation or from within their parent screens.
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from helpers import BASE_URL, build_driver, login


# after logging in, the dashboard should show a welcome message with the user's name
def test_dashboard_loads_after_login():
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        login(driver, wait)

        # login() already waits for /dashboard, but make the assertion explicit
        assert "/dashboard" in driver.current_url

        # welcome banner contains "Welcome back,"
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Welcome back')]")))
    finally:
        driver.quit()


# "Explore SDGs" button on the dashboard should navigate to /sdg-cards
def test_dashboard_explore_sdgs_navigates_to_sdg_cards():
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        login(driver, wait)

        explore_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Explore SDGs']")))
        explore_btn.click()

        wait.until(EC.url_contains("/sdg-cards"))
        assert "/sdg-cards" in driver.current_url
    finally:
        driver.quit()


# "View Progress" button on the dashboard should navigate to /progress
def test_dashboard_view_progress_navigates_to_progress():
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        login(driver, wait)

        progress_btn = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='View Progress']"))
        )
        progress_btn.click()

        wait.until(EC.url_contains("/progress"))
        # remastered progress page heading
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Progress Tracker')]")))
    finally:
        driver.quit()


# Activities is not in the header nav — navigate directly and verify the page loads
def test_activities_accessible_by_direct_navigation():
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        login(driver, wait)

        driver.get(f"{BASE_URL}/activities")
        wait.until(EC.url_contains("/activities"))
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Test Your Knowledge')]")))
        assert "/activities" in driver.current_url
    finally:
        driver.quit()


# Learning is not in the header nav — navigate directly and verify the page loads
def test_learning_accessible_by_direct_navigation():
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        login(driver, wait)

        driver.get(f"{BASE_URL}/learning")
        wait.until(EC.url_contains("/learning"))
        assert "/learning" in driver.current_url
    finally:
        driver.quit()
