from fastapi import FastAPI, WebSocket
from backend.api.routes import router, init_app
from backend.core.state import clients

app = FastAPI()

app.include_router(router)
init_app(app)


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)

    try:
        while True:
            await websocket.receive_text()
    except:
        pass
    finally:
        if websocket in clients:
            clients.remove(websocket)
