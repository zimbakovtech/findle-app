# Findle — Digital Book Catalog

> A production-style full-stack application built for the **CI/CD course** at FINKI (Faculty of Computer Science and Engineering, Ss. Cyril and Methodius University).
> **Author:** Damjan Zimbakov

![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?logo=kubernetes&logoColor=white)

---

## What is Findle?

**Findle** (FINKI + Kindle) is a digital book catalog web application. Users can browse books, manage authors, track prices, and simulate purchases — all backed by a secure REST API with JWT authentication.

The project demonstrates a complete CI/CD workflow: containerized services, automated testing with 100% coverage enforcement, strict linting and type-checking gates, GitHub Actions pipelines for CI and CD, tag-triggered Docker image releases to DockerHub, and Kubernetes manifests for cluster deployment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (async), SQLAlchemy 2.0 async, PostgreSQL 16, Alembic, Pydantic v2, PyJWT, Argon2 |
| Frontend | React 18, TypeScript, Vite 5, Chakra UI v3, React Hook Form, Zod, Axios |
| Infrastructure | Docker, Docker Compose, Nginx, GitHub Actions, DockerHub, Kubernetes |
| Code Quality | Ruff 0.8.4 (lint + format), mypy strict, pre-commit hooks, pytest-cov 100% |

---

## Quick Start

