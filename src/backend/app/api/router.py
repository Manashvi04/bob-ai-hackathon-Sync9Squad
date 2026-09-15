from fastapi import APIRouter

api_router = APIRouter()


@api_router.get("/", tags=["system"])
async def api_root() -> dict[str, str]:
    return {"message": "PortOps API", "docs": "/docs"}
