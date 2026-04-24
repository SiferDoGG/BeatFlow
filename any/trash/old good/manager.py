class WSManager:
    def __init__(self, clients):
        self.clients = clients

    async def broadcast(self, data: dict):
        alive_clients = []

        for c in self.clients:
            try:
                await c.send_json(data)
                alive_clients.append(c)
            except Exception:
                # клиент мёртв → игнорируем
                pass

        # обновляем список только живыми
        self.clients[:] = alive_clients
