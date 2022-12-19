from typing import NamedTuple
from decimal import Decimal
from datetime import datetime


class ExchangeRate(NamedTuple):
    '''
    Exchange Rate data
    '''
    effective_on: datetime
    source: str
    rate: Decimal
    fee: int
    updated_on: datetime
