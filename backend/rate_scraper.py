import asyncio
from datetime import datetime
import time
import logging
import logging.config
import yaml

from database import (
    save_historical_rates,
    save_latest_rates,
    save_status,
)
from exchange_rate import ExchangeRate
import dbs_scraper
import iremit_scraper
import kabayan_scraper
import mid_rate_scraper
import metroremit_scraper
import steadfast_scraper
import wise_scraper

with open("log_config.yaml", "r", encoding="utf-8") as f:
    config = yaml.safe_load(f.read())
    logging.config.dictConfig(config)

logger = logging.getLogger(__name__)


async def run_scrape() -> tuple[list[ExchangeRate], list[Exception]]:
    rates, errors = await scrape_rates()
    date_now = datetime.utcnow()

    save_latest_rates(rates, date_now)  # Saves to MongoDB
    save_historical_rates(rates, date_now)  # Saves to MongoDB
    save_status(date_now, errors)  # Saves to MongoDB

    return rates, errors


async def scrape_rates() -> tuple[list[ExchangeRate], list[Exception]]:
    start = time.perf_counter()

    # TODO Add retries, heck https://github.com/jd/tenacity
    results = await asyncio.gather(
        asyncio.to_thread(mid_rate_scraper.get_rate),
        iremit_scraper.get_rate(),
        kabayan_scraper.get_rate(),
        steadfast_scraper.get_rate(),
        dbs_scraper.get_rate(),
        metroremit_scraper.get_rate(),
        wise_scraper.get_rate(),
        return_exceptions=True,
    )

    rates = [rate for rate in results if not isinstance(rate, Exception)]
    errors = [rate for rate in results if isinstance(rate, Exception)]

    elapsed = time.perf_counter() - start
    logger.info("Scraped %s rates, took %ss", len(rates), f"{elapsed:0.2f}")

    for rate in rates:
        logger.info(rate)

    for error in errors:
        logger.error(error)

    return rates, errors


async def main():
    rates, errors = await run_scrape()
    print(f"{len(rates)} new rates:", rates)
    print(f"{len(errors)} errors: {errors}")


if __name__ == "__main__":
    asyncio.run(main())
