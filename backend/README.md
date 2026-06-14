# ThreatLens AI — Backend Service

A Django-based REST API that runs static heuristic checks on URLs, safely resolves hostnames, blocks SSRF vectors, integrates with external reputation APIs (VirusTotal, AbuseIPDB), and registers user rating feedbacks.

## ⚙️ Tech Stack

- **Python (v3.11+)**
- **Django (v5.0+)**: Model-view architecture database operations.
- **Django REST Framework (DRF)**: Serializers, views, exception handling, and rate-limiting.
- **SQLite**: Lightweight file-based SQL database.

---

## 🚀 Setup & Execution

### 1. Setup Virtual Environment

Navigate to the backend directory and create a Python virtual environment:

```bash
cd backend
python -m venv venv
```

Activate the environment:

- **On Windows (PowerShell)**:
  ```bash
  .\venv\Scripts\Activate.ps1
  ```
- **On Windows (CMD)**:
  ```bash
  .\venv\Scripts\activate.bat
  ```
- **On Linux/macOS**:
  ```bash
  source .venv/bin/activate
  ```

### 2. Install Dependencies

Install the required dependencies listed in [requirements.txt](file:///z:/HACKATHON/backend/requirements.txt):

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy the configuration template:

```bash
copy .env.example .env
```

Open `.env` and fill in API keys if available.

> [!NOTE]
> All API keys (`VIRUSTOTAL_API_KEY`, `ABUSEIPDB_API_KEY`, etc.) are **optional**. If not provided, the scanning engine automatically falls back to heuristic-based rule parsing.

### 4. Database Setup & Migrations

Generate and execute SQLite schemas:

```bash
python manage.py migrate
```

### 5. Seed Demo Data

Pre-seed the local SQLite database with 6 mock test cases (Safe, Suspicious, Dangerous, SSRF-blocked) for hackathon evaluation:

```bash
python api/seed_demo_data.py
```

### 6. Run Server

Start the local REST API development server:

```bash
python manage.py runserver 8000
```

- The API endpoints will host at **`http://localhost:8000`**.

---

## 📡 API Endpoints List

| Method   | Endpoint           | Description                                               |  Throttled   |
| :------- | :----------------- | :-------------------------------------------------------- | :----------: |
| **GET**  | `/`                | Root API ping status checking                             |      No      |
| **GET**  | `/api/health/`     | Service health status ping                                |      No      |
| **POST** | `/api/scan/`       | Scans a link, runs heuristics & API checks, saves results | Yes (20/min) |
| **GET**  | `/api/scans/`      | Lists the 50 most recent scans in the log database        |      No      |
| **GET**  | `/api/scans/{id}/` | Retrieves comprehensive details of a specific scan        |      No      |
| **GET**  | `/api/dashboard/`  | Fetches global metrics and 10 recent scans                |      No      |
| **POST** | `/api/feedback/`   | Records helpfulness ratings and comments for a scan       |      No      |

---

## 🌐 Production Deployment Guide

### 1. Backend Deployment on Render
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect the GitHub repository and specify the following details:
   - **Environment**: `Python`
   - **Root Directory**: `backend` (or leave empty if deploying mono-repo with build settings configured)
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start Command**: `gunicorn threatlens_backend.wsgi:application`
3. Configure the **Environment Variables** in the Render settings:
   - `SECRET_KEY`: *[Your secure production secret key]*
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `your-render-subdomain.onrender.com`
   - `CORS_ALLOWED_ORIGINS`: `https://your-vercel-subdomain.vercel.app`
   - `DATABASE_URL`: *[Connection string to your PostgreSQL instance]*
   - *Optional:* `VIRUSTOTAL_API_KEY`, `ABUSEIPDB_API_KEY` (for live external lookups)

### 2. Database Setup (PostgreSQL)
* Create a Managed PostgreSQL Database (e.g., via Render PostgreSQL or Supabase).
* Copy the connection URI and set it as the `DATABASE_URL` environment variable in the Render Web Service settings. 
* The build command will automatically run `python manage.py migrate` to apply all database schemas to the PostgreSQL instance.

### 3. Frontend Deployment on Vercel
1. Create a new project on [Vercel](https://vercel.com/) and connect the GitHub repository.
2. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Set the required **Environment Variable** in the Vercel project settings:
   - `VITE_API_BASE_URL`: `https://your-render-subdomain.onrender.com`
4. Deploy the project.

