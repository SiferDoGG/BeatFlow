from backend.core.adapter_base import MainMusicAdapter


class YandexAdapter(MainMusicAdapter):

    async def play(self):
        try:
            await self.ws.broadcast({"type": "PLAY"})
            return {"status": "ok"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def pause(self):
        await self.ws.broadcast({"type": "PAUSE"})
        return {"status": "ok"}

    async def next(self):
        await self.ws.broadcast({"type": "NEXT"})
        return {"status": "ok"}

    async def set_volume(self, value: float):
        await self.ws.broadcast({"type": "SET_VOLUME", "value": value})
        return {"status": "ok"}
