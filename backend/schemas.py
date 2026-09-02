from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class BrandCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("El nombre no puede estar vacío")
        return value


class BrandRead(BrandCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class VehicleModelCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    brand_id: int


class VehicleModelRead(VehicleModelCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class WarehouseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    address: str | None = None


class WarehouseRead(WarehouseCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ShelfCreate(BaseModel):
    number: int = Field(ge=1)
    description: str | None = None
    warehouse_id: int


class ShelfRead(ShelfCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class SupplierCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    phone: str | None = None
    email: EmailStr | None = None


class SupplierRead(SupplierCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=80, pattern=r"^[a-zA-Z0-9_.-]+$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    username: str
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: str
    role: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class UserUpdate(BaseModel):
    email: EmailStr
    role: str = Field(pattern="^(admin|user)$")


class PartCreate(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    part_number: str = Field(min_length=1, max_length=80, pattern=r"^[^\s]+$")
    brand_id: int
    compatible_models: str | None = None
    years: str | None = None
    entry_date: date = Field(default_factory=date.today)
    stock: int = Field(default=0, ge=0)
    minimum_stock: int = Field(default=0, ge=0)
    price: Decimal = Field(default=0, ge=0)
    shelf_id: int | None = None
    supplier_id: int | None = None
    photos: list[str] = Field(default_factory=list)

    @field_validator("name", "part_number")
    @classmethod
    def required_text_must_not_be_blank(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("Este campo no puede estar vacío")
        return value


class PartRead(PartCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    brand_name: str | None = None

    @classmethod
    def from_part(cls, part):
        data = {column.name: getattr(part, column.name) for column in part.__table__.columns}
        data["photos"] = [photo.url for photo in part.photos]
        data["brand_name"] = part.brand.name if part.brand else None
        return cls.model_validate(data)
