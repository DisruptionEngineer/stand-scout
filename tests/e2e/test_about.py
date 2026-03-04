"""
E2E tests for the Stand Scout About page.
"""

import pytest
from selenium.webdriver.common.by import By
from conftest import load_page


ABOUT_PATH = "/about"


class TestAboutPageLoad:

    def test_page_loads(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ABOUT_PATH}")
        assert "Growing" in body or "Discover" in body

    def test_no_js_errors(self, driver, base_url):
        load_page(driver, f"{base_url}{ABOUT_PATH}")
        logs = driver.get_log("browser")
        severe = [
            e for e in logs
            if e["level"] == "SEVERE"
            and "favicon" not in e.get("message", "").lower()
        ]
        assert len(severe) == 0


class TestStatCards:

    STATS = [
        ("Active Stands", "18+"),
        ("Free Forever", "100%"),
        ("Status Updates", "SMS"),
        ("Scan & Report", "QR"),
    ]

    @pytest.mark.parametrize("label,value", STATS)
    def test_stat_card(self, driver, base_url, label, value):
        body = load_page(driver, f"{base_url}{ABOUT_PATH}")
        assert label in body
        assert value in body


class TestMissionContent:

    def test_platform_description(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ABOUT_PATH}")
        assert "community-powered" in body.lower() or "roadside" in body.lower()
