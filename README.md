# Findle — Digital Book Catalog

> A full-stack book catalog application built for the **CI/CD course** at FINKI (Faculty of Computer Science and Engineering, Ss. Cyril and Methodius University).
> **Author:** Damjan Zimbakov

---

## What is Findle?

**Findle** (FINKI + Kindle) is a production-style web application for managing a digital book catalog. Users can browse books, manage authors, track prices, and simulate purchases — all backed by a secure REST API with JWT authentication.

The project demonstrates a modern CI/CD workflow: containerized services, automated testing with 100% coverage requirement, linting gates, and a GitHub Actions pipeline that runs on every pull request.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (async), SQLAlchemy 2.0 async, PostgreSQL, Alembic, Pydantic v2, PyJWT, Argon2 |
| Frontend | React 18, TypeScript, Vite 5, Chakra UI v3, React Hook Form, Zod, Axios |
| Infrastructure | Docker Compose, Nginx, GitHub Actions CI |

---

## Features

- **JWT Authentication** — register, login, protected routes
- **Book Catalog** — add, search, paginate, and bulk-delete books with title, year, author, and price
- **Author Management** — full CRUD with search and bulk actions
- **Book Pricing & Purchase** — set prices on books and simulate purchases from the dashboard
- **Superuser Admin** — elevated permissions for catalog management
- **Responsive UI** — works on mobile and desktop

---

## Project Structure

```
findle-app/
├── docker-compose.yaml
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml          # Poetry + Ruff + mypy + taskipy
│   ├── alembic.ini
│   ├── scripts/
│   │   └── init_db.sh          # Runs migrations + seeds + starts uvicorn
│   └── src/
│       ├── api/                # FastAPI routers + dependencies
│       ├── core/               # Settings, security, database engine
│       ├── migrations/         # Alembic versions
│       ├── models.py           # SQLAlchemy ORM models
│       ├── schemas/            # Pydantic request/response schemas
│       ├── services/           # Business logic layer
│       └── utils/              # Superuser creation, seed data
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── api/                # Axios service hooks
        ├── components/         # Shared UI (Header, Footer, Chakra snippets)
        ├── pages/              # Route-level page components
        ├── dto/                # TypeScript API types
        └── routes/             # React Router + PrivateRoute guard
```

---

## Running Locally

**Prerequisite:** [Docker + Docker Compose](https://docs.docker.com/compose/install/)

```bash
# 1. Clone
git clone <repo-url>
cd findle-app

# 2. Copy env files and configure
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit backend/.env — set SECRET_KEY and FIRST_SUPERUSER_PASSWORD

# 3. Start all services
docker compose up

# 4. Open http://localhost:3000
```

On first boot the backend automatically runs Alembic migrations, creates the superuser, and seeds sample data. Default superuser credentials are defined in `backend/.env`.

---

## Backend Development

```bash
cd backend
poetry install

poetry run task run        # dev server (uvicorn reload)
poetry run task test       # pytest + coverage (100% required)
poetry run task lint       # ruff check
poetry run task format     # ruff format
poetry run task superuser  # create superuser manually
```

---

## CI/CD Pipeline

GitHub Actions runs on every PR to `main`:

| Job | Steps |
|---|---|
| Backend | mypy strict → ruff lint → pytest (100% coverage gate) |
| Frontend | ESLint → Vite build |

The pipeline enforces that no PR merges unless all checks pass.

---

## Course Context

This project was developed as part of the **CI/CD** course at FINKI. The goal was to demonstrate:

- Containerized development with Docker Compose
- Automated testing and linting enforced in CI
- A production-style fullstack architecture
- Clean separation of concerns across frontend, backend, and infrastructure

---

*© 2025 Damjan Zimbakov*
