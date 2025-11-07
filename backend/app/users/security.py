import re
from fastapi import HTTPException
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    deprecated="auto",
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)

def validate_password_strength(password: str) -> None:
    errors = []
    if len(password) < 8:
        errors.append("length>=8")
    if not re.search(r"[A-Z]", password):
        errors.append("uppercase")
    if not re.search(r"[a-z]", password):
        errors.append("lowercase")
    if not re.search(r"\d", password):
        errors.append("digit")
    if not re.search(r"[^A-Za-z0-9]", password):
        errors.append("special")

    if errors:
        raise HTTPException(
            status_code=422,
            detail={"code": "weak_password", "missing": errors,
                    "message": "Password must include: uppercase, lowercase, digit and special character, length>=8."}
        )
