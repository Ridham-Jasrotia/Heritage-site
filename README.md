# Heritage Site Management System

A modern presentation-ready web application for managing, preserving, and monitoring heritage sites, maintenance schedules, and visitor records.

---

## Features

- **Authentication System**: Secure JWT-based login powered by FastAPI backend.
- **Dashboard Overview**: Summary statistics (Total Sites, Maintenance Records, Visitor Records, Pending Maintenance) and Featured Monument Showcase.
- **Heritage Site Directory**: Searchable, filterable catalogue of heritage sites with authentic monument imagery.
- **Detailed Dossiers**: In-depth site information, historical significance, geographic coordinates, and attached maintenance/visitor histories.
- **Full CRUD Support**: Create, Read, Update, and Delete operations for Sites, Maintenance Tasks, and Visitor Log entries.
- **Render Deployment Ready**: Pre-configured for deployment on Render with `$PORT` binding and static file serving.

---

## Environment Variables

For security during demonstrations and deployment, authentication credentials are managed via environment variables.

| Variable Name | Purpose | Example / Default Value |
| :--- | :--- | :--- |
| `ADMIN_USERNAME` | Administrator login username | `admin` |
| `ADMIN_PASSWORD` | Administrator login password | `heritage2026` |
| `SECRET_KEY` | Secret key used for signing JWT tokens | `your_secure_secret_key_here` |

> **Note**: Never commit production passwords or secrets to source control.

---

## Local Development Setup

### 1. Activate Environment & Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables (Optional)

You can set custom credentials in your terminal session before starting the server:

**PowerShell (Windows):**
```powershell
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="your_local_password"
$env:SECRET_KEY="your_local_jwt_secret"
```

**Bash / macOS / Linux:**
```bash
export ADMIN_USERNAME="admin"
export ADMIN_PASSWORD="your_local_password"
export SECRET_KEY="your_local_jwt_secret"
```

If no environment variables are set, the system uses safe local defaults:
- **Default Username**: `admin`
- **Default Password**: `heritage2026`

### 3. Run the FastAPI Application

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Access the application in your browser:
- **Frontend App**: `http://localhost:8000/`
- **Swagger API Docs**: `http://localhost:8000/docs`

---

## Render Deployment Instructions

When deploying to **Render**:

1. Create a new **Web Service** on Render connected to your repository.
2. Select **Python** environment.
3. Set **Build Command**:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Set **Start Command**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. Navigate to the **Environment** tab in your Render dashboard and add the following Environment Variables:

   - `ADMIN_USERNAME` = *(Your chosen admin username)*
   - `ADMIN_PASSWORD` = *(Your chosen admin password)*
   - `SECRET_KEY` = *(A strong random string for JWT signing)*

---

## Technology Stack

- **Backend**: FastAPI, Python 3.10+, SQLAlchemy, SQLite, PyJWT, Passlib / Bcrypt.
- **Frontend**: Semantic HTML5, Vanilla JavaScript (ES Modules), Vanilla CSS (Custom Design System, Google Fonts Playfair Display & Inter).
