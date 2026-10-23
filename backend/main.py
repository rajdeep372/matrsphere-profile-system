"""
FastAPI application entry-point (main.py).

Bootstraps the app, creates DB tables on startup, and mounts the API router.
"""

import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure backend directory is in sys.path for direct script/uvicorn execution
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import router


# ---------------------------------------------------------------------------
# Lifespan: create tables at startup (idempotent)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all SQLAlchemy tables before the server starts accepting requests."""
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown logic (if any) goes here


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title="MatrSphere Profile Management API",
    description=(
        "Secure full-stack profile management API with Fernet field-level "
        "encryption for PII data (Contact Number, Account Number, Government ID)."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS – allow the Next.js dev server (port 3000) during development
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Mount router
# ---------------------------------------------------------------------------

app.include_router(router, prefix="", tags=["Profiles"])


# ---------------------------------------------------------------------------
# Health-check (useful for container health probes)
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "MatrSphere Profile API"}
