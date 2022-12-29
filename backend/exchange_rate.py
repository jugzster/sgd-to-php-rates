from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel


class ExchangeRate(BaseModel):
    """
    Exchange Rate data
    """

    source: str
    effective_on: datetime
    rate: Decimal
    fee: float
    updated_on: datetime
