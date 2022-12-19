import asyncio
from datetime import datetime

from playwright.async_api import async_playwright
from exchange_rate import ExchangeRate

SOURCE = 'IRemit'
FEE = 4


async def get_rate() -> ExchangeRate:
    '''
    Scrape from webpage. Select SGD from dropdown list, then get exchange rate text.
    '''
    async with async_playwright() as p:
        url = 'https://iremitx.com'
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url)

        await page.locator('select[id="select-web"]').select_option('SIN')
        rate_text = await page.locator('span.exchange-rate-value').first.inner_text()
        await browser.close()

        rate = rate_text.replace('PHP ', '')
        date_now = datetime.now()
        return ExchangeRate(effective_on=date_now, source=SOURCE, rate=rate, fee=FEE, updated_on=date_now)


async def main():
    rate = await get_rate()
    print(rate)


if __name__ == '__main__':
    asyncio.run(main())
