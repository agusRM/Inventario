import hashlib
import hmac
import os
import secrets
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from PIL import Image, UnidentifiedImageError
from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from jwt import ExpiredSignatureError, InvalidTokenError, decode, encode
from sqlalchemy import select
from sqlalchemy.orm import Session

import models
import schemas
from database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

security = HTTPBearer(auto_error=False)
SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-change-this-secret")
SESSION_EXPIRE_MINUTES = int(os.getenv("SESSION_EXPIRE_MINUTES", "480"))

app = FastAPI(title="SuRepuesto | Palmares API", version="1.0.0")
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", Path(__file__).parent / "uploads"))
MAX_PHOTO_SIZE = 5 * 1024 * 1024
MAX_PHOTOS_PER_PART = 8
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
cors_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def create_access_token(user: models.User) -> str:
    from datetime import datetime, timedelta, timezone

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=SESSION_EXPIRE_MINUTES)
    return encode(
        {"sub": str(user.id), "role": user.role, "exp": expires_at},
        SECRET_KEY,
        algorithm="HS256",
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
):
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Debes iniciar sesión")
    try:
        payload = decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        user_id = int(payload.get("sub", ""))
    except (ExpiredSignatureError, InvalidTokenError, ValueError):
        raise HTTPException(status_code=401, detail="La sesión no es válida o expiró")
    user = db.get(models.User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="El usuario de la sesión no existe")
    return user


def require_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol administrador")
    return current_user


