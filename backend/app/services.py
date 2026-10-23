"""
Service / business-logic layer (Controller layer – MVC).

Encapsulates all DB interactions and encryption concerns so that routers
remain thin and purely handle HTTP concerns.
"""

import csv
import io
from typing import List

from sqlalchemy.orm import Session

from app.models import UserProfile
from app.schemas import UserPublic, UserUnmasked
from app.encryption import encrypt, decrypt


# ---------------------------------------------------------------------------
# CSV ingestion
# ---------------------------------------------------------------------------

REQUIRED_COLUMNS = {
    "name", "education", "address", "contact_number",
    "account_number", "government_id", "email_id",
    "gender", "department", "project", "location",
}

# Map CSV header variations (case-insensitive) to model attribute names
_HEADER_MAP = {
    "name":           "name",
    "education":      "education",
    "address":        "address",
    "contact number": "contact_number",
    "contact_number": "contact_number",
    "account number": "account_number",
    "account_number": "account_number",
    "government id":  "government_id",
    "government_id":  "government_id",
    "email id":       "email_id",
    "email_id":       "email_id",
    "email":          "email_id",
    "gender":         "gender",
    "department":     "department",
    "project":        "project",
    "location":       "location",
}


def _normalise_headers(raw_headers: List[str]) -> List[str]:
    """Convert raw CSV headers to internal field names."""
    return [_HEADER_MAP.get(h.strip().lower(), h.strip().lower()) for h in raw_headers]


def ingest_csv(file_bytes: bytes, db: Session) -> dict:
    """
    Parse a CSV file, encrypt PII, upsert records by email_id.

    Returns a summary dict with counts of created/updated/skipped rows.
    """
    text = file_bytes.decode("utf-8-sig")  # handle BOM if present
    reader = csv.DictReader(io.StringIO(text))

    if not reader.fieldnames:
        raise ValueError("CSV file is empty or has no header row.")

    normalised_headers = _normalise_headers(list(reader.fieldnames))

    # Build rows with normalised keys
    created = updated = skipped = 0
    errors: List[str] = []

    for line_no, raw_row in enumerate(reader, start=2):
        row = {
            normalised_headers[i]: v.strip()
            for i, v in enumerate(raw_row.values())
        }

        email = row.get("email_id", "").strip().lower()
        if not email:
            errors.append(f"Line {line_no}: missing email_id – row skipped.")
            skipped += 1
            continue

        # Encrypt PII before touching the DB
        enc_contact = encrypt(row.get("contact_number", ""))
        enc_account = encrypt(row.get("account_number", ""))
        enc_gov_id  = encrypt(row.get("government_id", ""))

        # Upsert by email_id
        existing: UserProfile | None = (
            db.query(UserProfile).filter(UserProfile.email_id == email).first()
        )

        if existing:
            existing.name           = row.get("name", existing.name)
            existing.education      = row.get("education", existing.education)
            existing.address        = row.get("address", existing.address)
            existing.gender         = row.get("gender", existing.gender)
            existing.department     = row.get("department", existing.department)
            existing.project        = row.get("project", existing.project)
            existing.location       = row.get("location", existing.location)
            existing.contact_number = enc_contact
            existing.account_number = enc_account
            existing.government_id  = enc_gov_id
            updated += 1
        else:
            profile = UserProfile(
                name           = row.get("name", ""),
                education      = row.get("education"),
                address        = row.get("address"),
                email_id       = email,
                gender         = row.get("gender"),
                department     = row.get("department"),
                project        = row.get("project"),
                location       = row.get("location"),
                contact_number = enc_contact,
                account_number = enc_account,
                government_id  = enc_gov_id,
            )
            db.add(profile)
            created += 1

    db.commit()
    return {
        "message": "CSV ingested successfully.",
        "created": created,
        "updated": updated,
        "skipped": skipped,
        "errors":  errors,
    }


# ---------------------------------------------------------------------------
# Queries
# ---------------------------------------------------------------------------

def get_all_users_public(db: Session) -> List[UserPublic]:
    """Return all profiles with PII fields completely omitted."""
    profiles = db.query(UserProfile).order_by(UserProfile.id).all()
    return [UserPublic.model_validate(p) for p in profiles]


def get_user_unmasked(user_id: int, db: Session) -> UserUnmasked:
    """
    Return a full profile with decrypted PII.
    Raises ValueError if user not found.
    """
    profile = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if not profile:
        raise ValueError(f"User with id={user_id} not found.")

    public_data = UserPublic.model_validate(profile).model_dump()
    unmasked = UserUnmasked(
        **public_data,
        contact_number=decrypt(profile.contact_number or ""),
        account_number=decrypt(profile.account_number or ""),
        government_id=decrypt(profile.government_id or ""),
    )
    return unmasked
