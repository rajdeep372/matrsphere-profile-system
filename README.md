# MatrSphere — Secure Profile Management System

A secure, production-ready, full-stack profile management dashboard built with a **Python FastAPI** backend (following strict MVC architecture) and a **Next.js (App Router)** frontend styled with a curated **Soft Slate & Deep Indigo** design system and **Framer Motion** micro-interactions.

---

## Architecture Overview

```
matrsphere-profile-system/
├── backend/                  # FastAPI Backend (Strict MVC Architecture)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py         # Config & Fernet encryption key persistence
│   │   ├── database.py       # SQLAlchemy engine & session factory (Model)
│   │   ├── encryption.py     # Fernet cryptographic service (Model / Security)
│   │   ├── models.py         # UserProfile ORM model (Model)
│   │   ├── schemas.py        # Pydantic request/response contracts (View)
│   │   ├── services.py       # Ingestion, encryption & queries (Controller / Service)
│   │   └── routers.py        # REST endpoints (Controller / Router)
│   ├── .env.example          # Sample environment variables
│   ├── main.py               # Application factory & CORS configuration
│   ├── requirements.txt      # Python dependencies
│   └── test_backend.py       # Automated security & endpoint test suite
│
├── frontend/                 # Next.js 15+ App Router Dashboard
│   ├── app/
│   │   ├── globals.css       # Tailwind CSS design system tokens
│   │   ├── layout.tsx        # Inter font & SEO metadata configuration
│   │   └── page.tsx          # Dynamic responsive two-panel dashboard
│   ├── components/
│   │   ├── Sidebar.tsx       # Profile list with avatars, status pills & search
│   │   ├── ProfileDetail.tsx # Masked profile inspector & unmasked view
│   │   ├── ConsentModal.tsx  # Spring-animated PII consent dialog
│   │   └── CsvUploader.tsx   # Drag-and-drop CSV parser
│   ├── lib/
│   │   └── api.ts            # Typed client for backend communication
│   ├── types/
│   │   └── index.ts          # Shared TypeScript models
│   ├── .env.example          # Sample frontend environment variables
│   └── package.json
│
├── .vscode/
│   └── settings.json         # Python & TypeScript path resolution configuration
├── users.csv                 # 10 realistic mock profiles with all 11 fields
├── completion_checklist.md   # Requirement verification report
└── README.md
```

---

## PII Encryption at Rest & UI Masking

The system implements defense-in-depth security for Personally Identifiable Information (**PII**):

### 1. PII Encryption at Rest (Field-Level Fernet Encryption)
- **PII Fields Encrypted**: `Contact Number`, `Account Number`, and `Government ID`.
- **Cryptographic Standard**: Python's `cryptography.fernet.Fernet` engine, implementing **AES-128 in CBC mode** with PKCS7 padding and **HMAC-SHA256** authentication for tamper resistance.
- **Key Generation & Persistence**: An industry-grade 32-byte URL-safe base64 key is generated automatically on initial startup (if not already set in environment) and safely stored in `backend/.env`.
- **Ciphertext Storage**: Raw PII is **never written to disk in plaintext**. Inspecting the SQLite database (`matrsphere.db`) directly verifies that only encrypted tokens (e.g. `gAAAAABq...`) are stored.

### 2. Security in Transit (Strict Field Omission)
- When fetching user profiles via `GET /users`, PII fields are **completely omitted from the JSON payload** using Pydantic's `UserPublic` schema.
- Rather than merely hiding text with CSS while sending sensitive data over the wire, network responses carry **zero plaintext PII**.

### 3. UI Masking & Explicit Consent Flow
- In the frontend dashboard, sensitive fields default to masked bullets (`••••••••••••`) accompanied by an amber **Hidden** indicator.
- PII is only exposed through a secure affirmative action:
  1. The user clicks **Show Hidden Fields**, triggering an accessible, spring-animated **Consent Modal**.
  2. The modal details which PII fields will be decrypted and requires explicit acknowledgement.
  3. Clicking **I Understand & Agree** sends `POST /users/{id}/unmask` with `{"consent_given": true}`.
  4. If `consent_given` is `false` or omitted, the backend rejects the request immediately with **HTTP 403 Forbidden**.
  5. The UI allows the user to re-mask the fields anytime with the **Hide Fields** button.

---

## User Profile Data Schema

The platform records and manages all 11 required profile fields:

| Field Name | Storage Type | Security Level |
|---|---|---|
| **Name** | Plaintext (`VARCHAR(255)`) | Public |
| **Education** | Plaintext (`VARCHAR(255)`) | Public |
| **Address** | Plaintext (`VARCHAR(512)`) | Public |
| **Email ID** | Plaintext (`VARCHAR(255)`, Unique) | Public (Account Identifier) |
| **Gender** | Plaintext (`VARCHAR(50)`) | Public |
| **Department** | Plaintext (`VARCHAR(255)`) | Public |
| **Project** | Plaintext (`VARCHAR(255)`) | Public |
| **Location** | Plaintext (`VARCHAR(255)`) | Public |
| **Contact Number** | **Fernet Ciphertext (`VARCHAR(512)`)** | **PII (Encrypted at Rest)** |
| **Account Number** | **Fernet Ciphertext (`VARCHAR(512)`)** | **PII (Encrypted at Rest)** |
| **Government ID** | **Fernet Ciphertext (`VARCHAR(512)`)** | **PII (Encrypted at Rest)** |

