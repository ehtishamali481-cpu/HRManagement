# HRM Portal - Full-Stack Monorepo Boilerplate

A clean, modular monorepo project structure for a Human Resource Management (HRM) Portal.

---

## Tech Stack Overview

- **Frontend:** React 18 + Vite (JavaScript strictly, no TypeScript), React Router v7, Axios.
- **Backend:** Python 3.10+ / FastAPI, SQLAlchemy ORM, Pydantic, python-dotenv.
- **Database:** PostgreSQL (using `psycopg2-binary` and `asyncpg`).

---

## Directory Architecture

```text
hrm/
├── .gitignore
├── README.md
├── frontend/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       └── services/
└── backend/
    ├── .env.example
    ├── database.py
    ├── main.py
    ├── requirements.txt
    ├── app/
    │   ├── __init__.py
    │   ├── controllers/
    │   │   └── __init__.py
    │   ├── models/
    │   │   └── __init__.py
    │   ├── routes/
    │   │   └── __init__.py
    │   └── schemas/
    │       └── __init__.py
    └── config/
        ├── __init__.py
        └── settings.py
```

---

## Getting Started & Installation Guide

### 1. Prerequisites

- **Node.js** (v18.x or later) & **npm** (v9.x or later)
- **Python** (v3.10 or later)
- **PostgreSQL** (v14+ running locally or on a remote server)

---

### 2. Backend Setup (Python / FastAPI)

#### Step 2.1: Navigate to the backend directory
```bash
cd backend
```

#### Step 2.2: Create and activate a Python virtual environment
- **On Windows (PowerShell):**
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```
- **On Windows (Command Prompt):**
  ```cmd
  python -m venv venv
  venv\Scripts\activate.bat
  ```
- **On Linux / macOS:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

#### Step 2.3: Install backend dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### Step 2.4: Configure environment variables
Copy `.env.example` to `.env`:
- **Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```
- **Linux / macOS:**
  ```bash
  cp .env.example .env
  ```
Update `.env` with your PostgreSQL database credentials:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hrm_db
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8000
SECRET_KEY=your-super-secret-key
ALLOWED_ORIGINS=http://localhost:5173
```

#### Step 2.5: Run the Backend Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- API will be accessible at: `http://localhost:8000`
- Interactive Swagger docs at: `http://localhost:8000/docs`
- ReDoc documentation at: `http://localhost:8000/redoc`
- Health check status endpoint: `http://localhost:8000/health`

---

### 3. Frontend Setup (React + Vite JS)

#### Step 3.1: Open a separate terminal and navigate to the frontend directory
```bash
cd frontend
```

#### Step 3.2: Configure environment variables
Copy `.env.example` to `.env`:
- **Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```
- **Linux / macOS:**
  ```bash
  cp .env.example .env
  ```

#### Step 3.3: Install frontend dependencies
```bash
npm install
```

#### Step 3.4: Run the Frontend Development Server
```bash
npm run dev
```
- App will be running at: `http://localhost:5173`

---

### 4. Build for Production

#### Frontend
```bash
cd frontend
npm run build
```
Build assets will be generated in `frontend/dist/`.

#### Backend
For production deployments, execute with multiple workers:
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```
