# syntax = docker/dockerfile:1.2

# Official Playwright image
FROM mcr.microsoft.com/playwright/python:v1.54.0-jammy

WORKDIR /app

# Install required packages
COPY requirements.txt .
RUN python -m pip install --no-cache-dir -r requirements.txt

COPY . /app

# Entrypoint. Runs the application on all network interfaces (0.0.0.0), on specified port
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8069"]