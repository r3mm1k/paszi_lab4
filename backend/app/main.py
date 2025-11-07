from fastapi import FastAPI
from app.core.logging import setup_logging  # noqa: F401
from app.core.config import settings
from app.users.routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MVP Auth API", version="0.1.0")
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "env": settings.APP_ENV}
