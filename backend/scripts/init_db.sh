#!/bin/bash
set -e

poetry run alembic upgrade head

echo "Running create_superuser.py..."
PYTHONPATH=/app poetry run python -m src.utils.create_superuser

if [ "${SEED_DATA:-true}" = "true" ]; then
    echo "Seeding data..."
    PYTHONPATH=/app poetry run python -m src.utils.populate_table
fi

echo "Starting server..."
poetry run uvicorn --host 0.0.0.0 --port 8000 src.app:app
