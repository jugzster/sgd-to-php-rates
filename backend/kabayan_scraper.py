import asyncio
from datetime import datetime
import os

from dotenv import load_dotenv
from playwright.async_api import async_playwright
from exchange_rate import ExchangeRate
from utils import get_browser_launch_args

SOURCE = "Kabayan"
FEE = 4

load_dotenv()
timeout = int(os.getenv("SCRAPE_TIMEOUT"))


async def get_rate() -> ExchangeRate:
    """
    Scrape from webpage
    """
    async with async_playwright() as p:
        url = "https://www.kabayan.sg/transaction.aspx"
        browser = await p.chromium.launch(headless=True, args=get_browser_launch_args())
        page = await browser.new_page()
        await page.goto(url, timeout=timeout)

        rate = await page.locator("#exchangeRates").inner_text()
        await browser.close()

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
