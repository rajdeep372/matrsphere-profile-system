"""
ORM Model (Model layer – MVC).

PII columns (contact_number, account_number, government_id) are stored as
Fernet-encrypted ciphertext (base64 URL-safe strings) in the database.
All encryption/decryption is handled by the service layer, not here.
"""

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # ── Non-PII fields (stored in plaintext) ─────────────────────────────────
    name       = Column(String(255), nullable=False, index=True)
    education  = Column(String(255), nullable=True)
    address    = Column(String(512), nullable=True)
    email_id   = Column(String(255), nullable=False, unique=True, index=True)
    gender     = Column(String(50),  nullable=True)
    department = Column(String(255), nullable=True)
    project    = Column(String(255), nullable=True)
    location   = Column(String(255), nullable=True)

    # ── PII fields (stored Fernet-encrypted at rest) ─────────────────────────
    contact_number = Column(String(512), nullable=True)   # Contact Number (Encrypted)
    account_number = Column(String(512), nullable=True)   # Account Number (Encrypted)
    government_id  = Column(String(512), nullable=True)   # Government ID (Encrypted)

    # ── Audit ─────────────────────────────────────────────────────────────────
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())
