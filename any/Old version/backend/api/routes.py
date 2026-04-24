from fastapi import APIRouter
from backend.core.service import MusicService
from backend.adapters.yandex_adapter import YandexAdapter
from backend.ws.manager import WSManager
from backend.core.state import clients

router = APIRouter()

ws = None
service = None


def init_app(app):
    global ws, service
    ws = WSManager(clients)
    adapter = YandexAdapter(ws)
    service = MusicService(adapter)


# ---------- CONTROL ----------


@router.post("/play")
async def play():
    return await service.play()


@router.post("/pause")
async def pause():
    return await service.pause()


@router.post("/next")
async def next_track():
    return await service.next()


@router.post("/volume/{value}")
async def volume(value: float):
    return await service.set_volume(value)


@router.post("/progress/{value}")
async def progress(value: float):
    return await service.set_progress(value)


# ---------- DATA ----------


@router.get("/progress")
async def get_progress():
    return await service.get_progress()


@router.get("/track")
async def get_track():
    return await service.get_track_info()
