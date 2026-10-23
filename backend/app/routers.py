"""
API Router (Controller layer – MVC).

All route handlers are thin: they validate HTTP concerns and delegate
business logic to app.services.
"""

from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import ConsentRequest, UserPublic, UserUnmasked
from app import services

router = APIRouter()


# ---------------------------------------------------------------------------
# POST /upload-csv
# ---------------------------------------------------------------------------

@router.post(
    "/upload-csv",
    summary="Upload a CSV file to bulk-import user profiles",
    status_code=status.HTTP_201_CREATED,
)
async def upload_csv(
    file: UploadFile = File(..., description="CSV file with user profile data"),
    db: Session = Depends(get_db),
):
    """
    Accepts a multipart CSV upload, encrypts PII fields (Contact Number,
    Account Number, Government ID) using Fernet symmetric encryption, and
    upserts records into the database.
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only .csv files are accepted.",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    try:
        result = services.ingest_csv(file_bytes, db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    return result


# ---------------------------------------------------------------------------
# GET /users
# ---------------------------------------------------------------------------

@router.get(
    "/users",
    response_model=List[UserPublic],
    summary="List all user profiles (PII omitted)",
)
def list_users(db: Session = Depends(get_db)) -> List[UserPublic]:
    """
    Returns all profiles with PII fields (Contact Number, Account Number,
    Government ID) completely omitted from the response payload.
    """
    return services.get_all_users_public(db)


# ---------------------------------------------------------------------------
# POST /users/{id}/unmask
# ---------------------------------------------------------------------------

@router.post(
    "/users/{user_id}/unmask",
    response_model=UserUnmasked,
    summary="Reveal PII fields after explicit user consent",
)
def unmask_user(
    user_id: int,
    body: ConsentRequest,
    db: Session = Depends(get_db),
) -> UserUnmasked:
    """
    Decrypts and returns PII fields **only** when `consent_given` is `true`.

    - If `consent_given` is `false`, returns 403 Forbidden.
    - If user is not found, returns 404 Not Found.
    - Decryption errors return 500 Internal Server Error.
    """
    if not body.consent_given:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: explicit consent is required to view PII fields.",
        )

    try:
        return services.get_user_unmasked(user_id, db)
    except ValueError as exc:
        error_msg = str(exc)
        if "not found" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg,
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to decrypt user data: {error_msg}",
        ) from exc
