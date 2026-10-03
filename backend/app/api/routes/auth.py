"""
API routes for authentication.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.auth.service import login_user
from app.auth.security import get_current_user

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest):
    """Authenticate administrator and return JWT access token."""
    result = login_user(credentials.username, credentials.password)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return result


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    """Return currently authenticated administrator details."""
    return UserResponse(username=current_user["username"], role=current_user["role"])
