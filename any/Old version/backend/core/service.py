class MusicService:
    def __init__(self, adapter):
        self.adapter = adapter

    # ---------- COMMANDS ----------

    async def play(self):
        return await self.adapter.play()

    async def pause(self):
        return await self.adapter.pause()

    async def next(self):
        return await self.adapter.next()

    async def set_volume(self, value: float):
        return await self.adapter.set_volume(value)

    async def set_progress(self, value: float):
        return await self.adapter.set_progress(value)

    async def get_progress(self):
        return await self.adapter.get_progress()

    async def get_track_info(self):
        return await self.adapter.get_track_info()
