from fastapi import FastAPI
import uvicorn

from exchange_rate import ExchangeRate
import rate_scraper
from database import get_latest_rates, save_latest_rates, save_historical_rates

app = FastAPI()


@app.get('/')
async def root():
    return {'message': "Hi Sel and Kurt"}


@app.get('/rates', response_model=list[ExchangeRate])
async def get_rates():
    rates = get_latest_rates()
    return rates


@app.post('/scraperates', response_model=list[ExchangeRate])
async def scrape():
    rates, _ = await rate_scraper.scrape_rates()

    # TODO async via Motor
    save_latest_rates(rates)
    save_historical_rates(rates)
    return rates


if __name__ == '__main__':
    uvicorn.run(app)
