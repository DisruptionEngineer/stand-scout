"""
E2E tests for the Stand Scout Browse page.
"""

import pytest
from selenium.webdriver.common.by import By
from conftest import load_page


BROWSE_PATH = "/browse"


class TestBrowsePageLoad:

    def test_page_loads(self, driver, base_url):
        body = load_page(driver, f"{base_url}{BROWSE_PATH}")
        assert "All Stands" in body

    def test_shows_portage_county(self, driver, base_url):
        body = load_page(driver, f"{base_url}{BROWSE_PATH}")
        assert "Portage County" in body

    def test_no_js_errors(self, driver, base_url):
        load_page(driver, f"{base_url}{BROWSE_PATH}")
        logs = driver.get_log("browser")
        severe = [
            e for e in logs
            if e["level"] == "SEVERE"
            and "favicon" not in e.get("message", "").lower()
        ]
        assert len(severe) == 0, f"JS errors: {severe}"


class TestBrowseSearch:

    def test_search_bar_present(self, driver, base_url):
        load_page(driver, f"{base_url}{BROWSE_PATH}")
        inputs = driver.find_elements(By.TAG_NAME, "input")
        placeholders = [i.get_attribute("placeholder") or "" for i in inputs]
        assert any(
            "search" in p.lower() or "stands" in p.lower() for p in placeholders
        )


class TestCategoryFilters:

    CATEGORIES = [
        "Produce", "Eggs", "Honey", "Baked Goods", "Dairy",
        "Meat", "Flowers", "Crafts", "Firewood", "Seasonal",
        "Preserves", "Other",
    ]

    def test_all_category_chips_present(self, driver, base_url):
        body = load_page(driver, f"{base_url}{BROWSE_PATH}")
        for cat in self.CATEGORIES:
            assert cat in body, f"Category '{cat}' not found on Browse page"


class TestBrowseControls:

    def test_sort_dropdown_present(self, driver, base_url):
        load_page(driver, f"{base_url}{BROWSE_PATH}")
        selects = driver.find_elements(By.TAG_NAME, "select")
        assert len(selects) > 0, "No sort dropdown"

    def test_map_view_toggle(self, driver, base_url):
        body = load_page(driver, f"{base_url}{BROWSE_PATH}")
        assert "Map View" in body

    def test_available_now_checkbox(self, driver, base_url):
        body = load_page(driver, f"{base_url}{BROWSE_PATH}")
        assert "Available now" in body


class TestEmptyState:

    def test_empty_state_message(self, driver, base_url):
        body = load_page(driver, f"{base_url}{BROWSE_PATH}")
        assert "No stands found" in body
