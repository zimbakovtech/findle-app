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
│   ├── postgres-configmap.yaml
│   ├── postgres-statefulset.yaml
│   ├── postgres-service.yaml
│   ├── backend-configmap.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-configmap.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── ingress.yaml
│   ├── secrets.env.example       # Template (commit)
│   ├── secrets.env               # Real values (gitignored)
│   └── apply-secrets.sh          # Creates K8s Secrets from secrets.env
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
| `postgres-configmap.yaml` | ConfigMap | Postgres DB name and user (non-sensitive) |
| `postgres-statefulset.yaml` | StatefulSet | PostgreSQL 16, 1 replica, 1Gi PVC, `pg_isready` probes |
| `postgres-service.yaml` | Service (ClusterIP) | Internal postgres access on port 5432 |
| `backend-configmap.yaml` | ConfigMap | JWT config, superuser username/email, `SEED_DATA`, `ROOT_PATH=/api` |
| `backend-deployment.yaml` | Deployment | FastAPI, 2 replicas, init container runs Alembic migrations + superuser creation |
| `backend-service.yaml` | Service (ClusterIP) | Internal backend access on port 8000 |
| `frontend-configmap.yaml` | ConfigMap | `VITE_API_URL` reference (build-time only) |
| `frontend-deployment.yaml` | Deployment | Nginx + React SPA, 2 replicas |
| `frontend-service.yaml` | Service (ClusterIP) | Internal frontend access on port 3000 |
| `ingress.yaml` | Ingress (×2) | Split routing — `/api/*` → backend with rewrite, `/` → frontend |
| `secrets.env.example` | Template | Copy to `secrets.env` and fill in real values |
| `secrets.env` | Local only | **Gitignored.** Contains real passwords + `SECRET_KEY` |
| `apply-secrets.sh` | Script | Reads `secrets.env` and creates `postgres-secret` + `backend-secret` via `kubectl` |

**Secrets are never stored in YAML in the repo.** They are created from a local gitignored `secrets.env` file via a script.

### Architecture

```
Internet / localhost
    │
    ▼
[NGINX Ingress Controller] (LoadBalancer Service, port 80)
    │
    ├─ /api/* ──── (rewrite-target /$2) ──► [backend Service :8000]
    │                                              │
    │                                              ▼
    │                                       [backend Deployment]
    │                                        2 replicas (FastAPI)
    │                                              │
    │                                              ▼
    │                                       [postgres Service :5432]
    │                                              │
    │                                              ▼
    │                                       [postgres StatefulSet]
    │                                        1 replica + 1Gi PVC
    │
    └─ /* ──────────────────────────────► [frontend Service :3000]
                                                   │
                                                   ▼
                                            [frontend Deployment]
                                             2 replicas (Nginx + SPA)
```

### Quick Deploy with k3d (local demo)

`k3d` runs k3s in Docker — fastest local Kubernetes for demos.

**Prerequisites:** Docker, `kubectl`, `k3d` (`brew install k3d`).

```bash
# 1. Create cluster with port 80 mapped, Traefik disabled
k3d cluster create findle \
  --port "80:80@loadbalancer" \
  --port "443:443@loadbalancer" \
  --k3s-arg "--disable=traefik@server:0"

# 2. Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.1/deploy/static/provider/cloud/deploy.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# 3. Build images and import into k3d (faster than DockerHub round-trip)
docker build -t zimbakovtech/findle-backend:latest ./backend
docker build --build-arg VITE_API_URL=/api -t zimbakovtech/findle-frontend:latest ./frontend

k3d image import zimbakovtech/findle-backend:latest -c findle
k3d image import zimbakovtech/findle-frontend:latest -c findle

# 4. Prepare secrets
cp k8s/secrets.env.example k8s/secrets.env
# Edit k8s/secrets.env — set real passwords and SECRET_KEY (use: openssl rand -hex 32)

# 5. Apply everything
bash k8s/apply-secrets.sh
kubectl apply -f k8s/

# 6. Wait for all pods
kubectl get pods -n findle -w
```

Open [http://localhost](http://localhost). API docs at [http://localhost/api/docs](http://localhost/api/docs).

### Deploy to a Production Cluster

```bash
# 1. Ensure NGINX Ingress Controller is installed
# 2. Push images to DockerHub via tag push (CD workflow)
git tag v1.0.0 && git push origin v1.0.0

# 3. Prepare secrets
cp k8s/secrets.env.example k8s/secrets.env
# Edit with production-grade values

# 4. Apply
bash k8s/apply-secrets.sh
kubectl apply -f k8s/
```

### Verify Deployment

```bash
# Pod status
kubectl get pods -n findle

# All resources
kubectl get all -n findle

# Ingress (should show CLASS=nginx and an ADDRESS)
kubectl get ingress -n findle

# Init container logs (migrations)
kubectl logs -n findle deployment/backend -c db-migrate

# Backend logs
kubectl logs -n findle -l app=backend -c backend --tail=50

# Postgres logs
kubectl logs -n findle statefulset/postgres

# Test ingress routes
curl -I http://localhost/                     # frontend HTML
curl -I http://localhost/api/openapi.json     # backend JSON
curl -s http://localhost/api/openapi.json | head -c 100
```

### Teardown

```bash
kubectl delete -f k8s/
kubectl delete secret postgres-secret backend-secret -n findle
kubectl delete namespace findle

# Or wipe entire k3d cluster
k3d cluster delete findle
```

### Key Design Decisions

- **Init container** in backend Deployment runs `alembic upgrade head` + superuser creation before the API starts — avoids race conditions between migrations and API startup.
- **StatefulSet** for Postgres with a `volumeClaimTemplate` ensures stable identity and persistent storage via PVC, surviving pod restarts.
- **Two Ingress resources** instead of one — the `rewrite-target` annotation applies to all rules in an Ingress, so backend (with rewrite) and frontend (no rewrite) must be split to avoid mangling static asset paths.
- **`ROOT_PATH=/api`** environment variable tells FastAPI it's mounted behind `/api`, so generated OpenAPI URLs and Swagger UI fetches use the correct prefix.
- **`VITE_API_URL=/api`** is baked into the frontend image at build time as a relative path, so the SPA's API calls go through the same ingress.
- **Secrets workflow** — `k8s/secrets.env` (gitignored) → `apply-secrets.sh` → `kubectl create secret --dry-run | kubectl apply`. No base64 stored in repo, idempotent re-runs.
- **Resource limits** on all containers — predictable scheduling, prevents noisy-neighbor issues.
- **Readiness + liveness probes** on every workload — Kubernetes can route traffic only to healthy pods and restart crashed ones.

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
| Deploy manifests to cluster and demonstrate | 10% | ✅ Done (k3d local cluster) |

**Total: 100%**

---

*© 2025 Damjan Zimbakov — FINKI CI/CD Course*
