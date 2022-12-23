import os
import logging
import logging.config
import yaml
from bson.decimal128 import Decimal128

from pymongo import InsertOne, MongoClient, UpdateOne
from dotenv import load_dotenv
from exchange_rate import ExchangeRate


with open('log_config.yaml', 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f.read())
    logging.config.dictConfig(config)

logger = logging.getLogger(__name__)


class RateRepository:
    '''
    Interface to Rates DB in MongoDB
    '''

    def __init__(self) -> None:
        load_dotenv()
        db_url = os.getenv('DATABASE_URL')
        client = MongoClient(db_url)
        self.db = client.exchangeRateDB

    def get_latest_rates(self) -> list[ExchangeRate]:
        try:
            collection = self.db.latestRates
            results = collection.find({})
            rates = [self.to_exchange_rate(r) for r in results]
            logger.debug('Got %i rates', len(rates))
            return rates
        except Exception:
            logger.exception('DB error getting latestRates')
            raise

    @staticmethod
    def to_exchange_rate(rate) -> ExchangeRate:
        return ExchangeRate(effective_on=rate['effectiveOn'], source=rate['source'], rate=rate['rate'].to_decimal(), fee=rate['fee'], updated_on=rate['updatedOn'])

    def save_latest_rates(self, exchange_rates: list[ExchangeRate]):
        try:
            collection = self.db.latestRates

            # Bulk upsert records
            mongo_rates = [self.to_mongodb_object(x) for x in exchange_rates]
            requests = []
            for rate in mongo_rates:
                requests.append(UpdateOne({'source': rate['source']}, {
                                '$set': rate}, upsert=True))
            result = collection.bulk_write(requests)
            logger.info('latestRates %i records updated',
                        result.modified_count)
        except Exception:
            logger.exception('DB error occurred saving to latestRates')

    @staticmethod
    def to_mongodb_object(exchange_rate: ExchangeRate):
        # TODO rename Mongodb fields for consistency i.e. effective_on
        return {
            'effectiveOn': exchange_rate.effective_on,
            'rate': Decimal128(exchange_rate.rate),
            'source': exchange_rate.source,
            'fee': exchange_rate.fee,
            'updatedOn': exchange_rate.updated_on
        }

    def save_historical_rates(self, exchange_rates: list[ExchangeRate]):
        try:
            collection = self.db.historicalRates

            # Bulk insert records
            mongo_rates = [self.to_mongodb_object(x) for x in exchange_rates]
            requests = []
            for rate in mongo_rates:
                requests.append(InsertOne(rate))
            result = collection.bulk_write(requests)
            logger.info('historicalRates %i records inserted',
                        result.inserted_count)
        except Exception:
            logger.exception('DB error occurred saving to historicalRates')


def main():
    rates = RateRepository().get_latest_rates()
    for rate in rates:
        print(rate)


if __name__ == '__main__':
    main()
