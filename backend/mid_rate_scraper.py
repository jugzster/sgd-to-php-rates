import asyncio
from datetime import datetime
import os

from dotenv import load_dotenv
from playwright.async_api import async_playwright
from exchange_rate import ExchangeRate

SOURCE = "MidRate"

load_dotenv()
timeout = int(os.getenv("SCRAPE_TIMEOUT"))


async def get_rate():
    async with async_playwright() as p:
        url = "https://finance.yahoo.com/quote/SGDPHP=X"
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, timeout=timeout)

        rate = await page.locator('[data-test="qsp-price"]').inner_text()
        await browser.close()

        date_now = datetime.now()
        return ExchangeRate(
            effective_on=date_now, source=SOURCE, rate=rate, fee=0, updated_on=date_now
        )


async def main():
    rate = await get_rate()
    print(rate)


if __name__ == "__main__":
    asyncio.run(main())