def crud_router(model, create_schema, read_schema, path: str):
    from fastapi import APIRouter

    router = APIRouter(prefix=path, tags=[path.strip("/")])

    @router.get("", response_model=list[read_schema])
    def list_items(db: Session = Depends(get_db)):
        return db.scalars(select(model)).all()

    @router.post("", response_model=read_schema, status_code=201)
    def create_item(payload: create_schema, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
        item = model(**payload.model_dump())
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    @router.get("/{item_id}", response_model=read_schema)
    def get_item(item_id: int, db: Session = Depends(get_db)):
        item = db.get(model, item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        return item

    @router.put("/{item_id}", response_model=read_schema)
    def update_item(item_id: int, payload: create_schema, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
        item = db.get(model, item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        for field, value in payload.model_dump().items():
            setattr(item, field, value)
        db.commit()
        db.refresh(item)
        return item

    @router.delete("/{item_id}", status_code=204)
    def delete_item(item_id: int, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
        item = db.get(model, item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        db.delete(item)
        db.commit()

    return router


def hash_password(password: str, salt: str | None = None) -> str:
    password_salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), password_salt.encode(), 120_000)
    return f"{password_salt}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, expected_digest = stored_hash.split("$", 1)
    except ValueError:
        return False
    actual_digest = hash_password(password, salt).split("$", 1)[1]
    return hmac.compare_digest(actual_digest, expected_digest)


@app.post("/auth/register", response_model=schemas.AuthResponse, status_code=201, tags=["auth"])
def register_user(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    existing_user = db.scalar(
        select(models.User).where(
            (models.User.username == payload.username) | (models.User.email == payload.email)
        )
    )
    if existing_user:
        raise HTTPException(status_code=409, detail="El usuario o correo ya existe")
    user = models.User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": create_access_token(user), "user": user}


@app.post("/auth/login", response_model=schemas.AuthResponse, tags=["auth"])
def login_user(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.scalar(select(models.User).where(models.User.username == payload.username))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    return {"access_token": create_access_token(user), "user": user}


@app.get("/users", response_model=list[schemas.UserRead], tags=["users"])
def list_users(db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    return db.scalars(select(models.User).order_by(models.User.username)).all()


@app.put("/users/{user_id}", response_model=schemas.UserRead, tags=["users"])
def update_user(user_id: int, payload: schemas.UserUpdate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    user = db.get(models.User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.email = payload.email
    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user


@app.delete("/users/{user_id}", status_code=204, tags=["users"])
def delete_user(user_id: int, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    user = db.get(models.User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(user)
    db.commit()


@app.get("/parts", response_model=list[schemas.PartRead], tags=["parts"])
def list_parts(search: str | None = Query(default=None), db: Session = Depends(get_db)):
    statement = select(models.Part).order_by(models.Part.name)
    if search:
        pattern = f"%{search}%"
        statement = statement.where(
            models.Part.name.ilike(pattern)
            | models.Part.part_number.ilike(pattern)
            | models.Part.compatible_models.ilike(pattern)
            | models.Part.years.ilike(pattern)
        )
    parts = db.scalars(statement).all()
    return [schemas.PartRead.from_part(part) for part in parts]


def save_uploaded_photos(files: list[UploadFile]) -> list[str]:
    allowed_types = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp", "GIF": ".gif"}
    if len(files) > MAX_PHOTOS_PER_PART:
        raise HTTPException(status_code=413, detail=f"Se permiten máximo {MAX_PHOTOS_PER_PART} fotos")
    saved_paths = []
    for uploaded_file in files:
        contents = uploaded_file.file.read(MAX_PHOTO_SIZE + 1)
        if len(contents) > MAX_PHOTO_SIZE:
            raise HTTPException(status_code=413, detail="Cada imagen puede pesar máximo 5 MB")
        try:
            with Image.open(BytesIO(contents)) as image:
                image.verify()
                image_format = image.format
        except (UnidentifiedImageError, OSError) as error:
            raise HTTPException(status_code=415, detail="El archivo no es una imagen válida") from error
        if image_format not in allowed_types:
            raise HTTPException(status_code=415, detail="Solo se permiten imágenes JPG, PNG, WEBP o GIF")
        extension = allowed_types[image_format]
        filename = f"{uuid4().hex}{extension}"
        destination = UPLOAD_DIR / filename
        with destination.open("wb") as saved_file:
            saved_file.write(contents)
        saved_paths.append(f"/uploads/{filename}")
    return saved_paths


def part_from_form(
    name: str = Form(...),
    part_number: str = Form(...),
    brand_name: str = Form(...),
    compatible_models: str | None = Form(None),
    years: str | None = Form(None),
    entry_date: str = Form(...),
    stock: int = Form(0),
    minimum_stock: int = Form(0),
    price: float = Form(0),
    shelf: str | None = Form(None),
    supplier: str | None = Form(None),
):
    try:
        return schemas.PartCreate(
            name=name,
            part_number=part_number,
            brand_name=brand_name,
            compatible_models=compatible_models,
            years=years,
            entry_date=entry_date,
            stock=stock,
            minimum_stock=minimum_stock,
            price=price,
            shelf=shelf,
            supplier=supplier,
        )
    except Exception as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.post("/parts", response_model=schemas.PartRead, status_code=201, tags=["parts"])
def create_part(
    payload: schemas.PartCreate = Depends(part_from_form),
    photos: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    values = payload.model_dump(exclude={"photos"})
    part = models.Part(**values)
    part.photos = save_uploaded_photos(photos)
    db.add(part)
    db.commit()
    db.refresh(part)
    return schemas.PartRead.from_part(part)


@app.get("/parts/{part_id}", response_model=schemas.PartRead, tags=["parts"])
def get_part(part_id: int, db: Session = Depends(get_db)):
    part = db.get(models.Part, part_id)
    if part is None:
        raise HTTPException(status_code=404, detail="Repuesto no encontrado")
    return schemas.PartRead.from_part(part)


@app.put("/parts/{part_id}", response_model=schemas.PartRead, tags=["parts"])
def update_part(
    part_id: int,
    payload: schemas.PartCreate = Depends(part_from_form),
    photos: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    part = db.get(models.Part, part_id)
    if part is None:
        raise HTTPException(status_code=404, detail="Repuesto no encontrado")
    for field, value in payload.model_dump(exclude={"photos"}).items():
        setattr(part, field, value)
    if photos:
        part.photos = save_uploaded_photos(photos)
    db.commit()
    db.refresh(part)
    return schemas.PartRead.from_part(part)


@app.delete("/parts/{part_id}", status_code=204, tags=["parts"])
def delete_part(part_id: int, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    part = db.get(models.Part, part_id)
    if part is None:
        raise HTTPException(status_code=404, detail="Repuesto no encontrado")
    db.delete(part)
    db.commit()


@app.get("/health", tags=["system"])
def health_check():
    return {"status": "ok", "service": "surepuesto-api"}
