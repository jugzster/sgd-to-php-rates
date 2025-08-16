from datetime import datetime
import yfinance as yf
from exchange_rate import ExchangeRate

SOURCE = "MidRate"


def get_rate():
    # Get market rate for SGDPHP using yfinance
    ticker = yf.Ticker("SGDPHP=X")
    ticker_info = ticker.info
    rate_string = str(ticker_info["regularMarketPrice"])
    date_now = datetime.now()
    return ExchangeRate(
        effective_on=date_now,
        source=SOURCE,
        rate=rate_string,
        fee=0,
        updated_on=date_now,
    )


def main():
    rate = get_rate()
    print(rate)


if __name__ == "__main__":
    main()
