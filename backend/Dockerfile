# Builder stage
FROM python:3.10.13 AS builder

WORKDIR /app

# Install poetry
RUN pip install poetry==1.7.1

# Copy only necessary files first
COPY pyproject.toml poetry.lock ./

# Configure poetry
RUN poetry config virtualenvs.in-project true

# Copy application code
COPY . .

# Install dependencies after app directory is ready
RUN poetry install --no-dev --no-interaction --no-ansi

# Final stage
FROM python:3.10.13-slim

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/.venv ./.venv
COPY --from=builder /app/app ./app
COPY --from=builder /app/pyproject.toml ./
COPY --from=builder /app/migrations ./migrations

# Set environment variables
ENV PATH="/app/.venv/bin:$PATH" \
    PORT=8080 \
    HOST="0.0.0.0" \
    PYTHONUNBUFFERED=1

# Set permissions and create non-root user
RUN useradd -r -s /bin/false appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Run the application with gunicorn
CMD ["gunicorn", "app.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8080", "--access-logfile", "-", "--error-logfile", "-", "--log-level", "info"]
