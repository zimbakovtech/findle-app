# Findle — Digital Book Catalog

> A production-style full-stack application built for the **CI/CD course** at FINKI (Faculty of Computer Science and Engineering, Ss. Cyril and Methodius University).
> **Author:** Damjan Zimbakov

<div align="center">

[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io)

**[Live Demo →](https://findle.zimbakov.dev)** *(Civo managed k3s)*

</div>

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Running Locally](#running-locally)
- [Backend Development](#backend-development)
- [CI/CD Pipeline](#cicd-pipeline)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Git Workflow](#git-workflow)
- [License](#license)

---

## Overview

**Findle** (FINKI + Kindle) is a digital book catalog web application. Users can browse books, manage authors, track prices, and simulate purchases — all backed by a secure REST API with JWT authentication.

The project demonstrates a complete CI/CD workflow: containerized services, automated testing with 100% coverage enforcement, strict linting and type-checking gates, GitHub Actions pipelines for CI and CD, tag-triggered Docker image releases to DockerHub, and Kubernetes manifests deployed to a live managed cluster.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | FastAPI (async), SQLAlchemy 2.0 async, PostgreSQL 16, Alembic, Pydantic v2, PyJWT, Argon2 |
| **Frontend** | React 18, TypeScript, Vite 5, Chakra UI v3, React Hook Form, Zod, Axios |
| **Infrastructure** | Docker, Docker Compose, Nginx, GitHub Actions, DockerHub, Kubernetes (k3s on Civo) |
| **Code Quality** | Ruff 0.8.4 (lint + format), mypy strict, pre-commit hooks, pytest-cov 100% |

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
| :--- | :--- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Postgres | localhost:5432 |

---

## Project Structure

```
findle-app/
├── .github/workflows/
│   ├── ci-backend.yaml           # mypy + ruff lint + pytest (Python 3.12)
│   ├── ci-frontend.yaml          # ESLint + Vite build
│   └── cd.yaml                   # Tag-triggered: build + push to DockerHub → deploy to k3s
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
│   ├── cluster-issuer.yaml       # cert-manager ClusterIssuer (Let's Encrypt)
│   ├── secrets.env.example       # Template (committed)
│   ├── secrets.env               # Real values (gitignored)
│   └── apply-secrets.sh          # Creates K8s Secrets from secrets.env
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── .env.example
│   ├── scripts/
│   │   ├── init_db.sh            # Prod: migrations → seed → uvicorn
│   │   └── init_db_dev.sh        # Dev: full DB reset → seed
│   └── src/
│       ├── api/                  # FastAPI routers + dependencies
│       ├── core/                 # Settings, security, DB engine
│       ├── migrations/           # Alembic versions
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

### Production Simulation (pull DockerHub images)

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
poetry run task test      # pytest + 100% coverage gate
poetry run task lint      # ruff check
poetry run task format    # ruff fix + ruff format
```

### Code Quality Rules

| Tool | Config | Enforces |
| :--- | :--- | :--- |
| **Ruff** 0.8.4 | `pyproject.toml` | Line length 79, rules: I, F, E, W, PL, PT, preview mode |
| **mypy** | `pyproject.toml` | Strict mode — all types required, no implicit `Any` |
| **pytest-cov** | `pyproject.toml` | 100% coverage (`--cov-fail-under=100`) |
| **pre-commit** | `.pre-commit-config.yaml` | Ruff lint + format on every commit |

---

## CI/CD Pipeline

### CI — Every PR to `main`

| Workflow | Trigger | Steps |
| :--- | :--- | :--- |
| **Backend CI** | PR → `main` | mypy → ruff lint → pytest (100% coverage) against real PostgreSQL 16 |
| **Frontend CI** | PR → `main` | ESLint → Vite build (TypeScript strict) |

Both workflows use dependency caching and write a summary to the GitHub Actions job page.

### CD — Version Tag Push

```bash
git tag v1.2.3
git push origin v1.2.3
```

Triggers `.github/workflows/cd.yaml` — two jobs run in sequence:

**Job 1: `build-push`**
1. Set up Docker Buildx with GHA layer cache
2. Log in to DockerHub
3. Build `zimbakovtech/findle-backend` for `linux/amd64`
4. Build `zimbakovtech/findle-frontend` for `linux/amd64` with `VITE_API_URL` build arg
5. Push both images tagged `v1.2.3` and `latest`

**Job 2: `deploy`** *(depends on `build-push`)*
1. Load kubeconfig from `KUBECONFIG_DATA` secret
2. `kubectl set image` on both deployments
3. `kubectl rollout status` with 600s timeout
4. Write deployment summary (pod status + live URL) to job page

### Required GitHub Secrets

| Secret | Purpose |
| :--- | :--- |
| `DOCKERHUB_USERNAME` | DockerHub account (`zimbakovtech`) |
| `DOCKERHUB_TOKEN` | DockerHub access token |
| `VITE_API_URL` | Production backend URL (injected at frontend build time) |
| `KUBECONFIG_DATA` | Base64-encoded kubeconfig for the Civo k3s cluster |

---

## Kubernetes Deployment

All manifests live in `k8s/`. All resources run in the `findle` namespace on a Civo managed k3s cluster with NGINX Ingress and TLS via cert-manager (Let's Encrypt).

### Manifest Overview

| File | Resource | Description |
| :--- | :--- | :--- |
| `namespace.yaml` | Namespace | `findle` — isolates all resources |
| `postgres-configmap.yaml` | ConfigMap | Postgres DB name and user (non-sensitive) |
| `postgres-statefulset.yaml` | StatefulSet | PostgreSQL 16, 1 replica, 1Gi PVC, `pg_isready` probes |
| `postgres-service.yaml` | Service (ClusterIP) | Internal postgres access on port 5432 |
| `backend-configmap.yaml` | ConfigMap | JWT config, superuser username/email, `SEED_DATA`, `ROOT_PATH=/api` |
| `backend-deployment.yaml` | Deployment | FastAPI, 1 replica, `Recreate` strategy, init container runs migrations |
| `backend-service.yaml` | Service (ClusterIP) | Internal backend access on port 8000 |
| `frontend-configmap.yaml` | ConfigMap | `VITE_API_URL` reference (build-time only) |
| `frontend-deployment.yaml` | Deployment | Nginx + React SPA, 2 replicas |
| `frontend-service.yaml` | Service (ClusterIP) | Internal frontend access on port 3000 |
| `ingress.yaml` | Ingress (×2) | Split routing — `/api/*` → backend with rewrite, `/` → frontend; TLS via cert-manager |
| `cluster-issuer.yaml` | ClusterIssuer | cert-manager ACME issuer for Let's Encrypt TLS certificates |
| `secrets.env.example` | Template | Copy to `secrets.env` and fill in real values |
| `secrets.env` | Local only | **Gitignored.** Contains real passwords + `SECRET_KEY` |
| `apply-secrets.sh` | Script | Reads `secrets.env` → creates `postgres-secret` + `backend-secret` via `kubectl` |

> **Secrets are never stored in YAML in the repo.** They are created from a local gitignored `secrets.env` via a script.

### Architecture

```
Internet
    │
    ▼ (HTTPS — TLS via cert-manager / Let's Encrypt)
[NGINX Ingress Controller]  (LoadBalancer, Civo cloud)
    │
    ├─ /api/* ── (rewrite-target /$2) ──► [backend Service :8000]
    │                                            │
    │                                            ▼
    │                                     [backend Deployment]
    │                                      1 replica (FastAPI)
    │                                      init: alembic + superuser
    │                                            │
    │                                            ▼
    │                                     [postgres Service :5432]
    │                                            │
    │                                            ▼
    │                                     [postgres StatefulSet]
    │                                      1 replica + 1Gi PVC
    │
    └─ /* ──────────────────────────────► [frontend Service :3000]
                                                 │
                                                 ▼
                                          [frontend Deployment]
                                           2 replicas (Nginx + SPA)
```

### Deploy to Production (Civo k3s)

```bash
# 1. Create cluster on Civo, install NGINX Ingress + cert-manager
#    Apply cluster-issuer once: kubectl apply -f k8s/cluster-issuer.yaml

# 2. Prepare secrets
cp k8s/secrets.env.example k8s/secrets.env
# Edit with production values (openssl rand -hex 32 for SECRET_KEY)

# 3. Apply namespace and secrets first
kubectl apply -f k8s/namespace.yaml
bash k8s/apply-secrets.sh

# 4. Apply all manifests
kubectl apply -f k8s/

# 5. Check pod status
kubectl get pods -n findle -w
```

Or trigger the full CD pipeline:

```bash
git tag v1.0.0 && git push origin v1.0.0
```

### Quick Demo with k3d (local)

`k3d` runs k3s in Docker — zero-cost local demo.

**Prerequisites:** Docker, `kubectl`, `k3d` (`brew install k3d`)

```bash
# 1. Create cluster
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

# 3. Build and import images
docker build -t zimbakovtech/findle-backend:latest ./backend
docker build --build-arg VITE_API_URL=/api -t zimbakovtech/findle-frontend:latest ./frontend
k3d image import zimbakovtech/findle-backend:latest -c findle
k3d image import zimbakovtech/findle-frontend:latest -c findle

# 4. Apply
kubectl apply -f k8s/namespace.yaml
cp k8s/secrets.env.example k8s/secrets.env && bash k8s/apply-secrets.sh
kubectl apply -f k8s/

# 5. Wait for pods
kubectl get pods -n findle -w
```

Open [http://localhost](http://localhost). API docs at [http://localhost/api/docs](http://localhost/api/docs).

### Verify Deployment

```bash
# All resources
kubectl get all -n findle

# Ingress (should show ADDRESS and TLS)
kubectl get ingress -n findle

# Init container logs (migrations + superuser)
kubectl logs -n findle deployment/backend -c db-migrate

# Backend logs
kubectl logs -n findle -l app=backend --tail=50

# Test routes
curl -I https://findle.zimbakov.dev/
curl -s https://findle.zimbakov.dev/api/openapi.json | python3 -m json.tool | head -20
```

### Teardown

```bash
kubectl delete -f k8s/
kubectl delete secret postgres-secret backend-secret -n findle
kubectl delete namespace findle
# k3d only:
k3d cluster delete findle
```

### Key Design Decisions

| Decision | Rationale |
| :--- | :--- |
| **Init container** for migrations | Runs `alembic upgrade head` + superuser creation before the API starts — prevents race conditions on first deploy |
| **`Recreate` strategy** on backend | Avoids memory spike from two backend pods running simultaneously on a single-node cluster during rolling updates |
| **StatefulSet** for Postgres | Stable pod identity and persistent storage via PVC, surviving restarts |
| **Two Ingress resources** | `rewrite-target` applies to all rules in an Ingress; backend (`/api` strip) and frontend (no rewrite) must be separate to avoid mangling SPA asset paths |
| **`ROOT_PATH=/api`** | Tells FastAPI it sits behind `/api`, so generated OpenAPI URLs and Swagger UI fetches use the correct prefix |
| **`VITE_API_URL=/api`** | Baked into the frontend image at build time as a relative path — API calls go through the same ingress, no hardcoded hostnames |
| **Secrets workflow** | `secrets.env` (gitignored) → `apply-secrets.sh` → `kubectl create secret --dry-run \| kubectl apply`. No base64 in repo, idempotent re-runs |
| **TLS** via cert-manager | Let's Encrypt ACME HTTP-01 challenge, auto-renewed |

---

## Git Workflow

| Branch | Purpose |
| :--- | :--- |
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

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

*© 2026 Damjan Zimbakov — FINKI CI/CD Course*

</div>
