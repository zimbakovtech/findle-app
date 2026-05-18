#!/usr/bin/env bash
# Reads k8s/secrets.env and creates/replaces Kubernetes Secrets in the findle namespace.
# Run this once before `kubectl apply -f k8s/`.
# secrets.env is gitignored — never commit it.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/secrets.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found."
  echo "Copy k8s/secrets.env.example to k8s/secrets.env and fill in real values."
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

kubectl apply -f "$SCRIPT_DIR/namespace.yaml"

kubectl create secret generic postgres-secret \
  --namespace findle \
  --from-literal=POSTGRES_USER="$POSTGRES_USER" \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --from-literal=POSTGRES_DB="$POSTGRES_DB" \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --save-config \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic backend-secret \
  --namespace findle \
  --from-literal=SECRET_KEY="$SECRET_KEY" \
  --from-literal=FIRST_SUPERUSER_PASSWORD="$FIRST_SUPERUSER_PASSWORD" \
  --save-config \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Secrets applied to namespace 'findle'."
