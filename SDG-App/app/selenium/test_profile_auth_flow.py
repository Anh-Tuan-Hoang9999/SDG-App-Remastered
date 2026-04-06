import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from helpers import BASE_URL, build_driver, login, open_profile_menu


# after logging in, the profile page should show the user's email
def test_profile_after_login_displays_user_info():
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        email_value, _ = login(driver, wait)

        driver.get(f"{BASE_URL}/profile")
        wait.until(EC.url_contains("/profile"))

        # Profile page has an "Edit Profile" button and an "Email" info row
        wait.until(EC.presence_of_element_located((By.XPATH, "//button[normalize-space()='Edit Profile']")))
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Email')]")))

        assert email_value in driver.page_source
    finally:
        driver.quit()


# logging out should redirect to login and block access to the profile page
def test_logout_redirects_to_login_and_blocks_profile():
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        email_value, _ = login(driver, wait)

        driver.get(f"{BASE_URL}/profile")
        wait.until(EC.url_contains("/profile"))

        # The logout button lives inside the nav dropdown — open it first
        open_profile_menu(driver, wait, email_value)

        # The remastered top nav uses "Log out" (not "Logout")
        logout_btn = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Log out']"))
        )
        try:
            logout_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", logout_btn)

        wait.until(lambda d: "/login" in d.current_url or len(d.find_elements(By.NAME, "email")) > 0)

        # try to go back to profile after logging out — should get kicked to login
        driver.get(f"{BASE_URL}/profile")
        wait.until(EC.url_contains("/login"))
        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        assert "/login" in driver.current_url
    finally:
        driver.quit()


# saving settings should show an inline success message (no alert or redirect)
def test_settings_save_success_updates_profile():
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        login(driver, wait)

        driver.get(f"{BASE_URL}/settings")
        wait.until(EC.url_contains("/settings"))

        # Remastered settings page heading is "Edit Profile" (not "User Settings")
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Edit Profile')]")))

        new_name = f"Selenium {int(time.time())}"

        # The name input follows the "Display Name" label (was "Name" in old UI)
        name_input = wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//label[normalize-space()='Display Name']/following-sibling::input[1]")
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
                By.XPATH, "//label[normalize-space()='Display Name']/following-sibling::input[1]"
            ).get_attribute("value") == new_name
        )

        save_btn = wait.until(EC.presence_of_element_located((By.XPATH, "//button[normalize-space()='Save Changes']")))
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", save_btn)
        try:
            wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Save Changes']")))
            save_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", save_btn)

        # Remastered settings page shows an inline success message — no browser alert,
        # no redirect.  The page stays on /settings.
        wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'Profile updated successfully')]")
            )
        )

        # Navigate to profile to confirm the updated name is now visible.
        # Profile is lazy-loaded (Suspense) so wait for the "Edit Profile" button
        # — which is only rendered after the component mounts — before reading
        # page_source.  Without this wait, page_source captures the Suspense
        # spinner ("Loading…") instead of the rendered profile content.
        driver.get(f"{BASE_URL}/profile")
        wait.until(EC.url_contains("/profile"))
        wait.until(EC.presence_of_element_located((By.XPATH, "//button[normalize-space()='Edit Profile']")))
        assert new_name in driver.page_source
    finally:
        driver.quit()
