import os
from bson.decimal128 import Decimal128

from pymongo import InsertOne, MongoClient, UpdateOne
from dotenv import load_dotenv
from exchange_rate import ExchangeRate


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
            dbCollection = self.db.latestRates
            results = dbCollection.find({})
            rates = [self.to_exchange_rate(r) for r in results]
            return rates
        except Exception as exception:
            print(f'DB error getting latestRates: {exception}')

    @staticmethod
    def to_exchange_rate(rate) -> ExchangeRate:
        return ExchangeRate(effective_on=rate['effectiveOn'], source=rate['source'], rate=rate['rate'].to_decimal(), fee=rate['fee'], updated_on=rate['updatedOn'])

    def save_latest_rates(self, exchange_rates: list[ExchangeRate]):
        try:
            dbCollection = self.db.latestRates

            mongo_rates = [self.to_mongodb_object(x) for x in exchange_rates]

            # Bulk upsert records
            requests = []
            for rate in mongo_rates:
                requests.append(UpdateOne({'source': rate['source']}, {
                                '$set': rate}, upsert=True))
            result = dbCollection.bulk_write(requests)
            print(f'latestRates bulk update result: {result.modified_count}')

            count = dbCollection.count_documents({})
            print(f'MongoDB: Found {count} records in latestRates')
        except Exception as exception:
            print(f'DB error occurred saving to latestRates: {exception}')

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
            dbCollection = self.db.historicalRates

            mongo_rates = [self.to_mongodb_object(x) for x in exchange_rates]

            # Bulk insert records
            requests = []
            for rate in mongo_rates:
                requests.append(InsertOne(rate))
            result = dbCollection.bulk_write(requests)
            print(
                f'historicalRates bulk update result: {result.inserted_count}')

            count = dbCollection.count_documents({})
            print(f'MongoDB: Found {count} records in historicalRates')
        except Exception as exception:
            print(f'DB error occurred saving to historicalRates: {exception}')


def main():
    rates = RateRepository().get_latest_rates()
    for rate in rates:
        print(rate)


if __name__ == '__main__':
    main()
