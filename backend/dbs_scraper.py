import asyncio
from datetime import datetime
from decimal import Decimal
import time

import aiohttp
from exchange_rate import ExchangeRate

SOURCE = 'DBS'
FEE = 0


async def get_rate() -> ExchangeRate:
    '''
    Get from https://www.dbs.com.sg/sg-rates-api/v1/api/sgrates/getCurrencyConversionRates?FETCH_LATEST=1670297419516
    FETCH_LATEST=[timestamp]
    Sample:
        {
        "currency": "PHP",
        "ttSell": "2.4537",
        "ttBuy": "0",
        "quoteCurrency": "SGD",
        "ttInverseSell": "0",
        "ttInverseBuy": "0.4075477850",
        "baseCurrencyUnit": "100",
        "quoteCurrencyUnit": "1"
        },
    '''
    timestamp = round(datetime.now().timestamp() * 1000)
    url = f'https://www.dbs.com.sg/sg-rates-api/v1/api/sgrates/getCurrencyConversionRates?FETCH_LATEST={timestamp}'

    async with aiohttp.ClientSession() as session:
        async with session.get(url, timeout=20) as response:
            data = await response.json()

    rates = data['results']['assets'][0]['recData']
    php_rate = next(
        x for x in rates if x['currency'] == 'PHP' and x['quoteCurrency'] == 'SGD')
    exchange_rate = Decimal(
        php_rate['ttInverseBuy']) * int(php_rate['baseCurrencyUnit'])
    effective_datetime = datetime.strptime(
        data['effectiveDateAndTime'], '%Y-%m-%d %H:%M:%S')

    date_now = datetime.now()
    return ExchangeRate(effective_datetime, SOURCE, exchange_rate, FEE, date_now)


async def main():
    s = time.perf_counter()
    rate = await get_rate()
    elapsed = time.perf_counter() - s
    print(f'Done in {elapsed:0.2f} seconds')
    print(rate)


if __name__ == '__main__':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
