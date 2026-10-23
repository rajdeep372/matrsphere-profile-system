"""
Configuration & environment settings for the MatrSphere backend.
Generates a Fernet key on first run and stores it in .env for persistence.
"""

import os
from pathlib import Path
from cryptography.fernet import Fernet

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"
DATABASE_URL = f"sqlite:///{BASE_DIR / 'matrsphere.db'}"

# ---------------------------------------------------------------------------
# Fernet encryption key management
# ---------------------------------------------------------------------------
def _load_or_generate_key() -> bytes:
    """Load an existing Fernet key from .env or generate + persist a new one."""
    # 1. Check environment variable (set by CI / Docker, takes highest priority)
    env_key = os.environ.get("FERNET_KEY", "").strip()
    if env_key:
        return env_key.encode()

    # 2. Check .env file on disk
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            if line.startswith("FERNET_KEY="):
                key = line.split("=", 1)[1].strip()
                if key:
                    return key.encode()

    # 3. Generate a new key and persist it
    new_key = Fernet.generate_key()
    with ENV_FILE.open("a") as f:
        f.write(f"\nFERNET_KEY={new_key.decode()}\n")
    return new_key


FERNET_KEY: bytes = _load_or_generate_key()
