import time
import asyncio
from datetime import datetime
from decimal import Decimal
import aiohttp

from exchange_rate import ExchangeRate

SOURCE = 'Steadfast'
FEE = 4


async def get_rate() -> ExchangeRate:
    '''
    Get from Steadfast API
    '''
    url = 'https://www.steadfastmoneytransfer.com/wp-json/countries/v1/currency'
    payload = {'currency': 'PHP'}

    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=payload, timeout=20) as response:
            data = await response.json()

    rate = Decimal(data['currency_rate'])
    date_now = datetime.now()
    return ExchangeRate(date_now, SOURCE, rate, FEE, date_now)


async def main():
    s = time.perf_counter()
    rate = await get_rate()
    elapsed = time.perf_counter() - s
    print(f'Done in {elapsed:0.2f} seconds')
    print(rate)


if __name__ == '__main__':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
