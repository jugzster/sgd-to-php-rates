from datetime import datetime

import yfinance as yf
from exchange_rate import ExchangeRate

SOURCE = "MidRate"


def get_rate():
    """
    Get market rate from Yahoo Finance
    """
    ticker = yf.Ticker("SGDPHP=X")
    rate = str(ticker.info["regularMarketPrice"])
    date_now = datetime.now()
    return ExchangeRate(
        effective_on=date_now, source=SOURCE, rate=rate, fee=0, updated_on=date_now
    )


def main():
    rate = get_rate()
    print(rate)


if __name__ == "__main__":
    main()
