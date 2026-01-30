from __future__ import annotations

from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select, func, asc, desc

from .db import get_db
from .models import FuneralHome
from .schemas import FuneralHomeOut

app = FastAPI(title="Funeral Homes API", version="0.1.0")



ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.13:3000", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


def apply_filters(stmt, name=None, city=None, region=None, postal_code=None, country=None, phone=None):
    if name:
        pattern = f"%{name.strip().lower()}%"
        stmt = stmt.where(func.lower(FuneralHome.name).like(pattern))

    if city:
        pattern = f"%{city.strip().lower()}%"
        stmt = stmt.where(func.lower(FuneralHome.city).like(pattern))
    if region:
        stmt = stmt.where(func.lower(FuneralHome.region) == func.lower(region))
    if postal_code:
        pattern = f"%{postal_code.strip().lower()}%"
        stmt = stmt.where(func.lower(FuneralHome.postal_code).like(pattern))
    if country:
        stmt = stmt.where(FuneralHome.country == country)
    if phone:
        stmt = stmt.where(FuneralHome.phone == phone)

    return stmt


@app.get("/funeral-homes", response_model=list[FuneralHomeOut])
def list_funeral_homes(
    db: Session = Depends(get_db),

    # Filters
    name: str | None = Query(default=None, description="Partial match (case-insensitive)"),
    city: str | None = None,
    region: str | None = None,
    postal_code: str | None = None,
    country: str | None = None,
    phone: str | None = None,

    # Pagination
    limit: int = Query(default=15, ge=1, le=500),
    offset: int = Query(default=0, ge=0),

    # Sorting
    sort_by: str = Query(default="internal_id", description="One of: internal_id, name, city, region, postal_code, cluster_size"),
    sort_dir: str = Query(default="asc", description="asc or desc"),
):
    # Base query
    stmt = select(FuneralHome)

    stmt = apply_filters(
        stmt,
        name=name,
        city=city,
        region=region,
        postal_code=postal_code,
        country=country,
        phone=phone,
    )

    # Sorting
    sortable = {
        "internal_id": FuneralHome.internal_id,
        "name": FuneralHome.name,
        "city": FuneralHome.city,
        "region": FuneralHome.region,
        "postal_code": FuneralHome.postal_code,
        "cluster_size": FuneralHome.cluster_size,
    }
    col = sortable.get(sort_by)
    if not col:
        raise HTTPException(status_code=400, detail=f"Invalid sort_by. Choose one of: {', '.join(sortable.keys())}")

    order_fn = asc if sort_dir.lower() == "asc" else desc if sort_dir.lower() == "desc" else None
    if order_fn is None:
        raise HTTPException(status_code=400, detail="sort_dir must be 'asc' or 'desc'")

    stmt = stmt.order_by(order_fn(col))

    # Pagination
    stmt = stmt.limit(limit).offset(offset)

    rows = db.execute(stmt).scalars().all()
    return rows

# for pagination UI
@app.get("/funeral-homes/count")
def count_funeral_homes(
    db: Session = Depends(get_db),

    name: str | None = Query(default=None, description="Partial match (case-insensitive)"),
    city: str | None = None,
    region: str | None = None,
    postal_code: str | None = None,
    country: str | None = None,
    phone: str | None = None,
):
    stmt = select(func.count()).select_from(FuneralHome)
    stmt = apply_filters(
        stmt,
        name=name,
        city=city,
        region=region,
        postal_code=postal_code,
        country=country,
        phone=phone,
    )
    total = db.execute(stmt).scalar_one()
    return {"total": int(total)}
