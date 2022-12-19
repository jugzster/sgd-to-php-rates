from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel


class ExchangeRate(BaseModel):
    '''
    Exchange Rate data
    '''
    effective_on: datetime
    source: str
    rate: Decimal
    fee: float
    updated_on: datetime
