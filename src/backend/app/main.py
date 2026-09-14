from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings


app = FastAPI(
    title=settings.app_name,
    description="API foundation for port congestion prediction and operations planning.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/health", tags=["system"])
async def health_check() -> dict[str, str]:
    """Report whether the API process is ready to receive requests."""
    return {"status": "healthy", "service": settings.app_name, "version": "0.1.0"}
