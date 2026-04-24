import asyncio
import uuid


class WSManager:
    def __init__(self, clients):
        self.clients = clients

        # 🔥 хранит ожидания ответов
        self.pending = {}  # request_id -> Future

    # -----------------------------
    # BROADCAST (оставляем как есть)
    # -----------------------------
    async def broadcast(self, data: dict):
        alive_clients = []

        for c in self.clients:
            try:
                await c.send_json(data)
                alive_clients.append(c)
            except Exception:
                pass

        self.clients[:] = alive_clients

    # -----------------------------
    # REQUEST (НОВОЕ — ГЛАВНОЕ)
    # -----------------------------
    async def request(self, data: dict, timeout: float = 5.0):
        """
        отправляет команду и ждёт ответ от content.js
        """

        request_id = str(uuid.uuid4())
        data["request_id"] = request_id

        loop = asyncio.get_event_loop()
        future = loop.create_future()

        self.pending[request_id] = future

        # отправляем всем (или можно первому клиенту)
        await self.broadcast(data)

        try:
            return await asyncio.wait_for(future, timeout=timeout)
        except asyncio.TimeoutError:
            self.pending.pop(request_id, None)
            return {"ok": False, "error": "timeout"}

    # -----------------------------
    # CALLED WHEN WS RESPONSE ARRIVES
    # -----------------------------
    async def resolve(self, request_id: str, data: dict):
        """
        сюда должен вызывать твой WS receive handler
        """

        future = self.pending.pop(request_id, None)

        if future and not future.done():
            future.set_result(data)
