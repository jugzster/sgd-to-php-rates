from fastapi import FastAPI
import uvicorn
from exchange_rate import ExchangeRate

import rate_scraper
from rate_repository import RateRepository

app = FastAPI()


@app.get('/')
async def root():
    return {'message': "Hi Sel and Kurt"}


@app.get('/rates', response_model=list[ExchangeRate])
async def get_rates():
    # TODO Cache repository / connection
    db = RateRepository()
    rates = db.get_latest_rates()
    return rates


@app.post('/scraperates', response_model=list[ExchangeRate])
async def scrape_rates():
    rates, _ = await rate_scraper.scrape_rates()

    # TODO async via Motor
    db = RateRepository()
    db.save_latest_rates(rates)
    db.save_historical_rates(rates)
    return rates

if __name__ == '__main__':
    uvicorn.run(app)
