from __future__ import annotations
from pydantic import BaseModel, ConfigDict


class FuneralHomeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    internal_id: int
    cluster_id: int | None = None

    name: str | None = None
    street: str | None = None
    city: str | None = None
    region: str | None = None
    postal_code: str | None = None
    country: str | None = None

    phone: str | None = None
    website: str | None = None
    latitude: float | None = None
    longitude: float | None = None

    sources: str | None = None
    source_ids: str | None = None
    cluster_size: int | None = None
