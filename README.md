# Findle — Digital Book Catalog

> A full-stack book catalog application built for the **CI/CD course** at FINKI (Faculty of Computer Science and Engineering, Ss. Cyril and Methodius University).
> **Author:** Damjan Zimbakov

---

## What is Findle?

**Findle** (FINKI + Kindle) is a production-style web application for managing a digital book catalog. Users can browse books, manage authors, track prices, and simulate purchases — all backed by a secure REST API with JWT authentication.

The project demonstrates a complete CI/CD workflow: containerized services, automated testing with 100% coverage enforcement, strict linting and type-checking gates, GitHub Actions pipelines for CI and CD, and tag-triggered Docker image releases to DockerHub.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (async), SQLAlchemy 2.0 async, PostgreSQL 16, Alembic, Pydantic v2, PyJWT, Argon2 |
| Frontend | React 18, TypeScript, Vite 5, Chakra UI v3, React Hook Form, Zod, Axios |
| Infrastructure | Docker, Docker Compose, Nginx, GitHub Actions CI/CD, DockerHub |
| Code Quality | Ruff 0.8.4 (lint + format), mypy (strict), pre-commit hooks, pytest-cov |

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
├── docker-compose.yaml           # Base compose config (local + CI builds)
├── docker-compose.override.yaml  # Dev overrides — auto-merged by Docker Compose
├── docker-compose.prod.yaml      # Prod overrides — pull images from DockerHub
├── GIT_WORKFLOW.md               # Branching, versioning, release process
├── .github/
│   └── workflows/
│       ├── ci-backend.yaml       # mypy + ruff lint + pytest (Python 3.11 & 3.12)
│       ├── ci-frontend.yaml      # ESLint + Vite build
│       └── cd.yaml               # Tag-triggered: build + push to DockerHub
├── backend/
│   ├── Dockerfile                # Multi-stage: python:3.12-slim, runs init_db.sh
│   ├── pyproject.toml            # Poetry + Ruff + mypy + taskipy config
│   ├── alembic.ini
│   ├── .env.example
│   ├── .pre-commit-config.yaml   # Ruff lint + format hooks
│   ├── scripts/
│   │   ├── init_db.sh            # Migrations + optional seed + uvicorn (production)
│   │   └── init_db_dev.sh        # DB full reset + seed (development)
│   └── src/
│       ├── api/                  # FastAPI routers + dependencies
│       ├── core/                 # Settings, security, database engine
│       ├── migrations/           # Alembic versions
│       ├── models.py             # SQLAlchemy ORM models
│       ├── schemas/              # Pydantic request/response schemas
│       ├── services/             # Business logic layer
│       └── utils/                # Superuser creation, seed data
└── frontend/
    ├── Dockerfile                # Multi-stage: node:20-alpine builder + nginx:1.25.4
    ├── nginx.conf                # SPA routing on port 3000
    ├── .env.example
    └── src/
        ├── api/                  # Axios service hooks
        ├── components/           # Shared UI (Header, Footer, Chakra snippets)
        ├── pages/                # Route-level page components
        ├── dto/                  # TypeScript API types
        └── routes/               # React Router + PrivateRoute guard
```

---

## Running Locally

**Prerequisite:** [Docker + Docker Compose](https://docs.docker.com/compose/install/)

```bash
# 1. Clone
git clone https://github.com/zimbakovtech/findle-app
cd findle-app

# 2. Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit backend/.env — set a strong SECRET_KEY and FIRST_SUPERUSER_PASSWORD

# 3. Start all services (builds images locally, applies dev overrides automatically)
docker compose up --build

# 4. Open http://localhost:3000
```

On first boot the backend runs Alembic migrations, creates the superuser, and seeds sample data. Credentials are in `backend/.env`.

### Default ports

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Postgres | localhost:5432 |

### Dev mode (hot reload + DB reset)

`docker-compose.override.yaml` is merged automatically. It volume-mounts sources for live reload and runs `init_db_dev.sh` on backend startup, which resets the database:

```bash
docker compose up --build
```

### Prod mode (pull images from DockerHub)

```bash
IMAGE_TAG=v1.0.0 docker compose \
  -f docker-compose.yaml \
  -f docker-compose.prod.yaml \
  up -d
```

---

## Backend Development

```bash
cd backend
poetry install

