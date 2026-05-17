# Findle — Digital Book Catalog

**Findle** is a full-stack digital book catalog application built as a college CI/CD project at FINKI (Faculty of Computer Science and Engineering). The name is a blend of *FINKI* and *Kindle*.

> This project started from [lealre/madr-fullstack](https://github.com/lealre/madr-fullstack) and has been significantly refactored and redesigned.

---

## Stack

- **Backend** — FastAPI (async), SQLAlchemy 2.0, PostgreSQL, Alembic, Pydantic v2, PyJWT, Argon2
- **Frontend** — React 18, TypeScript, Vite, Chakra UI v3, React Hook Form, Zod, Axios
- **Infrastructure** — Docker Compose, Nginx, GitHub Actions CI

---

## Features

- JWT authentication (login, signup, token refresh)
- Authors CRUD — search, pagination, bulk delete
- Books CRUD — search, pagination, bulk delete (author required)
- Superuser admin panel
- Dark mode

---

## Folder Structure

```
.
├── README.md
├── docker-compose.yaml
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── scripts/
│   │   └── init_db.sh
│   ├── src/
│   │   ├── api/
│   │   ├── core/
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   └── tests/
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── index.html
    └── src/
        ├── api/
        ├── components/
        ├── hooks/
        ├── pages/
        ├── routes/
        ├── schemas/
        └── dto/
```

---

## Running Locally (Docker)

**Prerequisites:** [Docker Compose](https://docs.docker.com/compose/install/)

1. Clone the repo:
   ```bash
   git clone <repo-url>
   cd findle
   ```

2. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Edit `backend/.env` — set a strong `SECRET_KEY` and `FIRST_SUPERUSER_PASSWORD`.

4. Start all services:
   ```bash
   docker compose up
   ```

5. Open [http://localhost:3000](http://localhost:3000)

Default superuser credentials are defined in `backend/.env`.

---

## Backend Development

```bash
cd backend
poetry install
poetry run task run        # dev server
poetry run task test       # tests with coverage
poetry run task lint       # ruff linting
poetry run task format     # ruff format
poetry run task superuser  # create superuser manually
```

---

## CI

GitHub Actions runs on every PR to `main`:
- **Backend**: mypy type check → ruff lint → pytest (100% coverage required)
- **Frontend**: ESLint → Vite build
