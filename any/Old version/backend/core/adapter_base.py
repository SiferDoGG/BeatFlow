class MainMusicAdapter:
    def __init__(self, ws):
        self.ws = ws

    async def play(self):
        raise NotImplementedError

    async def pause(self):
        raise NotImplementedError

    async def next(self):
        raise NotImplementedError

    async def set_volume(self, value: float):
        raise NotImplementedError

    async def get_progress(self):
        raise NotImplementedError

    async def get_track_info(self):
        raise NotImplementedError

    async def set_progress(self, value: float):
        raise NotImplementedError
