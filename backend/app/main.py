"""
Heritage Site Management System — FastAPI Application Entry Point
"""

import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import Base, engine
from app.api.routes import heritage_sites, maintenance, visitors, auth

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Heritage Site Management System",
    description="API for managing heritage sites, maintenance records, and visitor data.",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allow the frontend to reach backend
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth.router,           prefix="/api/auth",         tags=["Authentication"])
app.include_router(heritage_sites.router, prefix="/api/sites",       tags=["Heritage Sites"])
app.include_router(maintenance.router,    prefix="/api/maintenance",  tags=["Maintenance"])
app.include_router(visitors.router,       prefix="/api/visitors",     tags=["Visitors"])


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health-check endpoint."""
    return {"status": "ok", "message": "Heritage Site Management System API is running."}


# ---------------------------------------------------------------------------
# Mount Frontend Static Files (for deployment on Render / single domain)
# ---------------------------------------------------------------------------
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_FRONTEND_DIR = _BACKEND_DIR.parent / "frontend"

if _FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(_FRONTEND_DIR), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)

