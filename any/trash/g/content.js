const ws = new WebSocket("ws://127.0.0.1:8000/ws");

ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    switch (msg.type) {
        case "PLAY":
            togglePlay();
            break;

        case "NEXT":
            next();
            break;

        case "PREV":
            prev();
            break;

        case "SET_VOLUME":
            setVolume(msg.value);
            break;

        case "SET_PROGRESS":
            setProgress(msg.value);
            break;
    }
};