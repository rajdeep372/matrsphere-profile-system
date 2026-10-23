"""
Encryption service (Model/Service layer – MVC).

Provides stateless Fernet encrypt/decrypt helpers used by the service layer.
The Fernet key is loaded once at import time from app.config.
"""

from cryptography.fernet import Fernet, InvalidToken

from app.config import FERNET_KEY

_fernet = Fernet(FERNET_KEY)


def encrypt(plaintext: str) -> str:
    """Encrypt a plaintext string and return a URL-safe base64 ciphertext."""
    if not plaintext:
        return ""
    return _fernet.encrypt(plaintext.encode()).decode()


def decrypt(ciphertext: str) -> str:
    """Decrypt a ciphertext string.  Returns the original plaintext or raises."""
    if not ciphertext:
        return ""
    try:
        return _fernet.decrypt(ciphertext.encode()).decode()
    except (InvalidToken, Exception) as exc:
        raise ValueError(f"Decryption failed: {exc}") from exc
