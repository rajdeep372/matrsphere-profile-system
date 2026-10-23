"""
Pydantic schemas (View layer – MVC).

Defines the API request/response contracts, clearly separating what is
exposed publicly (no PII) from what is returned via the unmask endpoint.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ── Inbound ─────────────────────────────────────────────────────────────────

class ConsentRequest(BaseModel):
    """Body expected by POST /users/{id}/unmask"""
    consent_given: bool = Field(
        ...,
        description="Must be explicitly set to true to reveal PII fields.",
    )


# ── Outbound ─────────────────────────────────────────────────────────────────

class UserPublic(BaseModel):
    """Safe public profile — PII fields are completely omitted."""
    id:         int
    name:       str
    education:  Optional[str] = None
    address:    Optional[str] = None
    email_id:   str
    gender:     Optional[str] = None
    department: Optional[str] = None
    project:    Optional[str] = None
    location:   Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UserUnmasked(UserPublic):
    """
    Full profile including decrypted PII.
    Only returned after explicit consent via POST /users/{id}/unmask.
    """
    contact_number: Optional[str] = None
    account_number: Optional[str] = None
    government_id:  Optional[str] = None
