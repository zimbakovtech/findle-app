## Summary

<!-- What changed and why. Include relevant context, linked issues, or screenshots. -->

---

## Pre-merge Checklist

### Backend (`cd backend`)

- [ ] `poetry run task format` — ruff format, no diff
- [ ] `poetry run task lint` — ruff lint + mypy strict, clean pass
- [ ] `poetry run task test` — pytest, 100% coverage

### Frontend (`cd frontend`)

- [ ] `npm run lint` — ESLint, 0 errors
- [ ] `npm run build` — tsc + vite build succeeds

### General

- [ ] New backend endpoint → test added in `tests/routes/`
- [ ] New DB column → Alembic migration generated and verified
- [ ] No secrets or `.env` files committed
