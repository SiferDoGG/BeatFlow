import asyncio
import json

from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect

from backend.api.routes import router, init_app
from backend.core.state import clients
from backend.ws.manager import WSManager

app = FastAPI()

app.include_router(router)
init_app(app)

ws_manager = None


# ---------------- STARTUP ----------------


@app.on_event("startup")
async def startup():
    global ws_manager
    ws_manager = WSManager(clients)

    # heartbeat (держит соединение живым)
    asyncio.create_task(heartbeat())


# ---------------- HEARTBEAT ----------------


async def heartbeat():
    while True:
        await asyncio.sleep(20)

        dead = []

        for c in clients:
            try:
                await c.send_json({"type": "ping"})
            except Exception:
                dead.append(c)

        for d in dead:
            if d in clients:
                clients.remove(d)


# ---------------- WS ----------------


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)

    print("WS CONNECTED")

    try:
        while True:
            try:
                raw = await websocket.receive_text()
            except WebSocketDisconnect:
                print("WS DISCONNECTED")
                break

            if not raw:
                continue

            # ❗ ignore ping STRING
            if raw == "ping":
                continue

            try:
                msg = json.loads(raw)
            except Exception:
                print("INVALID MSG:", raw)
                continue

            # 🔥 IGNORE PING OBJECT
            if msg.get("type") == "ping":
                continue

            print("RECEIVED:", msg)

            # 🔥 ONLY RPC REQUESTS
            if msg.get("request_id"):
                await ws_manager.resolve(msg["request_id"], msg)

    finally:
        if websocket in clients:
            clients.remove(websocket)