poetry run task run        # FastAPI dev server with reload
poetry run task test       # pytest + 100% coverage gate (runs lint first)
poetry run task lint       # ruff check
poetry run task format     # ruff fix + ruff format
poetry run task superuser  # create superuser manually
```

### Code Quality Rules

| Tool | Config | What it enforces |
|---|---|---|
| **Ruff** 0.8.4 | `pyproject.toml` | Line length 79, rules: I, F, E, W, PL, PT, preview mode |
| **mypy** | `pyproject.toml` | Strict mode — all types required, no implicit `Any` |
| **pytest-cov** | `pyproject.toml` | 100% coverage required (`--cov-fail-under=100`) |
| **pre-commit** | `.pre-commit-config.yaml` | Ruff lint + format on every commit |

Coverage omits `*/utils/*` and `__init__.py`. HTML report generated to `htmlcov/` after each test run.

---

## CI/CD Pipeline

### CI — every PR and push to `develop`

| Workflow | File | Trigger | Matrix |
|---|---|---|---|
| Backend CI | `ci-backend.yaml` | PR/push → `main`, `develop` | Python 3.11 + 3.12 |
| Frontend CI | `ci-frontend.yaml` | PR/push → `main`, `develop` | Node 20 |

**Backend CI steps:**
1. Spin up PostgreSQL 16 service container with health check
2. Install Python via `actions/setup-python@v5`
3. Install Poetry via `snok/install-poetry@v1` (latest stable, no virtualenv)
4. Restore `~/.cache/pypoetry` cache keyed on `poetry.lock`
5. `poetry run mypy .` — strict type checking
6. `poetry run task lint` — ruff check
7. `poetry run task test` — pytest with 100% coverage gate

**Frontend CI steps:**
1. Install Node 20 with `npm` cache on `package-lock.json`
2. `npm ci` — clean install
3. `npm run lint` — ESLint
4. `npm run build` — Vite TypeScript build

### CD — version tag push

```bash
git tag v1.2.3
git push origin v1.2.3
```

Triggers `.github/workflows/cd.yaml`:

1. Log in to DockerHub using `DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN` secrets
2. Build and push `zimbakovtech/findle-backend` with tag `v1.2.3` and `latest`
3. Build and push `zimbakovtech/findle-frontend` with tag `v1.2.3` and `latest` (injects `VITE_API_URL` build arg from secret)
4. *(Linode SSH deploy — commented placeholder, configured in next phase)*

### Required GitHub Secrets

Set in **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|---|---|
| `DOCKERHUB_USERNAME` | DockerHub account (`zimbakovtech`) |
| `DOCKERHUB_TOKEN` | DockerHub access token (not password) |
| `VITE_API_URL` | Production backend URL, injected at frontend build time |

For Linode deployment (future):

| Secret | Purpose |
|---|---|
| `LINODE_HOST` | Server IP |
| `LINODE_USER` | SSH user |
| `LINODE_SSH_KEY` | Private SSH key |

See [GIT_WORKFLOW.md](GIT_WORKFLOW.md) for the full branching and release flow.

---

## Git Workflow Summary

| Branch | Purpose |
|---|---|
| `main` | Production-ready. Protected. Only receives merges from `develop`. |
| `develop` | Integration branch. All features merge here first. |
| `feat/<name>` | Feature branches — squash-merge into `develop`. |
| `fix/<name>` | Bug fixes — squash-merge into `develop`. |

Release: merge `develop` → `main`, then push a semver tag (`v*.*.*`).

---

## Course Requirements Progress

| Requirement | Points | Status |
|---|---|---|
| Public Git repository | 10% | ✅ Done |
| Dockerize application | 10% | ✅ Done |
| Docker Compose orchestration | 10% | ✅ Done |
| CI/CD pipeline — image push to DockerHub | 20% | ✅ Done |
| Kubernetes — Deployment + ConfigMap/Secret | 10% | ⏳ Next phase |
| Kubernetes — Service | 10% | ⏳ Next phase |
| Kubernetes — Ingress | 10% | ⏳ Next phase |
| Kubernetes — StatefulSet for database | 10% | ⏳ Next phase |
| Deploy manifests to cluster and demonstrate | 10% | ⏳ Next phase |

---

*© 2025 Damjan Zimbakov*
