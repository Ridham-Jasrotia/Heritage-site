"""
Auth service logic for administrator credential verification and token issue.
"""
import os
from app.auth.security import verify_password, create_access_token

DEFAULT_ADMIN_USER = "admin"
DEFAULT_ADMIN_PASS = "heritage2026"


def authenticate_admin(username: str, password: str) -> bool:
    """Validate provided credentials against environment variables."""
    expected_user = os.environ.get("ADMIN_USERNAME", DEFAULT_ADMIN_USER).strip()
    expected_pass = os.environ.get("ADMIN_PASSWORD", DEFAULT_ADMIN_PASS).strip()

    if username.strip() != expected_user:
        return False

    # Check if expected_pass is bcrypt hash
    if expected_pass.startswith("$2b$") or expected_pass.startswith("$2a$"):
        return verify_password(password, expected_pass)
    else:
        return password == expected_pass


def login_user(username: str, password: str):
    """Authenticate and return access token response dict or None."""
    if not authenticate_admin(username, password):
        return None

    admin_username = os.environ.get("ADMIN_USERNAME", DEFAULT_ADMIN_USER).strip()
    token = create_access_token(data={"sub": admin_username, "role": "Administrator"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": admin_username,
    }
