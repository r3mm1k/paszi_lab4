from pydantic import BaseModel, constr, ConfigDict, Field
from datetime import datetime

class RegisterRequest(BaseModel):
    login: constr(min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9._-]+$")
    password: constr(min_length=8)

class UserOut(BaseModel):
    id: int
    login: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RegisterResponse(BaseModel):
    detail: str

class MessageOut(BaseModel):
    message: str