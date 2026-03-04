"""
E2E tests for the Stand Scout Admin section.
"""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from conftest import load_page


class TestAdminAuthGate:

    def test_admin_redirects_to_login(self, driver, base_url):
        load_page(driver, f"{base_url}/admin")
        WebDriverWait(driver, 10).until(
            lambda d: "/admin/login" in d.current_url
        )
        assert "/admin/login" in driver.current_url

    def test_admin_stands_redirects(self, driver, base_url):
        load_page(driver, f"{base_url}/admin/stands")
        WebDriverWait(driver, 10).until(
            lambda d: "/admin/login" in d.current_url
        )
        assert "/admin/login" in driver.current_url


class TestLoginPage:

    def test_login_page_renders(self, driver, base_url):
        body = load_page(driver, f"{base_url}/admin/login")
        assert "Admin" in body or "Sign In" in body or "Login" in body

    def test_email_field_present(self, driver, base_url):
        load_page(driver, f"{base_url}/admin/login")
        email_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='email']")
        assert len(email_inputs) >= 1

    def test_password_field_present(self, driver, base_url):
        load_page(driver, f"{base_url}/admin/login")
        pw_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
        assert len(pw_inputs) >= 1

    def test_sign_in_button(self, driver, base_url):
        load_page(driver, f"{base_url}/admin/login")
        buttons = driver.find_elements(By.TAG_NAME, "button")
        texts = [b.text.strip() for b in buttons]
        assert any("Sign In" in t or "Log In" in t for t in texts)
