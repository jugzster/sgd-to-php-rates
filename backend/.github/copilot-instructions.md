# Copilot Instructions for sgd-to-php-rates Backend

## Project Overview

This backend service aggregates SGD to PHP exchange rates from multiple sources, exposes them via a FastAPI web API, and persists results in MongoDB. It supports local development, Docker deployment, and AWS Lambda containerization. Scraping is performed using Playwright and asyncio for concurrency.

## Key Components

- `main.py`: FastAPI app entrypoint. Defines API endpoints for rates, status, and triggering scrapes. Handles basic auth via environment variables.
- `rate_scraper.py`: Orchestrates concurrent scraping from all sources, saves results to DB, logs errors/status. Uses asyncio.gather for parallel execution.
- `database.py`: MongoDB integration. Handles saving/retrieving rates and status. Uses environment variables for DB config.
- `exchange_rate.py`, `status.py`: Pydantic models for API and DB data.
- `*_scraper.py`: Individual scrapers for each provider (e.g., `dbs_scraper.py`, `wise_scraper.py`). Each exposes an async `get_rate()` returning `ExchangeRate`.
- `log_config.yaml`: Centralized logging config for all modules.
- `Dockerfile`: Multi-stage build for Playwright/AWS Lambda. Local entrypoint runs FastAPI via Uvicorn.
- `requirements.txt`: Python dependencies, including Playwright, FastAPI, MongoDB, etc.

## Developer Workflows

- **Local Development**:
  - Create/activate venv: `python -m venv venv`; `venv\Scripts\Activate.ps1`
  - Install deps: `pip install -r requirements.txt`; `playwright install`
  - Run API: `uvicorn main:app`
- **Docker**:
  - Build: `docker build -t sgd-to-php-rates .`
  - Run: `docker run -d --rm --env-file=.env -p 8069:8069 sgd-to-php-rates`
- **AWS Lambda**:
  - Build/push container per Dockerfile instructions. Set AWS credentials in terminal before ECR push.
- **Scraping**:
  - Use `/scrape/{source}` or `/scraperates` endpoints to trigger scraping. All scrapers must return `ExchangeRate`.
  - Playwright codegen: `playwright codegen [website]` for new scraper development.

## Patterns & Conventions

- All logging is routed via `log_config.yaml`.
- MongoDB collections: `latestRates`, `historicalRates`, `status`.
- Scraper modules must implement async `get_rate()` returning `ExchangeRate`.
- API authentication uses HTTP Basic, credentials from `.env`.
- Data models use Pydantic for validation/serialization.
- Environment variables loaded via `python-dotenv`.
- Error handling: Scraper errors are collected and logged, status is persisted in DB.
- Concurrency: Scraping uses `asyncio.gather` for parallel execution.

## Integration Points

- **MongoDB**: Connection via `DATABASE_URL`/`DATABASE_NAME` in `.env`.
- **Playwright**: Used for browser automation in scrapers.
- **AWS Lambda**: Containerized deployment supported via Dockerfile.

## Example: Adding a New Scraper

1. Create `<provider>_scraper.py` with async `get_rate()` returning `ExchangeRate`.
2. Import and add to `rate_scraper.py` and `main.py` endpoint switch/case.
3. Ensure logging and error handling follow project patterns.

## References

- See `notes.md` for setup, Playwright, Docker, and AWS tips.
- Key files: `main.py`, `rate_scraper.py`, `database.py`, `log_config.yaml`, `Dockerfile`, `requirements.txt`, `.env`.

---

_Update this file if project structure or workflows change. Feedback welcome for unclear sections._