**Prerequisites:** [Docker + Docker Compose](https://docs.docker.com/compose/install/)

```bash
git clone https://github.com/zimbakovtech/findle-app
cd findle-app

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit backend/.env — set a strong SECRET_KEY and FIRST_SUPERUSER_PASSWORD

docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). Default credentials are in `backend/.env`.

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Postgres | localhost:5432 |

---

## Project Structure

```
findle-app/
├── .github/workflows/
│   ├── ci-backend.yaml       # mypy + ruff lint + pytest (Python 3.12)
│   ├── ci-frontend.yaml      # ESLint + Vite build
│   └── cd.yaml               # Tag-triggered: build + push to DockerHub
├── k8s/
│   ├── namespace.yaml
│   ├── postgres-secret.yaml
│   ├── postgres-configmap.yaml
│   ├── postgres-statefulset.yaml
│   ├── postgres-service.yaml
│   ├── backend-secret.yaml
│   ├── backend-configmap.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-configmap.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   └── ingress.yaml
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── pyproject.toml
│   ├── .env.example
│   ├── scripts/
│   │   ├── init_db.sh          # Prod: migrations → seed → uvicorn
│   │   └── init_db_dev.sh      # Dev: full DB reset → seed
│   └── src/
│       ├── api/                # FastAPI routers + dependencies
│       ├── core/               # Settings, security, DB engine
│       ├── migrations/         # Alembic versions
│       ├── models.py
│       ├── schemas/
│       └── services/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env.example
│   └── src/
│       ├── api/
│       ├── pages/
│       ├── components/
│       ├── routes/
│       └── dto/
├── docker-compose.yaml           # Base config
├── docker-compose.override.yaml  # Dev overrides (auto-merged)
├── docker-compose.prod.yaml      # Prod overrides (pull DockerHub images)
└── GIT_WORKFLOW.md
```

---

## Running Locally

### Development (hot reload + DB reset)

`docker-compose.override.yaml` is merged automatically — mounts sources for live reload and resets the DB on every backend start:

```bash
docker compose up --build
```

### Production simulation (pull DockerHub images)

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

poetry run task run       # FastAPI dev server with reload
poetry run task test      # pytest + 100% coverage gate (runs lint first)
poetry run task lint      # ruff check
poetry run task format    # ruff fix + ruff format
```

### Code Quality Rules

| Tool | Config | What it enforces |
|---|---|---|
| **Ruff** 0.8.4 | `pyproject.toml` | Line length 79, rules: I, F, E, W, PL, PT, preview mode |
| **mypy** | `pyproject.toml` | Strict mode — all types required, no implicit `Any` |
| **pytest-cov** | `pyproject.toml` | 100% coverage required (`--cov-fail-under=100`) |
| **pre-commit** | `.pre-commit-config.yaml` | Ruff lint + format on every commit |

---

## CI/CD Pipeline

### CI — every PR to `main`

| Workflow | File | Trigger | Steps |
|---|---|---|---|
| Backend CI | `ci-backend.yaml` | PR → `main` | mypy → ruff lint → pytest (100% coverage) |
| Frontend CI | `ci-frontend.yaml` | PR → `main` | ESLint → Vite build |

Backend CI spins up a real PostgreSQL 16 service container and runs tests against it — no mocking.

### CD — version tag push

```bash
git tag v1.2.3
git push origin v1.2.3
```

Triggers `.github/workflows/cd.yaml`:

1. Set up Docker Buildx
2. Log in to DockerHub
3. Build `zimbakovtech/findle-backend` for `linux/amd64` with GHA layer cache
4. Build `zimbakovtech/findle-frontend` for `linux/amd64` with `VITE_API_URL` build arg
5. Push both images tagged `v1.2.3` and `latest`

### Required GitHub Secrets

| Secret | Purpose |
|---|---|
| `DOCKERHUB_USERNAME` | DockerHub account (`zimbakovtech`) |
| `DOCKERHUB_TOKEN` | DockerHub access token |
| `VITE_API_URL` | Production backend URL (injected at frontend build time) |
| `LINODE_HOST` | Server IP (future deploy step) |
| `LINODE_USER` | SSH user (future) |
| `LINODE_SSH_KEY` | Private SSH key (future) |

---

## Kubernetes Deployment

All manifests live in `k8s/`. All resources run in the `findle` namespace.

### Manifest Overview

| File | Resource | Description |
|---|---|---|
| `namespace.yaml` | Namespace | `findle` — isolates all resources |
| `postgres-secret.yaml` | Secret | Postgres credentials + DATABASE_URL |
| `postgres-configmap.yaml` | ConfigMap | DB name and user (non-sensitive) |
| `postgres-statefulset.yaml` | StatefulSet | PostgreSQL 16, 1 replica, 1Gi PVC |
| `postgres-service.yaml` | Service (ClusterIP) | Internal postgres access on port 5432 |
| `backend-configmap.yaml` | ConfigMap | JWT config, superuser username/email, SEED_DATA |
| `backend-deployment.yaml` | Deployment | FastAPI, 2 replicas, init container runs migrations |
| `backend-service.yaml` | Service (ClusterIP) | Internal backend access on port 8000 |
| `frontend-configmap.yaml` | ConfigMap | VITE_API_URL reference (build-time only) |
| `frontend-deployment.yaml` | Deployment | Nginx + React SPA, 2 replicas |
| `frontend-service.yaml` | Service (ClusterIP) | Internal frontend access on port 3000 |
| `ingress.yaml` | Ingress | Routes `/api/*` → backend, `/` → frontend |
| `secrets.env.example` | — | Template for secrets (copy to `secrets.env`, gitignored) |
| `apply-secrets.sh` | — | Script that reads `secrets.env` and creates K8s Secrets |

Secrets are **not stored in YAML files**. They are created from a local `secrets.env` file that is gitignored.

### Deploy to a Cluster

**Prerequisites:** kubectl configured, NGINX Ingress Controller installed on cluster.

```bash
# 1. Create your secrets file from the template
cp k8s/secrets.env.example k8s/secrets.env
# Edit k8s/secrets.env — set real passwords and SECRET_KEY

# 2. Apply secrets (reads secrets.env, never writes base64 to disk)
bash k8s/apply-secrets.sh

# 3. Apply all other manifests
kubectl apply -f k8s/

# 4. Verify everything is running
kubectl get all -n findle

# 5. Check ingress
kubectl get ingress -n findle
```

### Verify Deployment

```bash
# Watch pod startup (init container runs migrations first)
kubectl get pods -n findle -w

# Check backend logs
kubectl logs -n findle deployment/backend -c db-migrate   # init container
kubectl logs -n findle deployment/backend -c backend      # main container

# Check postgres
kubectl logs -n findle statefulset/postgres

# Port-forward for local testing (bypasses ingress)
kubectl port-forward -n findle svc/frontend 3000:3000
kubectl port-forward -n findle svc/backend 8000:8000
```

### Architecture

```
Internet
    │
    ▼
[Ingress] nginx
    │
    ├─ /api/* ──────► [backend Service :8000]
    │                       │
    │                       ▼
    │                [backend Deployment]
    │                 2 replicas (FastAPI)
    │                       │
    │                       ▼
    │                [postgres Service :5432]
    │                       │
    │                       ▼
    │                [postgres StatefulSet]
    │                 1 replica + 1Gi PVC
    │
    └─ /* ─────────► [frontend Service :3000]
                           │
                           ▼
                    [frontend Deployment]
                     2 replicas (Nginx + SPA)
```

### Key Design Decisions

- **Init container** in backend Deployment runs `alembic upgrade head` + superuser creation before the API starts — avoids race conditions between migrations and API startup.
- **StatefulSet** for Postgres with a `volumeClaimTemplate` ensures each pod gets its own stable PVC.
- **All Secrets** use base64-encoded placeholder values with comments explaining how to replace them.
- **VITE_API_URL** is a Vite build-time variable baked into static assets — it cannot be changed at runtime without rebuilding the image.

---

## Git Workflow

| Branch | Purpose |
|---|---|
| `main` | Production-ready. Protected. Only receives merges from `develop`. |
| `develop` | Integration. All features merge here first. |
| `feat/<name>` | Feature branches — squash-merge into `develop`. |
| `fix/<name>` | Bug fixes — squash-merge into `develop`. |

**Release:**
```bash
git checkout main && git merge develop
git tag v1.x.y
git push origin main --tags
```

See [GIT_WORKFLOW.md](GIT_WORKFLOW.md) for full details.

---

## Course Requirements

| Requirement | Points | Status |
|---|---|---|
| Public Git repository | 10% | ✅ Done |
| Dockerize application | 10% | ✅ Done |
| Docker Compose orchestration | 10% | ✅ Done |
| CI/CD pipeline — image push to DockerHub | 20% | ✅ Done |
| Kubernetes — Deployment + ConfigMap/Secret | 10% | ✅ Done |
| Kubernetes — Service | 10% | ✅ Done |
| Kubernetes — Ingress | 10% | ✅ Done |
| Kubernetes — StatefulSet for database | 10% | ✅ Done |
| Deploy manifests to cluster and demonstrate | 10% | ⏳ Pending demo |

---

*© 2025 Damjan Zimbakov — FINKI CI/CD Course*
