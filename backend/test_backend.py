import os
import sys
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from main import app
from app.database import SessionLocal, Base, engine
from app.models import UserProfile
from app.encryption import decrypt

def run_tests():
    # Make sure tables are created
    Base.metadata.create_all(bind=engine)
    client = TestClient(app)

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] 1. Health check OK")

    # 2. Upload CSV
    csv_path = backend_dir.parent / "users.csv"
    with open(csv_path, "rb") as f:
        res = client.post("/upload-csv", files={"file": ("users.csv", f, "text/csv")})
    assert res.status_code == 201, f"Upload CSV failed: {res.text}"
    upload_data = res.json()
    print(f"[PASS] 2. Upload CSV OK: created={upload_data['created']}, updated={upload_data['updated']}")

    # 3. Check SQLite DB directly - verify encryption at rest
    db = SessionLocal()
    users_in_db = db.query(UserProfile).all()
    assert len(users_in_db) == 10, f"Expected 10 users in DB, got {len(users_in_db)}"
    user1 = users_in_db[0]
    print(f"[PASS] 3. DB direct check: User '{user1.name}' found")
    print(f"     Encrypted contact token: {user1.contact_number[:30]}...")
    print(f"     Encrypted account token: {user1.account_number[:30]}...")
    print(f"     Encrypted gov ID token:  {user1.government_id[:30]}...")

    # Verify ciphertext is not plaintext
    assert "+91" not in user1.contact_number, "Contact number is stored in plaintext!"
    assert "IN-ACC" not in user1.account_number, "Account number is stored in plaintext!"
    assert "AADHA" not in user1.government_id, "Government ID is stored in plaintext!"

    # Verify decryption
    dec_contact = decrypt(user1.contact_number)
    dec_account = decrypt(user1.account_number)
    dec_gov_id  = decrypt(user1.government_id)
    assert dec_contact == "+91-9823456701", f"Contact mismatch: {dec_contact}"
    assert dec_account == "IN-ACC-00100293781", f"Account mismatch: {dec_account}"
    assert dec_gov_id  == "AADHA-9823-5678-1234", f"Gov ID mismatch: {dec_gov_id}"
    print(f"     Decrypted contact successfully: {dec_contact}")
    db.close()

    # 4. GET /users - verify PII is completely omitted (Security in transit)
    res = client.get("/users")
    assert res.status_code == 200
    users_public = res.json()
    assert len(users_public) == 10
    first_user = users_public[0]
    user_id = first_user["id"]
    assert "contact_number" not in first_user, "PII contact_number leaked in /users!"
    assert "account_number" not in first_user, "PII account_number leaked in /users!"
    assert "government_id" not in first_user, "PII government_id leaked in /users!"
    print("[PASS] 4. GET /users verified: all PII fields completely omitted (Security in Transit)")

    # 5. POST /users/{id}/unmask with consent_given=False
    res = client.post(f"/users/{user_id}/unmask", json={"consent_given": False})
    assert res.status_code == 403, f"Expected 403, got {res.status_code}: {res.text}"
    print("[PASS] 5. POST /users/{id}/unmask with consent_given=false returns 403 Forbidden")

    # 6. POST /users/{id}/unmask with consent_given=True
    res = client.post(f"/users/{user_id}/unmask", json={"consent_given": True})
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    unmasked = res.json()
    assert unmasked["contact_number"] == "+91-9823456701"
    assert unmasked["account_number"] == "IN-ACC-00100293781"
    assert unmasked["government_id"]  == "AADHA-9823-5678-1234"
    print(f"[PASS] 6. POST /users/{user_id}/unmask with consent_given=true returned decrypted PII:")
    print(f"     Contact: {unmasked['contact_number']}")
    print(f"     Account: {unmasked['account_number']}")
    print(f"     Gov ID:  {unmasked['government_id']}")

    print("\n>>> ALL BACKEND SPECIFICATIONS & SECURITY TESTS PASSED 100%! <<<")

if __name__ == "__main__":
    run_tests()
