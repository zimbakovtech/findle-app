# Findle — Digital Book Catalog

> A full-stack book catalog application built for the **CI/CD course** at FINKI (Faculty of Computer Science and Engineering, Ss. Cyril and Methodius University).
> **Author:** Damjan Zimbakov

---

## What is Findle?

**Findle** (FINKI + Kindle) is a production-style web application for managing a digital book catalog. Users can browse books, manage authors, track prices, and simulate purchases — all backed by a secure REST API with JWT authentication.

The project demonstrates a modern CI/CD workflow: containerized services, automated testing with 100% coverage requirement, linting gates, a GitHub Actions CI pipeline, and tag-triggered Docker image releases to DockerHub.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (async), SQLAlchemy 2.0 async, PostgreSQL, Alembic, Pydantic v2, PyJWT, Argon2 |
| Frontend | React 18, TypeScript, Vite 5, Chakra UI v3, React Hook Form, Zod, Axios |
| Infrastructure | Docker, Docker Compose, Nginx, GitHub Actions CI/CD, DockerHub |

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
├── docker-compose.yaml          # Base compose config (production build)
├── docker-compose.override.yaml # Dev overrides (hot reload, dev reset)
├── docker-compose.prod.yaml     # Prod overrides (pull images from DockerHub)
├── GIT_WORKFLOW.md              # Branching, versioning, release process
├── .github/
│   └── workflows/
│       ├── ci-backend.yaml      # Backend: type check, lint, test
│       ├── ci-frontend.yaml     # Frontend: lint, build
│       └── cd.yaml              # Tag-triggered: build + push to DockerHub
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml           # Poetry + Ruff + mypy + taskipy
│   ├── alembic.ini
│   ├── .env.example
│   ├── scripts/
│   │   ├── init_db.sh           # Migrations + seed + uvicorn (production)
│   │   └── init_db_dev.sh       # DB reset + seed (development)
│   └── src/
│       ├── api/                 # FastAPI routers + dependencies
│       ├── core/                # Settings, security, database engine
│       ├── migrations/          # Alembic versions
│       ├── models.py            # SQLAlchemy ORM models
│       ├── schemas/             # Pydantic request/response schemas
│       ├── services/            # Business logic layer
│       └── utils/               # Superuser creation, seed data
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── .env.example
    └── src/
        ├── api/                 # Axios service hooks
        ├── components/          # Shared UI (Header, Footer, Chakra snippets)
        ├── pages/               # Route-level page components
        ├── dto/                 # TypeScript API types
        └── routes/              # React Router + PrivateRoute guard
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

# 3. Start all services (builds images locally)
docker compose up --build

# 4. Open http://localhost:3000
```

On first boot the backend automatically runs Alembic migrations, creates the superuser, and seeds sample data. Default superuser credentials are defined in `backend/.env`.

### Dev Mode (hot reload)

The `docker-compose.override.yaml` is merged automatically by Docker Compose. It mounts source directories for live reload and resets the database on startup:

```bash
docker compose up --build
# frontend hot-reloads on file changes
# backend resets DB and reloads via mounted volume
```

### Prod Mode (pull from DockerHub)

```bash
IMAGE_TAG=v1.0.0 docker compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d
```

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

### CI — runs on every PR and push to `develop`

| Workflow | Trigger | Steps |
|---|---|---|
| Backend CI | PR/push to `main`/`develop` | mypy strict → ruff lint → pytest (100% coverage gate) |
| Frontend CI | PR/push to `main`/`develop` | ESLint → Vite build |

### CD — runs on version tags

```bash
git tag v1.0.0
git push origin v1.0.0
```

Triggers `.github/workflows/cd.yaml`:
- Builds `zimbakovtech/findle-backend` and `zimbakovtech/findle-frontend`
- Pushes to DockerHub with both `v1.0.0` and `latest` tags
- Deployment to Linode (configured later — see commented section in `cd.yaml`)

### Required GitHub Secrets

| Secret | Purpose |
|---|---|
| `DOCKERHUB_USERNAME` | DockerHub account username |
| `DOCKERHUB_TOKEN` | DockerHub access token |
| `VITE_API_URL` | Production backend URL |

See [GIT_WORKFLOW.md](GIT_WORKFLOW.md) for branching strategy, release flow, and full secrets list.

---

## Course Context

This project was developed as part of the **CI/CD** course at FINKI. Requirements addressed:

- [x] Public Git repository
- [x] Dockerized frontend and backend
- [x] Docker Compose orchestration with health checks
- [x] GitHub Actions CI pipeline (type check, lint, test, build)
- [x] CD pipeline — Docker images pushed to DockerHub on version tag
- [ ] Kubernetes manifests (Deployment, Service, Ingress, StatefulSet) — next phase
- [ ] Linode server deployment — next phase

---

*© 2025 Damjan Zimbakov*
