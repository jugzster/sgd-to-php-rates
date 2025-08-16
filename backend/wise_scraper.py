import asyncio
from datetime import datetime

import aiohttp
from exchange_rate import ExchangeRate

SOURCE = "Wise"
FEE = 4.27


async def get_rate() -> ExchangeRate:
    # Get from API https://wise.com/gateway/v4/comparisons?sourceCurrency=SGD&targetCurrency=PHP&sendAmount=1000
    # Not scrape, Wise changed their HTML structure
    async with aiohttp.ClientSession() as session:
        async with session.get(
            "https://wise.com/gateway/v4/comparisons",
            params={
                "sourceCurrency": "SGD",
                "targetCurrency": "PHP",
                "sendAmount": 1000,
            },
            timeout=20,
        ) as response:
            data = await response.json()

    provider = next(
        provider for provider in data["providers"] if provider["name"] == "Wise"
    )
    quotes = provider["quotes"]
    rate = quotes[0]["rate"]
    date_now = datetime.now()
    return ExchangeRate(
        effective_on=date_now,
        source=SOURCE,
        rate=rate,
        fee=FEE,
        updated_on=date_now,
    )


async def main():
    rate = await get_rate()
    print(rate)


if __name__ == "__main__":
    asyncio.run(main())
