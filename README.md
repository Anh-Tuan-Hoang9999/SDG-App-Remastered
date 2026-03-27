# SDG App — TrentU

A web application for exploring and learning about the UN Sustainable Development Goals (SDGs), built with **React + Vite** (frontend) and **FastAPI + SQLAlchemy** (backend).

---

## Project Structure

```
SDG-TrentU/
├── SDG-App/
│   ├── app/          # React + Vite frontend
│   └── server/       # FastAPI backend
```

---

## Backend Setup (`SDG-App/server/`)

### 1. Create & activate a virtual environment

```bash
cd SDG-App/server
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

---

### 2. Dependencies — `requirements.in` vs `requirements.txt`

The project uses **two requirements files** with distinct purposes:

#### `requirements.in` — Human-maintained top-level dependencies

This file lists only the **direct** dependencies the project needs (no pinned versions). It is the source of truth you edit when adding or removing a package.

```bash
# Example: add a new package
echo "httpx" >> requirements.in
```

#### `requirements.txt` — Fully pinned lockfile (auto-generated)

This file is **generated** from `requirements.in` using `pip-compile` (from the `pip-tools` package). It pins every dependency and all transitive sub-dependencies to exact versions, ensuring reproducible installs across all environments.

**To regenerate `requirements.txt` after editing `requirements.in`:**

```bash
# Install pip-tools (one time) [Note: Do NOT upgrade pip to 26, or it will break pip-tools]
pip install pip-tools


# Compile requirements.in → requirements.txt
pip-compile requirements.in -o requirements.txt
```

**To install all dependencies from the lockfile:**

```bash
pip install -r requirements.txt
```

> **Rule of thumb:** Edit `requirements.in`, run `pip-compile`, commit both files, and always install from `requirements.txt`.

---

### 3. Configure environment variables

Copy the example below into `SDG-App/server/.env`:

**SQLite (local development — no setup needed):**

```env
DB_TYPE=sqlite
DB_NAME=sdg-test.db
```

**MySQL (production):**

```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sdg_db
DB_USER=your_user
DB_PASSWORD=your_password
```

---

### 4. Database Migrations (Alembic)

Migrations are managed with **Alembic**. Always run these commands from the `SDG-App/server/` directory.

#### First-time / after model changes — generate a migration:

### This should not be touched without consulting William Ramsay

```bash
python -m alembic revision --autogenerate -m "describe your change"
```

This inspects the SQLAlchemy models and generates a migration script in `alembic/versions/`.

#### Apply all pending migrations:

```bash
python -m alembic upgrade head
```

#### Other useful commands:

```bash
# Check which migration is currently applied
python -m alembic current

# View full migration history
python -m alembic history

# Roll back one migration
python -m alembic downgrade -1

# Roll back everything (empty database)
python -m alembic downgrade base
```

> **Note:** If `alembic` is not found as a direct command, use `python -m alembic` instead. To fix this permanently, add your Python user Scripts folder to PATH:
> `C:\Users\<you>\AppData\Roaming\Python\Python3XX\Scripts`

---

### 5. Run the server

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

---

## Frontend Setup (`SDG-App/app/`)

```bash
cd SDG-App/app
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.
