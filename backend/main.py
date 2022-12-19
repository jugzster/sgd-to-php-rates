from fastapi import FastAPI
import uvicorn
import yfinance as yf

from rate_repository import RateRepository

app = FastAPI()


@app.get('/')
async def root():
    return {'message': "Hi Sel"}


@app.get('/rates')
async def get_rates():
    db = RateRepository()
    rates = db.get_latest_rates()
    return rates


def get_market_rate():
    ticker = yf.Ticker('SGDPHP=X')
    market_rate = ticker.info['regularMarketPrice']
    print('market rate', market_rate)
    return market_rate


@app.post('/scraperates')
async def scrape_rates():
    pass


if __name__ == '__main__':
    uvicorn.run(app)
