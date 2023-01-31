from datetime import datetime
import os
import secrets
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from exchange_rate import ExchangeRate
import rate_scraper
from database import (
    get_latest_rates,
    save_latest_rates,
    save_historical_rates,
    get_latest_status,
    save_status,
)
from status import Status

app = FastAPI()
security = HTTPBasic()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
api_user = os.getenv("API_USER")
api_password = os.getenv("API_PASSWORD")


@app.get("/")
async def root():
    return {"message": "Hi Sel and Kurt"}


@app.get("/rates", response_model=list[ExchangeRate])
async def get_rates():
    rates = get_latest_rates()
    return rates


@app.post("/scraperates", response_model=list[ExchangeRate])
async def scrape(credentials: HTTPBasicCredentials = Depends(security)):
    verify(credentials)
    rates, errors = await rate_scraper.scrape_rates()
    date_now = datetime.utcnow()

    # TODO async via Motor
    save_latest_rates(rates, date_now)
    save_historical_rates(rates, date_now)
    save_status(date_now, errors)

    latest_rates = get_latest_rates()
    return latest_rates


@app.get("/status", response_model=Status)
async def get_status():
    status_result = get_latest_status()
    return status_result


def verify(credentials: HTTPBasicCredentials) -> None:
    current_username_bytes = credentials.username.encode("utf8")
    correct_username_bytes = api_user.encode("utf8")
    is_correct_username = secrets.compare_digest(
        current_username_bytes, correct_username_bytes
    )
    current_password_bytes = credentials.password.encode("utf8")
    correct_password_bytes = api_password.encode("utf8")
    is_correct_password = secrets.compare_digest(
        current_password_bytes, correct_password_bytes
    )
    if not (is_correct_username and is_correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )


if __name__ == "__main__":
    uvicorn.run(app)
