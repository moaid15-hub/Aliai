# syntax=docker/dockerfile:1
FROM python:3.11 AS base  # full image (not slim) for wider wheel availability

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_ONLY_BINARY=:all:

WORKDIR /app

# System deps: build tools + Rust (for rare cases) and curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl build-essential rustc cargo && rm -rf /var/lib/apt/lists/*

# Upgrade pip tooling first
RUN python -m pip install --upgrade pip setuptools wheel

# Copy requirements first for better caching
COPY requirements.txt /app/requirements.txt

# Ensure binary wheels for pydantic/pydantic-core, then install rest
RUN pip install --only-binary=:all: "pydantic<3" "pydantic-core<3" \
 && pip install --prefer-binary -r /app/requirements.txt

# Copy app
COPY . /app/

# Default command (reads PORT from env)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers ${UVICORN_WORKERS:-2}"]