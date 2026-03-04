"""
E2E tests for Stand Scout responsive design.
"""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import load_page


class TestMobileViewport:

    def test_homepage_loads_on_mobile(self, driver, base_url):
        driver.set_window_size(375, 812)
        body = load_page(driver, base_url)
        assert "Stand Scout" in driver.title

    def test_hero_visible_on_mobile(self, driver, base_url):
        driver.set_window_size(375, 812)
        body = load_page(driver, base_url)
        assert "fresh" in body.lower()

    def test_browse_page_on_mobile(self, driver, base_url):
        driver.set_window_size(375, 812)
        body = load_page(driver, f"{base_url}/browse")
        assert "All Stands" in body

    def test_add_stand_on_mobile(self, driver, base_url):
        driver.set_window_size(375, 812)
        body = load_page(driver, f"{base_url}/add")
        assert "Add Your Stand" in body


class TestTabletViewport:

    def test_homepage_loads_on_tablet(self, driver, base_url):
        driver.set_window_size(768, 1024)
        load_page(driver, base_url)
        assert "Stand Scout" in driver.title

    def test_map_renders_on_tablet(self, driver, base_url):
        driver.set_window_size(768, 1024)
        load_page(driver, base_url)
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".leaflet-container")
            )
        )
        map_el = driver.find_element(By.CSS_SELECTOR, ".leaflet-container")
        assert map_el.is_displayed()

    def test_browse_on_tablet(self, driver, base_url):
        driver.set_window_size(768, 1024)
        body = load_page(driver, f"{base_url}/browse")
        assert "All Stands" in body


class TestDesktopViewport:

    def test_homepage_loads_on_desktop(self, driver, base_url):
        driver.set_window_size(1440, 900)
        load_page(driver, base_url)
        assert "Stand Scout" in driver.title

    def test_full_nav_visible_on_desktop(self, driver, base_url):
        driver.set_window_size(1440, 900)
        load_page(driver, base_url)
        nav_links = driver.find_elements(By.CSS_SELECTOR, "nav a")
        visible_links = [link for link in nav_links if link.is_displayed()]
        assert len(visible_links) >= 5

    def test_map_full_width_on_desktop(self, driver, base_url):
        driver.set_window_size(1440, 900)
        load_page(driver, base_url)
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".leaflet-container")
            )
        )
        map_el = driver.find_element(By.CSS_SELECTOR, ".leaflet-container")
        width = map_el.size["width"]
        assert width > 500, f"Map too narrow: {width}px"
