#!/bin/bash
set -e

poetry run alembic downgrade base
poetry run alembic upgrade head

echo "Running create_superuser.py..."
PYTHONPATH=/app poetry run python -m src.utils.create_superuser

echo "Running populate_table.py..."
PYTHONPATH=/app poetry run python -m src.utils.populate_table

echo "Both scripts executed successfully."

echo "Starting server..."
poetry run uvicorn --host 0.0.0.0 --port 8000 --reload src.app:app