---

## Prerequisites

Before setting up the project, make sure the following tools are installed:

- **Git**: [git-scm.com](https://git-scm.com/)
- **Python**: Version `3.10` or higher (`3.11+` recommended) — [python.org](https://www.python.org/)
- **Node.js**: Version `18.17` or higher (`20+` recommended) — [nodejs.org](https://nodejs.org/)
- **Package Managers**: `pip` (bundled with Python) and `npm` (bundled with Node.js)

---

## Database Setup & Migration

The application utilizes **SQLite** with **SQLAlchemy ORM** for persistent storage.

### 1. Automatic Schema Initialization
When the FastAPI application boots up, SQLAlchemy automatically creates the database file `backend/matrsphere.db` and provisions all tables defined in `backend/app/models.py` via `Base.metadata.create_all(bind=engine)`. No external database server installation is required.

### 2. Database Migrations
For production schema migrations, the models are organized within SQLAlchemy declarative metadata (`backend/app/database.py`). Schema evolution can be managed via Alembic if extended to relational databases like PostgreSQL.

### 3. Database Seeding & Verification
You can populate and verify the database in one of two ways:
- **Via the Test Suite**: Run `python test_backend.py` inside the `backend` folder. This loads `users.csv`, populates 10 realistic profiles, tests encryption/decryption, and validates transit masking.
- **Via the Web Interface**: Use the drag-and-drop CSV uploader in the dashboard sidebar to upload `users.csv`.

---

## Steps to Run the Servers

Follow these steps to run both backend and frontend servers concurrently.

### 1. Backend Server (FastAPI)

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment (optional but recommended):
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment (optional, auto-generated if omitted):
   ```bash
   # Copy sample environment configuration
   cp .env.example .env
   ```

5. Start the development server with Uvicorn:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

- **Backend API**: `http://localhost:8000`
- **Interactive OpenAPI/Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

### 2. Frontend Server (Next.js)

1. Open a second terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   Ensure `frontend/.env.local` contains the backend URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## API Endpoints Reference

### 1. Ingest Profiles via CSV
- **Endpoint**: `POST /upload-csv`
- **Content-Type**: `multipart/form-data`
- **Description**: Parses CSV file, encrypts PII fields (`contact_number`, `account_number`, `government_id`), and upserts records based on `email_id`.
- **Response** (`201 Created`):
  ```json
  {
    "message": "CSV ingested successfully.",
    "created": 10,
    "updated": 0,
    "skipped": 0,
    "errors": []
  }
  ```

### 2. List Public Profiles (Masked in Transit)
- **Endpoint**: `GET /users`
- **Description**: Returns all user profiles with PII fields completely stripped from the response payload.
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": 1,
      "name": "Arjun Sharma",
      "education": "B.Tech Computer Science",
      "address": "42 Maple Avenue, Pune, Maharashtra 411001",
      "email_id": "arjun.sharma@matrsphere.io",
      "gender": "Male",
      "department": "Engineering",
      "project": "Apollo Platform",
      "location": "Pune",
      "created_at": "2026-10-23T10:30:00Z"
    }
  ]
  ```

### 3. Reveal Decrypted PII (Consent Gated)
- **Endpoint**: `POST /users/{id}/unmask`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "consent_given": true
  }
  ```
- **Response** (`200 OK` when consent is `true`):
  ```json
  {
    "id": 1,
    "name": "Arjun Sharma",
    "education": "B.Tech Computer Science",
    "address": "42 Maple Avenue, Pune, Maharashtra 411001",
    "email_id": "arjun.sharma@matrsphere.io",
    "gender": "Male",
    "department": "Engineering",
    "project": "Apollo Platform",
    "location": "Pune",
    "contact_number": "+91-9823456701",
    "account_number": "IN-ACC-00100293781",
    "government_id": "AADHA-9823-5678-1234",
    "created_at": "2026-10-23T10:30:00Z"
  }
  ```
- **Error Response** (`403 Forbidden` when consent is `false`):
  ```json
  {
    "detail": "Access denied: explicit consent is required to view PII fields."
  }
  ```

---

## Testing & Quality Assurance

### Run Backend Security & Endpoint Verification
```bash
cd backend
python test_backend.py
```
This tests:
1. Health check availability (`GET /`)
2. Multi-part CSV parsing and upsert (`POST /upload-csv`)
3. Direct SQLite database inspection for Fernet ciphertext tokens
4. Transit masking on profile lists (`GET /users`)
5. HTTP 403 Forbidden enforcement without consent (`POST /users/{id}/unmask`)
6. Decryption and retrieval with valid consent

### Run Frontend Production Build Check
```bash
cd frontend
npm run build
```
Confirms clean TypeScript compilation and 0 ESLint warnings.
