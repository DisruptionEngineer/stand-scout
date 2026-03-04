"""
E2E tests for the Stand Scout homepage.
"""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import load_page


class TestHomepageLoad:

    def test_page_loads_with_correct_title(self, driver, base_url):
        load_page(driver, base_url)
        assert "Stand Scout" in driver.title

    def test_no_js_errors_in_console(self, driver, base_url):
        load_page(driver, base_url)
        logs = driver.get_log("browser")
        severe = [
            e for e in logs if e["level"] == "SEVERE"
            and "favicon" not in e.get("message", "").lower()
        ]
        assert len(severe) == 0, f"JS console errors: {severe}"

    def test_page_not_error(self, driver, base_url):
        load_page(driver, base_url)
        assert "404" not in driver.title
        assert "error" not in driver.title.lower()


class TestNavigation:

    NAV_LINKS = ["Discover", "Browse", "Add a Stand", "About", "Advertise"]

    def test_nav_bar_exists(self, driver, base_url):
        load_page(driver, base_url)
        nav = driver.find_element(By.TAG_NAME, "nav")
        assert nav.is_displayed()

    @pytest.mark.parametrize("label", NAV_LINKS)
    def test_nav_link_present(self, driver, base_url, label):
        load_page(driver, base_url)
        links = driver.find_elements(By.CSS_SELECTOR, "nav a")
        link_texts = [link.text.strip() for link in links]
        assert label in link_texts, (
            f"'{label}' not found. Available: {link_texts}"
        )


class TestHeroSection:

    def test_hero_heading_visible(self, driver, base_url):
        body = load_page(driver, base_url)
        assert "fresh" in body.lower()

    def test_search_bar_present(self, driver, base_url):
        load_page(driver, base_url)
        inputs = driver.find_elements(By.TAG_NAME, "input")
        placeholders = [i.get_attribute("placeholder") or "" for i in inputs]
        assert any("honey" in p.lower() or "search" in p.lower() for p in placeholders)

    def test_category_bubbles_rendered(self, driver, base_url):
        body = load_page(driver, base_url)
        for cat in ["Honey", "Produce"]:
            assert cat in body, f"Category '{cat}' not on homepage"

    def test_community_powered_badge(self, driver, base_url):
        body = load_page(driver, base_url)
        assert "Community" in body


class TestMapSection:

    def test_map_container_visible(self, driver, base_url):
        load_page(driver, base_url)
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".leaflet-container")
            )
        )
        map_el = driver.find_element(By.CSS_SELECTOR, ".leaflet-container")
        assert map_el.is_displayed()

    def test_map_tiles_loaded(self, driver, base_url):
        load_page(driver, base_url)
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".leaflet-tile-loaded")
            )
        )
        tiles = driver.find_elements(By.CSS_SELECTOR, ".leaflet-tile-loaded")
        assert len(tiles) > 0

    def test_map_attribution(self, driver, base_url):
        load_page(driver, base_url)
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".leaflet-control-attribution")
            )
        )
        attribution = driver.find_element(
            By.CSS_SELECTOR, ".leaflet-control-attribution"
        )
        assert "OpenStreetMap" in attribution.text


class TestFeatureSection:

    def test_add_stand_button_exists(self, driver, base_url):
        load_page(driver, base_url)
        links = driver.find_elements(By.TAG_NAME, "a")
        texts = [a.text.strip() for a in links]
        assert any("Add" in t and "Stand" in t for t in texts)
