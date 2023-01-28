import asyncio
from datetime import datetime
import os

from dotenv import load_dotenv
from playwright.async_api import async_playwright
from exchange_rate import ExchangeRate

SOURCE = "Wise"
FEE = 4.27

load_dotenv()
timeout = int(os.getenv("SCRAPE_TIMEOUT"))


async def get_rate() -> ExchangeRate:
    """
    Scrape from https://wise.com/gb/currency-converter/sgd-to-php-rate
    Sample:
        <td class="table-hero__cell_1ZAms7u3_9">
        <span class="exchangeRate_3VNnyNPrdL">
            <span class="goodExchangeRate_1u9dlr4od8"></span>
            <span class="rate_3HN3HQ2wh2">40.9162</span>
        </span>
        <span class="labelContent_1PEAlZdRtv"
            >Mid-market rate</span
        >
        </td>
    """
    async with async_playwright() as p:
        url = "https://wise.com/gb/currency-converter/sgd-to-php-rate"
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, timeout=timeout)

        rate_text = await page.locator("td:has-text('Mid-market rate')").inner_text()

        await browser.close()

        rate = rate_text.splitlines()[0]
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
