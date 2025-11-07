from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.users import schemas, models
from app.users.security import hash_password, validate_password_strength

router = APIRouter(prefix="/api", tags=["auth"])

@router.post("/register", response_model=schemas.MessageOut, status_code=201)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    # Проверяем пароль
    problems = validate_password_strength(payload.password)
    if problems:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "weak_password", "problems": problems},
        )

    # Проверяем уникальность логина
    if db.query(models.User).filter(models.User.login == payload.login).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "login_taken", "message": "Логин уже зарегистрирован"},
        )

    user = models.User(
        login=payload.login,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "user создан"}
