# Git Workflow

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Protected. Only receives merges from `develop`. |
| `develop` | Integration branch. All features merge here first. |
| `feat/<name>` | New feature development. |
| `fix/<name>` | Bug fixes. |
| `chore/<name>` | Tooling, config, dependency updates. |

## Merge Strategy

- PRs from `feat/*` and `fix/*` → `develop` (squash merge preferred)
- PRs from `develop` → `main` (merge commit)
- Direct pushes to `main` are blocked

## Release Flow

1. All features merged into `develop`
2. CI must pass on `develop` before proceeding
3. Open PR: `develop` → `main`
4. After merge to `main`, create and push a version tag:

```bash
git tag v1.2.3
git push origin v1.2.3
```

5. The tag push triggers the CD workflow — Docker images are built and pushed to DockerHub as `zimbakovtech/findle-backend:v1.2.3` and `zimbakovtech/findle-frontend:v1.2.3`

## Versioning

Follows [Semantic Versioning](https://semver.org/):

- `MAJOR` — breaking changes
- `MINOR` — new features, backwards-compatible
- `PATCH` — bug fixes

## CI/CD Summary

| Event | Workflow | Actions |
|-------|----------|---------|
| PR to `main` or `develop` | Backend CI, Frontend CI | Type check, lint, test, build |
| Push to `develop` | Backend CI, Frontend CI | Same as PR |
| Push tag `v*.*.*` | CD | Build images, push to DockerHub |

## GitHub Secrets Required

Configure these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | DockerHub username (`zimbakovtech`) |
| `DOCKERHUB_TOKEN` | DockerHub access token (not password) |
| `VITE_API_URL` | Production backend URL (e.g. `http://<server-ip>:8000`) |

For Linode deployment (future):

| Secret | Description |
|--------|-------------|
| `LINODE_HOST` | Server IP address |
| `LINODE_USER` | SSH user on server |
| `LINODE_SSH_KEY` | Private SSH key for server access |
