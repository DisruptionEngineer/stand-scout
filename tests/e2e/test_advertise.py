"""
E2E tests for the Stand Scout Advertise page.
"""

import pytest
from selenium.webdriver.common.by import By
from conftest import load_page


ADVERTISE_PATH = "/advertise"


class TestAdvertisePageLoad:

    def test_page_loads(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADVERTISE_PATH}")
        assert "Reach customers" in body or "Local Advertising" in body

    def test_no_js_errors(self, driver, base_url):
        load_page(driver, f"{base_url}{ADVERTISE_PATH}")
        logs = driver.get_log("browser")
        severe = [
            e for e in logs
            if e["level"] == "SEVERE"
            and "favicon" not in e.get("message", "").lower()
        ]
        assert len(severe) == 0, f"JS errors: {severe}"


class TestValuePropositions:

    PROPS = ["Hyperlocal", "High Intent", "Affordable"]

    @pytest.mark.parametrize("prop", PROPS)
    def test_value_prop_present(self, driver, base_url, prop):
        body = load_page(driver, f"{base_url}{ADVERTISE_PATH}")
        assert prop in body


class TestPricingTiers:

    def test_community_tier(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADVERTISE_PATH}")
        assert "Community" in body and "$25" in body

    def test_standard_tier(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADVERTISE_PATH}")
        assert "Standard" in body and "$50" in body

    def test_premium_tier(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADVERTISE_PATH}")
        assert "Premium" in body and "$75" in body

    def test_most_popular_badge(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADVERTISE_PATH}")
        assert "MOST POPULAR" in body or "Most Popular" in body


class TestLeadForm:

    def test_business_name_field(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADVERTISE_PATH}")
        assert "Business Name" in body

    def test_email_field(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADVERTISE_PATH}")
        assert "Email" in body

    def test_tier_dropdown(self, driver, base_url):
        load_page(driver, f"{base_url}{ADVERTISE_PATH}")
        selects = driver.find_elements(By.TAG_NAME, "select")
        assert len(selects) >= 1

    def test_submit_button(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADVERTISE_PATH}")
        assert "Get Started" in body
