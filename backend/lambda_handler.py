import asyncio
import json
import rate_scraper


# For AWS Lambda
def handler(event, context):
    print("Event received: ", event)
    try:
        rates, errors = asyncio.run(rate_scraper.run_scrape())
        print(f"Update rates result: {len(rates)} rates, {len(errors)} errors")
        return {
            "statusCode": 200,
            "body": {
                "rates": json.dumps(rates, default=str),
                "errors": json.dumps(errors, default=str),
            },
        }
    except Exception as e:
        print("Error: ", e)
        return {
            "statusCode": 500,
            "body": str(e),
        }
