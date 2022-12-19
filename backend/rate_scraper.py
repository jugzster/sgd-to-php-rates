import asyncio
import time

import dbs_scraper
import iremit_scraper
import iremit_walkin_scraper
import kabayan_scraper
import mid_rate_scraper
import metroremit_scraper
import steadfast_scraper
import wise_scraper


async def scrape_rates():
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


async def main():
    start = time.perf_counter()
    exchange_rates = await scrape_rates()
    elapsed = time.perf_counter() - start
    print(f'After async task get_rates time elapsed {elapsed}s')

if __name__ == '__main__':
    asyncio.run(main())
