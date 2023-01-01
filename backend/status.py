from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Status(BaseModel):
    """
    Status when saving rates
    """

    id: Optional[str]
    status: str
    updated_on: datetime
    errors: list[str]
