from datetime import date
from decimal import Decimal

from sqlalchemy import Date, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(128))
    role: Mapped[str] = mapped_column(String(20), default="user")


class Part(Base):
    __tablename__ = "parts"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(180), index=True)
    part_number: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    years: Mapped[str | None] = mapped_column(String(30))
    compatible_models: Mapped[str | None] = mapped_column(Text)
    entry_date: Mapped[date] = mapped_column(Date, default=date.today)
    stock: Mapped[int] = mapped_column(default=0)
    minimum_stock: Mapped[int] = mapped_column(default=0)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    brand_name: Mapped[str] = mapped_column(String(100))
    shelf: Mapped[str | None] = mapped_column(String(100))
    supplier: Mapped[str | None] = mapped_column(String(150))
    photos: Mapped[list[str]] = mapped_column(JSON, default=list)
