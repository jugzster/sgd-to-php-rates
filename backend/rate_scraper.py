import asyncio
import csv
import time

from exchange_rate import ExchangeRate
import dbs_scraper
import iremit_scraper
import iremit_walkin_scraper
import kabayan_scraper
import mid_rate_scraper
import metroremit_scraper
import steadfast_scraper
import wise_scraper
from rate_repository import RateRepository


async def get_rates():
    # TODO: Logging
    exchange_rates = await asyncio.gather(
        asyncio.to_thread(mid_rate_scraper.get_rate),
        iremit_scraper.get_rate(),
        asyncio.to_thread(iremit_walkin_scraper.get_rate),
        kabayan_scraper.get_rate(),
        steadfast_scraper.get_rate(),
        dbs_scraper.get_rate(),
        metroremit_scraper.get_rate(),
        wise_scraper.get_rate(),
        return_exceptions=True)

    valid_rates = [
        rate for rate in exchange_rates if not isinstance(rate, Exception)]
    print('Exchange rates:')
    print(*exchange_rates, sep='\n')

    errors = [rate for rate in exchange_rates if isinstance(rate, Exception)]
    print('Errors:')
    print(*errors, sep='\n')

    return valid_rates


def write_to_csv(exchange_rates: list[ExchangeRate]):
    with open('./testfiles/new_rates.csv', mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)

        for rate in exchange_rates:
            writer.writerow([rate.source, rate.effective_on,
                            rate.rate, rate.fee, rate.updated_on])


async def main():
    start = time.perf_counter()
    exchange_rates = await get_rates()
    elapsed = time.perf_counter() - start
    print(f'After async task get_rates time elapsed {elapsed}s')

    write_to_csv(exchange_rates)

    # rate_db = RateRepository()
    # rate_db.save_latest_rates(exchange_rates)
    # rate_db.save_historical_rates(exchange_rates)


if __name__ == '__main__':
    # asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
