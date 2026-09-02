from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(128))
    role: Mapped[str] = mapped_column(String(20), default="user")


class Brand(Base):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    models: Mapped[list["VehicleModel"]] = relationship(back_populates="brand", cascade="all, delete-orphan")
    parts: Mapped[list["Part"]] = relationship(back_populates="brand")


class VehicleModel(Base):
    __tablename__ = "vehicle_models"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), index=True)
    brand_id: Mapped[int] = mapped_column(ForeignKey("brands.id", ondelete="CASCADE"))
    brand: Mapped[Brand] = relationship(back_populates="models")


class Warehouse(Base):
    __tablename__ = "warehouses"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    address: Mapped[str | None] = mapped_column(String(255))
    shelves: Mapped[list["Shelf"]] = relationship(back_populates="warehouse", cascade="all, delete-orphan")


class Shelf(Base):
    __tablename__ = "shelves"

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[int] = mapped_column()
    description: Mapped[str | None] = mapped_column(String(255))
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id", ondelete="CASCADE"))
    warehouse: Mapped[Warehouse] = relationship(back_populates="shelves")
    parts: Mapped[list["Part"]] = relationship(back_populates="shelf")


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), unique=True)
    phone: Mapped[str | None] = mapped_column(String(30))
    email: Mapped[str | None] = mapped_column(String(150))


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
    brand_id: Mapped[int] = mapped_column(ForeignKey("brands.id"))
    shelf_id: Mapped[int | None] = mapped_column(ForeignKey("shelves.id"))
    supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id"))
    brand: Mapped[Brand] = relationship(back_populates="parts")
    shelf: Mapped[Shelf | None] = relationship(back_populates="parts")
    photos: Mapped[list["PartPhoto"]] = relationship(back_populates="part", cascade="all, delete-orphan")


class PartPhoto(Base):
    __tablename__ = "part_photos"

    id: Mapped[int] = mapped_column(primary_key=True)
    url: Mapped[str] = mapped_column(String(500))
    part_id: Mapped[int] = mapped_column(ForeignKey("parts.id", ondelete="CASCADE"))
    part: Mapped[Part] = relationship(back_populates="photos")
