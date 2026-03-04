"""
Shared fixtures for Stand Scout E2E Selenium tests.
"""

import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = os.environ.get("STAND_SCOUT_URL", "https://www.stand-scout.app")


@pytest.fixture(scope="session")
def base_url():
    """Base URL for the deployed Stand Scout app."""
    return BASE_URL


@pytest.fixture(scope="module")
def driver():
    """Chrome WebDriver instance (headless) shared per test module."""
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1440,900")
    opts.add_argument(
        "user-agent=StandScout-E2E/1.0 (Selenium; Automated Test Suite)"
    )

    drv = webdriver.Chrome(options=opts)
    drv.implicitly_wait(5)
    yield drv
    drv.quit()


def wait_for_react(driver, timeout=15, min_chars=20):
    """Wait for the React SPA to hydrate by waiting for content in body."""
    WebDriverWait(driver, timeout).until(
        lambda d: len(d.find_element(By.TAG_NAME, "body").text.strip()) > min_chars
    )


def load_page(driver, url, timeout=15, min_chars=20):
    """Navigate to a URL and wait for React to render."""
    driver.get(url)
    wait_for_react(driver, timeout, min_chars)
    # Give React a moment to finish rendering all lazy components
    import time
    time.sleep(1.5)
    return driver.find_element(By.TAG_NAME, "body").text
