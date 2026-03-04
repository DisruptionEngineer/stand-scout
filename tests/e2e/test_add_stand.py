"""
E2E tests for the Stand Scout "Add a Stand" page.
"""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import load_page


ADD_PATH = "/add"


class TestAddStandPageLoad:

    def test_page_loads(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADD_PATH}")
        assert "Add Your Stand" in body

    def test_subtitle_visible(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADD_PATH}")
        assert "free" in body.lower()


class TestLocationPicker:

    def test_address_search_input(self, driver, base_url):
        load_page(driver, f"{base_url}{ADD_PATH}")
        inputs = driver.find_elements(By.TAG_NAME, "input")
        placeholders = [i.get_attribute("placeholder") or "" for i in inputs]
        assert any("address" in p.lower() for p in placeholders)

    def test_use_my_location_button(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADD_PATH}")
        assert "Use My Location" in body

    def test_map_rendered_in_form(self, driver, base_url):
        load_page(driver, f"{base_url}{ADD_PATH}")
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".leaflet-container")
            )
        )
        map_el = driver.find_element(By.CSS_SELECTOR, ".leaflet-container")
        assert map_el.is_displayed()


class TestFormFields:

    def test_owner_name_field(self, driver, base_url):
        load_page(driver, f"{base_url}{ADD_PATH}")
        inputs = driver.find_elements(By.TAG_NAME, "input")
        placeholders = [i.get_attribute("placeholder") or "" for i in inputs]
        assert any("dale" in p.lower() or "hawkins" in p.lower() for p in placeholders)

    def test_description_field(self, driver, base_url):
        load_page(driver, f"{base_url}{ADD_PATH}")
        textareas = driver.find_elements(By.TAG_NAME, "textarea")
        assert len(textareas) >= 1

    def test_phone_field(self, driver, base_url):
        load_page(driver, f"{base_url}{ADD_PATH}")
        inputs = driver.find_elements(By.TAG_NAME, "input")
        placeholders = [i.get_attribute("placeholder") or "" for i in inputs]
        assert any("555" in p for p in placeholders)

    def test_website_field(self, driver, base_url):
        load_page(driver, f"{base_url}{ADD_PATH}")
        inputs = driver.find_elements(By.TAG_NAME, "input")
        placeholders = [i.get_attribute("placeholder") or "" for i in inputs]
        assert any("https" in p.lower() for p in placeholders)


class TestCategoryChips:

    CATEGORIES = [
        "Produce", "Eggs", "Honey", "Baked Goods", "Dairy",
        "Meat", "Flowers", "Crafts", "Firewood", "Seasonal",
        "Preserves", "Other",
    ]

    def test_all_category_chips_present(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADD_PATH}")
        for cat in self.CATEGORIES:
            assert cat in body, f"Category '{cat}' not in form"

    def test_category_chip_toggles(self, driver, base_url):
        load_page(driver, f"{base_url}{ADD_PATH}")
        buttons = driver.find_elements(By.TAG_NAME, "button")
        honey_btn = next((b for b in buttons if b.text.strip() == "Honey"), None)
        assert honey_btn is not None
        # Scroll element into view before clicking
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", honey_btn)
        import time; time.sleep(0.3)
        classes_before = honey_btn.get_attribute("class") or ""
        honey_btn.click()
        classes_after = honey_btn.get_attribute("class") or ""
        assert classes_before != classes_after


class TestPaymentMethods:

    METHODS = ["Cash", "Venmo", "Card", "PayPal", "Zelle"]

    def test_payment_chips_present(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADD_PATH}")
        for method in self.METHODS:
            assert method in body, f"Payment method '{method}' not found"

    def test_self_serve_checkbox(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADD_PATH}")
        assert "Self-serve" in body or "Honor system" in body


class TestSubmitButton:

    def test_submit_button_visible(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADD_PATH}")
        assert "Add My Stand" in body

    def test_no_account_disclaimer(self, driver, base_url):
        body = load_page(driver, f"{base_url}{ADD_PATH}")
        assert "No account required" in body
