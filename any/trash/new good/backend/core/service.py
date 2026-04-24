class MusicService:
    def __init__(self, adapter):
        self.adapter = adapter

    async def play(self):
        return await self.adapter.play()

    async def pause(self):
        return await self.adapter.pause()

    async def next(self):
        return await self.adapter.next()

    async def set_volume(self, value: float):
        return await self.adapter.set_volume(value)
