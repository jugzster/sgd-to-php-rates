from datetime import datetime
import os
import logging
import logging.config
import pymongo
import yaml
from bson.decimal128 import Decimal128

from pymongo import InsertOne, MongoClient, UpdateOne
from dotenv import load_dotenv
from exchange_rate import ExchangeRate
from status import Status


with open("log_config.yaml", "r", encoding="utf-8") as f:
    config = yaml.safe_load(f.read())
    logging.config.dictConfig(config)

logger = logging.getLogger(__name__)

load_dotenv()
db_url = os.getenv("DATABASE_URL")
db_name = os.getenv("DATABASE_NAME")
client = MongoClient(db_url)
db = client[db_name]

logger.info("db_name: %s", db_name)
print(f"db_name: {db_name}")


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


def save_latest_rates(exchange_rates: list[ExchangeRate], updated_on: datetime):
    try:
        collection = db.latestRates

        # Bulk upsert records
        mongo_rates = [to_mongodb_object(x, updated_on) for x in exchange_rates]
        requests = []
        for rate in mongo_rates:
            requests.append(
                UpdateOne({"source": rate["source"]}, {"$set": rate}, upsert=True)
            )
        result = collection.bulk_write(requests)
        logger.info("latestRates %i records updated", result.modified_count)
    except Exception:
        logger.exception("DB error occurred saving to latestRates")


def to_mongodb_object(exchange_rate: ExchangeRate, updated_on: datetime):
    # TODO rename Mongodb fields for consistency i.e. effective_on
    # TODO Use UTC for effective_on
    return {
        "effectiveOn": exchange_rate.effective_on,
        "rate": Decimal128(exchange_rate.rate),
        "source": exchange_rate.source,
        "fee": exchange_rate.fee,
        "updatedOn": updated_on,
    }


def save_historical_rates(exchange_rates: list[ExchangeRate], updated_on: datetime):
    try:
        collection = db.historicalRates

        # Bulk insert records
        mongo_rates = [to_mongodb_object(x, updated_on) for x in exchange_rates]
        requests = []
        for rate in mongo_rates:
            requests.append(InsertOne(rate))
        result = collection.bulk_write(requests)
        logger.info("historicalRates %i records inserted", result.inserted_count)
    except Exception:
        logger.exception("DB error occurred saving to historicalRates")


def save_status(updated_on: datetime, errors: list[Exception]):
    try:
        collection = db.status
        status_result = "Error" if errors else "OK"
        status = {
            "status": status_result,
            "updatedOn": updated_on,
            "errors": [str(e) for e in errors],
        }
        result = collection.insert_one(status)
        logger.info(
            "status %s, %i errors, ID %s",
            status_result,
            len(errors),
            result.inserted_id,
        )
    except Exception:
        logger.exception("DB error occurred saving to status")


def get_latest_status() -> Status:
    try:
        collection = db.status
        status = collection.find_one({}, sort=[("_id", pymongo.DESCENDING)])
        return Status(
            id=str(status["_id"]),
            status=status["status"],
            updated_on=status["updatedOn"],
            errors=status["errors"],
        )
    except Exception:
        logger.exception("DB error getting status")
        raise


def main():
    rates = get_latest_rates()
    for rate in rates:
        print(rate)


if __name__ == "__main__":
    main()
