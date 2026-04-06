import re

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from helpers import BASE_URL, build_driver, login


# checks the activities page loads and has at least 10 activity cards
def test_activities_page_loads_and_lists_cards():
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        login(driver, wait)

        driver.get(f"{BASE_URL}/activities")
        wait.until(EC.url_contains("/activities"))
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Test Your Knowledge')]")))

        links = driver.find_elements(By.XPATH, "//a[contains(@href,'/activities/')]")
        assert len(links) >= 10
    finally:
        driver.quit()


# clicking the first activity card should navigate to that SDG's levels page
def test_click_first_activity_navigates_to_levels():
    driver = build_driver()
    try:
        wait = WebDriverWait(driver, 20)
        login(driver, wait)

        driver.get(f"{BASE_URL}/activities")
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
