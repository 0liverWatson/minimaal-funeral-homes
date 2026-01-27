from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String, Float


class Base(DeclarativeBase):
    pass


class FuneralHome(Base):
    __tablename__ = "funeral_homes"

    # If your canonical table uses a different PK column name, update this.
    internal_id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Canonical fields (edit if your schema differs)
    cluster_id: Mapped[str | None] = mapped_column(String, nullable=True)

    name: Mapped[str | None] = mapped_column(String, nullable=True)
    street: Mapped[str | None] = mapped_column(String, nullable=True)
    city: Mapped[str | None] = mapped_column(String, nullable=True)
    region: Mapped[str | None] = mapped_column(String, nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String, nullable=True)
    country: Mapped[str | None] = mapped_column(String, nullable=True)

    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    website: Mapped[str | None] = mapped_column(String, nullable=True)

    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Provenance / metadata
    sources: Mapped[str | None] = mapped_column(String, nullable=True)      # JSON text in your notebook
    source_ids: Mapped[str | None] = mapped_column(String, nullable=True)   # JSON text in your notebook
    cluster_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
