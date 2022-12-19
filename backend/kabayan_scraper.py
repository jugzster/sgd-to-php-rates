import asyncio
from datetime import datetime
from decimal import Decimal

from playwright.async_api import async_playwright
from exchange_rate import ExchangeRate

SOURCE = 'Kabayan'
FEE = 4


async def get_rate() -> ExchangeRate:
    '''
    Scrape from webpage
    '''
    async with async_playwright() as p:
        url = 'https://www.kabayan.sg/transaction.aspx'
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url)

        rate_text = await page.locator("#exchangeRates").inner_text()
        rate = Decimal(rate_text)
        await browser.close()

        date_now = datetime.now()
        return ExchangeRate(date_now, SOURCE, rate, FEE, date_now)


async def main():
    rate = await get_rate()
    print(rate)


if __name__ == '__main__':
    asyncio.run(main())
