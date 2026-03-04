"""
E2E tests for Stand Scout routing and error handling.
"""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import load_page


class TestMainRoutes:

    ROUTES = [
        ("/", "Stand Scout"),
        ("/browse", "All Stands"),
        ("/add", "Add Your Stand"),
        ("/about", "Corner"),
        ("/advertise", "Reach"),
    ]

    @pytest.mark.parametrize("path,expected_text", ROUTES)
    def test_route_loads(self, driver, base_url, path, expected_text):
        body = load_page(driver, f"{base_url}{path}")
        assert expected_text in body or expected_text in driver.title


class Test404Page:

    def test_unknown_route_shows_404(self, driver, base_url):
        body = load_page(driver, f"{base_url}/this-page-does-not-exist")
        assert "404" in body

    def test_404_has_home_link(self, driver, base_url):
        body = load_page(driver, f"{base_url}/nonexistent-xyz")
        assert "Home" in body

    def test_404_back_to_home_works(self, driver, base_url):
        load_page(driver, f"{base_url}/nonexistent-xyz")
        home_links = driver.find_elements(
            By.XPATH, "//a[contains(text(), 'Home')]"
        )
        assert len(home_links) > 0
        home_links[0].click()
        WebDriverWait(driver, 10).until(
            lambda d: d.current_url.rstrip("/") == base_url.rstrip("/")
            or d.current_url.endswith("/")
        )


class TestClientSideNavigation:

    def test_navigate_home_to_browse(self, driver, base_url):
        load_page(driver, base_url)
        browse_link = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//nav//a[contains(text(), 'Browse')]")
            )
        )
        browse_link.click()
        WebDriverWait(driver, 10).until(
            lambda d: "/browse" in d.current_url
        )
        WebDriverWait(driver, 10).until(
            lambda d: "All Stands" in d.find_element(By.TAG_NAME, "body").text
        )

    def test_navigate_browse_to_add(self, driver, base_url):
        load_page(driver, f"{base_url}/browse")
        add_link = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//nav//a[contains(text(), 'Add a Stand')]")
            )
        )
        add_link.click()
        WebDriverWait(driver, 10).until(
            lambda d: "/add" in d.current_url
        )
        WebDriverWait(driver, 10).until(
            lambda d: "Add Your Stand" in d.find_element(By.TAG_NAME, "body").text
        )
