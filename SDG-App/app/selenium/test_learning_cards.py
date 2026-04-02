import random
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


# logs in and navigates to the learning page, skips if no credentials are set
def _login_and_open_learning(driver: webdriver.Chrome) -> WebDriverWait:
    email_value = os.getenv("SELENIUM_TEST_EMAIL")
    password_value = os.getenv("SELENIUM_TEST_PASSWORD")
    if not email_value or not password_value:
        pytest.skip("Set SELENIUM_TEST_EMAIL and SELENIUM_TEST_PASSWORD to run learning-card tests.")

    wait = WebDriverWait(driver, 20)
    driver.get("http://localhost:5173/login")

    wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(email_value)
    wait.until(EC.presence_of_element_located((By.NAME, "password"))).send_keys(password_value)
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Login']"))).click()
    wait.until(EC.url_contains("/learning"))
    return wait


# pulls the current slide index and total number of slides from the swiper instance
def _active_index_and_total(driver: webdriver.Chrome) -> tuple[int, int]:
    index, total = driver.execute_script(
        """
        const el = document.querySelector('.mySwiper');
        if (!el || !el.swiper) return [-1, -1];
        return [el.swiper.activeIndex, el.swiper.slides.length];
        """
    )
    return int(index), int(total)


# slides the swiper left or right using the swiper API directly
def _slide(driver: webdriver.Chrome, direction: str) -> None:
    if direction not in {"next", "prev"}:
        raise ValueError("direction must be 'next' or 'prev'")
    driver.execute_script(
        """
        const dir = arguments[0];
        const el = document.querySelector('.mySwiper');
        if (!el || !el.swiper) return;
        if (dir === 'next') el.swiper.slideNext(150);
        else el.swiper.slidePrev(150);
        """,
        direction,
    )


# slides and waits for the index to actually update before moving on
def _slide_and_wait(driver: webdriver.Chrome, wait: WebDriverWait, direction: str) -> None:
    before_index, total = _active_index_and_total(driver)
    if direction == "next":
        expected = min(before_index + 1, total - 1)
    elif direction == "prev":
        expected = max(before_index - 1, 0)
    else:
        raise ValueError("direction must be 'next' or 'prev'")

    _slide(driver, direction)
    wait.until(lambda d: _active_index_and_total(d)[0] == expected)


# clicks the active card to flip it, retries once if the first click doesn't register
def _toggle_flip_active_card(wait: WebDriverWait, driver: webdriver.Chrome) -> None:
    card_xpath = "//*[contains(@class,'swiper-slide-active')]//*[contains(@class,'cardInner')]"
    card = wait.until(EC.presence_of_element_located((By.XPATH, card_xpath)))
    before_class = card.get_attribute("class") or ""
    want_flipped = "flipped" not in before_class

    driver.execute_script("arguments[0].click();", card)

    def _flipped_state_matches(d: webdriver.Chrome) -> bool:
        cls = d.find_element(By.XPATH, card_xpath).get_attribute("class") or ""
        has_flipped = "flipped" in cls
        return has_flipped == want_flipped

    try:
        wait.until(_flipped_state_matches)
    except Exception:
        # sometimes the click doesn't land, so try once more
        card = wait.until(EC.presence_of_element_located((By.XPATH, card_xpath)))
        driver.execute_script("arguments[0].click();", card)
        wait.until(_flipped_state_matches)


# clicking a card should flip it, clicking again should flip it back
def test_learning_card_flips_on_click():
    driver = _build_driver()
    try:
        wait = _login_and_open_learning(driver)
        _toggle_flip_active_card(wait, driver)
        _toggle_flip_active_card(wait, driver)
    finally:
        driver.quit()


# swiping right should move to the next card
def test_learning_cards_swipe_to_next_card():
    driver = _build_driver()
    try:
        wait = _login_and_open_learning(driver)

        before_index, total = _active_index_and_total(driver)
        if total < 2:
            pytest.skip("Need at least 2 cards to validate swipe to next.")

        active_img = wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(@class,'swiper-slide-active')]//img")
            )
        )
        first_alt = active_img.get_attribute("alt")

        _slide(driver, "next")

        wait.until(
            lambda d: d.find_element(
                By.XPATH,
                "//*[contains(@class,'swiper-slide-active')]//img",
            ).get_attribute("alt")
            != first_alt
        )
        after_index, _ = _active_index_and_total(driver)
        assert after_index == before_index + 1
    finally:
        driver.quit()


# randomly flips and scrolls through cards 12 times to make sure nothing breaks
def test_learning_random_flip_and_scroll_stability():
    driver = _build_driver()
    try:
        wait = _login_and_open_learning(driver)
        _, total = _active_index_and_total(driver)
        if total < 2:
            pytest.skip("Need at least 2 cards to run random flip/scroll test.")

        for _ in range(12):
            index, total = _active_index_and_total(driver)

            # don't try to go left on the first card or right on the last
            if index <= 0:
                action = random.choice(["next", "flip"])
            elif index >= total - 1:
                action = random.choice(["prev", "flip"])
            else:
                action = random.choice(["next", "prev", "flip"])

            if action == "flip":
                _toggle_flip_active_card(wait, driver)
            else:
                active_img = wait.until(
                    EC.presence_of_element_located((By.XPATH, "//*[contains(@class,'swiper-slide-active')]//img"))
                )
                before_alt = active_img.get_attribute("alt")
                _slide(driver, action)
                wait.until(
                    lambda d: d.find_element(
                        By.XPATH,
                        "//*[contains(@class,'swiper-slide-active')]//img",
                    ).get_attribute("alt")
                    != before_alt
                )

        final_index, _ = _active_index_and_total(driver)
        assert 0 <= final_index < total
    finally:
        driver.quit()


# runs a fixed sequence of swipes and flips to make sure the card state stays consistent
def test_learning_scripted_swipe_and_flip_sequence():
    driver = _build_driver()
    try:
        wait = _login_and_open_learning(driver)
        _, total = _active_index_and_total(driver)
        if total < 2:
            pytest.skip("Need at least 2 cards to run scripted swipe/flip sequence.")

        actions = [
            "right", "right", "right", "right",
            "left", "left",
            "flip", "flip", "flip", "flip",
            "left",
            "right", "right", "right",
            "flip", "flip", "flip",
            "left", "left", "left",
        ]

        for action in actions:
            if action == "right":
                _slide_and_wait(driver, wait, "next")
            elif action == "left":
                _slide_and_wait(driver, wait, "prev")
            else:
                _toggle_flip_active_card(wait, driver)

        final_index, total = _active_index_and_total(driver)
        assert 0 <= final_index < total
    finally:
        driver.quit()