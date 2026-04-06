"""
Tests for AppLayout navigation.

The remastered app uses AppLayout (Layout.jsx) for all authenticated routes.
Key structural facts:
  - Avatar button: aria-label="Open navigation menu" (NOT "Account menu")
  - Dropdown contains: Profile, Settings, Log out (plus nav items on mobile)
  - Desktop header nav items: Dashboard, SDG Cards, Card Sort, Reflection Log,
    Progress, Resources  — NOTE: Activities and Learning are NOT in the header nav
  - Footer: static text only; no NavLink spans
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from helpers import BASE_URL, build_driver, login, open_profile_menu


def test_top_nav_profile_button_opens_profile_screen():
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        email_value, _ = login(driver, wait)

        open_profile_menu(driver, wait, email_value)
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Profile']"))).click()

        wait.until(EC.url_contains("/profile"))
        # wait for the lazy-loaded profile content before checking page_source
        wait.until(EC.presence_of_element_located((By.XPATH, "//button[normalize-space()='Edit Profile']")))
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Email')]")))
        assert email_value in driver.page_source
    finally:
        driver.quit()


def test_top_nav_settings_button_opens_settings_screen():
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        email_value, _ = login(driver, wait)

        open_profile_menu(driver, wait, email_value)
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Settings']"))).click()

        wait.until(EC.url_contains("/settings"))
        # Remastered settings page heading is "Edit Profile"
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Edit Profile')]")))
        # Remastered label is "Display Name"
        wait.until(EC.presence_of_element_located((By.XPATH, "//label[normalize-space()='Display Name']")))
        wait.until(EC.presence_of_element_located((By.XPATH, "//button[normalize-space()='Save Changes']")))
    finally:
        driver.quit()


def test_top_nav_logout_from_dropdown():
    """Open the profile dropdown and use the Log out button to end the session."""
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        email_value, _ = login(driver, wait)

        open_profile_menu(driver, wait, email_value)

        # AppLayout uses "Log out" (two words)
        logout_btn = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Log out']"))
        )
        try:
            logout_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", logout_btn)

        wait.until(EC.url_contains("/login"))
        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        assert "/login" in driver.current_url
    finally:
        driver.quit()


def test_header_nav_reaches_progress():
    """
    The AppLayout desktop header nav contains a 'Progress' link.
    Clicking it should navigate to /progress and show the Progress Tracker heading.
    """
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        login(driver, wait)

        # Desktop header nav: find the link that contains the text "Progress"
        # The nav uses <Link to="/progress"><button>...<Icon/>Progress</button></Link>
        # Target the <a> ancestor of the button that contains "Progress" text
        progress_link = wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//header//a[@href='/progress']")
            )
        )
        progress_link.click()

        wait.until(EC.url_contains("/progress"))
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Progress Tracker')]")))
    finally:
        driver.quit()


def test_header_nav_reaches_dashboard():
    """Clicking the 'Dashboard' link in the header nav navigates to /dashboard."""
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        login(driver, wait)

        # Navigate away first so the Dashboard link is not already active
        driver.get(f"{BASE_URL}/progress")
        wait.until(EC.url_contains("/progress"))

        dash_link = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//header//a[@href='/dashboard']"))
        )
        dash_link.click()

        wait.until(EC.url_contains("/dashboard"))
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Welcome back')]")))
    finally:
        driver.quit()
