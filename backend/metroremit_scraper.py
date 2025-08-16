import asyncio
from datetime import datetime
import os

from dotenv import load_dotenv
from playwright.async_api import async_playwright
from exchange_rate import ExchangeRate

SOURCE = "MetroRemit"
FEE = 4

load_dotenv()
timeout = int(os.getenv("SCRAPE_TIMEOUT"))


async def get_rate() -> ExchangeRate:
    """
    Scrape from webpage
    """
    async with async_playwright() as p:
        url = "https://sg.metroremit.com/"
        browser = await p.chromium.launch(headless=True)
        # Change user agent as this website blocks headless user agent
        context = await browser.new_context(
            user_agent="'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'"
        )
        page = await context.new_page()
        await page.goto(url, timeout=timeout)

        main_text = await page.locator("#popular-packages >> text=SGD").inner_text()
        await browser.close()

        #  Text sample: 'SGD1 = PHP40.75000'
        rate_text = main_text.replace(" ", "").upper()
        rate = rate_text.split("=", maxsplit=2)[1].removeprefix("PHP")
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
