from decimal import Decimal
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ExchangeRate(BaseModel):
    """
    Exchange Rate data
    """

    id: Optional[str]
    source: str
    effective_on: datetime
    rate: Decimal
    fee: float
    updated_on: datetime
