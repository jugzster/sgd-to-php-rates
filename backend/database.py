import os
import logging
import logging.config
import yaml
from bson.decimal128 import Decimal128

from pymongo import InsertOne, MongoClient, UpdateOne
from dotenv import load_dotenv
from exchange_rate import ExchangeRate


with open("log_config.yaml", "r", encoding="utf-8") as f:
    config = yaml.safe_load(f.read())
    logging.config.dictConfig(config)

logger = logging.getLogger(__name__)

load_dotenv()
db_url = os.getenv("DATABASE_URL")
db_name = os.getenv("DATABASE_NAME")
client = MongoClient(db_url)
db = client[db_name]


def get_latest_rates() -> list[ExchangeRate]:
    try:
        collection = db.latestRates
        results = collection.find({})
        rates = [to_exchange_rate(r) for r in results]
        logger.debug("Got %i rates", len(rates))
        return rates
    except Exception:
        logger.exception("DB error getting latestRates")
        raise


def to_exchange_rate(rate) -> ExchangeRate:
    return ExchangeRate(
        id=str(rate["_id"]),
        effective_on=rate["effectiveOn"],
        source=rate["source"],
        rate=rate["rate"].to_decimal(),
        fee=rate["fee"],
        updated_on=rate["updatedOn"],
    )


def save_latest_rates(exchange_rates: list[ExchangeRate]):
    try:
        collection = db.latestRates

        # Bulk upsert records
        mongo_rates = [to_mongodb_object(x) for x in exchange_rates]
        requests = []
        for rate in mongo_rates:
            requests.append(
                UpdateOne({"source": rate["source"]}, {"$set": rate}, upsert=True)
            )
        result = collection.bulk_write(requests)
        logger.info("latestRates %i records updated", result.modified_count)
    except Exception:
        logger.exception("DB error occurred saving to latestRates")


def to_mongodb_object(exchange_rate: ExchangeRate):
    # TODO rename Mongodb fields for consistency i.e. effective_on
    return {
        "effectiveOn": exchange_rate.effective_on,
        "rate": Decimal128(exchange_rate.rate),
        "source": exchange_rate.source,
        "fee": exchange_rate.fee,
        "updatedOn": exchange_rate.updated_on,
    }


def save_historical_rates(exchange_rates: list[ExchangeRate]):
    try:
        collection = db.historicalRates

        # Bulk insert records
        mongo_rates = [to_mongodb_object(x) for x in exchange_rates]
        requests = []
        for rate in mongo_rates:
            requests.append(InsertOne(rate))
        result = collection.bulk_write(requests)
        logger.info("historicalRates %i records inserted", result.inserted_count)
    except Exception:
        logger.exception("DB error occurred saving to historicalRates")


def main():
    rates = get_latest_rates()
    for rate in rates:
        print(rate)


if __name__ == "__main__":
    main()
