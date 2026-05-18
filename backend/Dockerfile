FROM python:3.12-slim
ENV POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app/
COPY . .

RUN pip install --no-cache-dir poetry==1.8.5

RUN poetry config installer.max-workers 10
RUN poetry install --without dev --no-interaction --no-ansi --no-root

EXPOSE 8000

CMD ["./scripts/init_db.sh"]
