# syntax = docker/dockerfile:1.2

# Official Playwright image with Python 3.10
FROM mcr.microsoft.com/playwright/python:v1.30.0-jammy

WORKDIR /app

# Load secret file, from https://render.com/docs/docker-secrets#secret-files-in-docker-builds
RUN --mount=type=secret,id=_env,dst=/etc/secrets/.env cp /etc/secrets/.env .

# Install required packages
COPY requirements.txt .
RUN python -m pip install --no-cache-dir -r requirements.txt

COPY . /app

# Entrypoint. Port 10000 is for Render, but could be any port
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]