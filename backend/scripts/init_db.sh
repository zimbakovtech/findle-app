#!/bin/bash
set -e

poetry run alembic upgrade head

echo "Running create_superuser.py..."
PYTHONPATH=/app poetry run python -m src.utils.create_superuser

if [ $? -eq 0 ]; then
    echo "Successfully ran create_superuser.py."
else
    echo "Error running create_superuser.py. Exiting."
    exit 1
fi

echo "Running populate_table.py..."
PYTHONPATH=/app poetry run python -m src.utils.populate_table

if [ $? -eq 0 ]; then
    echo "Successfully ran populate_table.py."
else
    echo "Error running populate_table.py. Exiting."
    exit 1
fi

echo "Both scripts executed successfully."

poetry run uvicorn --host 0.0.0.0 --port 8000 src.app:app
