import asyncio
from datetime import datetime
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

    rate = data['currency_rate']
    date_now = datetime.now()
    return ExchangeRate(effective_on=date_now, source=SOURCE, rate=rate, fee=FEE, updated_on=date_now)


async def main():
    rate = await get_rate()
    print(rate)


if __name__ == '__main__':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
