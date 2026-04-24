from backend.core.adapter_base import MainMusicAdapter


class YandexAdapter(MainMusicAdapter):

    # ---------- HELPERS ----------

    async def _send(self, payload: dict):
        """
        отправка команды + ожидание ответа от content.js
        """
        return await self.ws.request(payload)

    # ---------- CONTROLS ----------

    async def play(self):
        return await self._send({"type": "PLAY"})

    async def pause(self):
        return await self._send({"type": "PAUSE"})

    async def next(self):
        return await self._send({"type": "NEXT"})

    async def set_volume(self, value: float):
        return await self._send({"type": "SET_VOLUME", "value": value})

    async def set_progress(self, value: float):
        return await self._send({"type": "SET_PROGRESS", "value": value})

    # ---------- DATA ----------

    async def get_progress(self):
        return await self._send({"type": "GET_PROGRESS"})

    async def get_track_info(self):
        return await self._send({"type": "GET_TRACK_INFO"})
