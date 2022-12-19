from datetime import datetime
from decimal import Decimal

import yfinance as yf
from exchange_rate import ExchangeRate

SOURCE = 'MidRate'


def get_rate():
    '''
    Get market rate from Yahoo Finance
    '''
    ticker = yf.Ticker('SGDPHP=X')
    market_price = str(ticker.info['regularMarketPrice'])
    date_now = datetime.now()
    return ExchangeRate(date_now, SOURCE, Decimal(market_price), 0, date_now)


def main():
    rate = get_rate()
    print(rate)


if __name__ == '__main__':
    main()
