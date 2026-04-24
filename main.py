import json
import uuid
import asyncio
import math
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from pydantic import BaseModel
from enum import Enum
from typing import Optional
from pathlib import Path
import uvicorn

app = FastAPI()

# ---------------- PATH ----------------

BASE_DIR = Path(__file__).resolve().parent
WEB_DIR = BASE_DIR / "web"

# ---------------- STATE ----------------

clients = set()
pending_requests = {}

# ---------------- ENUMS ----------------


class Service(str, Enum):
    yandex = "yandex"
    spotify = "spotify"


class PlayerAction(str, Enum):
    PLAY_PAUSE = "PLAY_PAUSE"
    NEXT = "NEXT"
    PREV = "PREV"
    SET_VOLUME = "SET_VOLUME"
    SET_PROGRESS = "SET_PROGRESS"
    GET_PROGRESS = "GET_PROGRESS"
    GET_TRACK_INFO = "GET_TRACK_INFO"
    GET_VOLUME = "GET_VOLUME"


# 🔥 ОСЛАБЛЕННАЯ МОДЕЛЬ (убрали 422 из-за value)
class PlayerCommand(BaseModel):
    service: Service
    action: PlayerAction
    value: Optional[float] = None


# ---------------- WS ----------------


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    clients.add(ws)

    print("WS connected")

    try:
        while True:
            data = await ws.receive_text()
            msg = json.loads(data)

            if msg.get("type") == "ping":
                continue

            request_id = msg.get("request_id")

            if request_id and request_id in pending_requests:
                future = pending_requests.pop(request_id)
                if not future.done():
                    future.set_result(msg)

    except WebSocketDisconnect:
        clients.remove(ws)
        print("WS disconnected")


# ---------------- UI ----------------


@app.get("/ui")
def ui():
    return FileResponse(WEB_DIR / "index.html")


@app.get("/ui/{path:path}")
def ui_static(path: str):
    return FileResponse(WEB_DIR / path)


# ---------------- PLAYER ----------------


@app.post("/player")
async def player(cmd: PlayerCommand):

    if not clients:
        return {"ok": False, "error": "No extension connected"}

    # 🔥 SAFE VALUE CLEANUP
    value = cmd.value

    if value is not None:
        if not isinstance(value, (int, float)):
            value = None
        elif isinstance(value, float) and math.isnan(value):
            value = None
        else:
            value = float(value)

    request_id = str(uuid.uuid4())

    payload = {"type": cmd.action, "service": cmd.service, "request_id": request_id}

    if value is not None:
        payload["value"] = value

    ws = list(clients)[0]

    loop = asyncio.get_event_loop()
    future = loop.create_future()
    pending_requests[request_id] = future

    await ws.send_text(json.dumps(payload))

    try:
        return await asyncio.wait_for(future, timeout=5)
    except asyncio.TimeoutError:
        pending_requests.pop(request_id, None)
        return {"ok": False, "error": "Timeout"}


# ---------------- RUN ----------------

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
