# Dockerfile for Research Backend
# Multi-stage build for development and production

# Base image with Python 3.11
FROM python:3.11-slim as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry==2.1.4

# Configure Poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Copy Poetry files
COPY pyproject.toml poetry.lock ./

# Development stage
FROM base as development

# Install dependencies including dev dependencies
RUN poetry install --with dev && rm -rf $POETRY_CACHE_DIR

# Copy source code
COPY . .

# Create non-root user for development
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app

# Expose port
EXPOSE 8000

# Default command for development (will be overridden by docker-compose)
CMD ["/usr/local/bin/poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production stage
FROM base as production

# Install only production dependencies
RUN poetry install --only=main --no-dev && rm -rf $POETRY_CACHE_DIR

# Copy source code
COPY . .

# Create non-root user for production
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Production command
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]