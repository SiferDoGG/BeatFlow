const ws = new WebSocket("ws://127.0.0.1:8000/ws");

ws.onopen = () => {
    console.log("WS connected to backend");
    ws.send("hello");
};

ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    console.log("FROM BACKEND:", data);

    const tabs = await chrome.tabs.query({
        url: "https://music.yandex.ru/*"
    });

    if (!tabs.length) {
        console.log("No Yandex Music tab");
        return;
    }

    const tabId = tabs[0].id;

    switch (data.type) {
        case "PLAY":
            chrome.tabs.sendMessage(tabId, { type: "PLAY_PAUSE" });
            break;

        case "PAUSE":
            chrome.tabs.sendMessage(tabId, { type: "PLAY_PAUSE" });
            break;

        case "NEXT":
            chrome.tabs.sendMessage(tabId, { type: "NEXT" });
            break;

        case "SET_VOLUME":
            chrome.tabs.sendMessage(tabId, {
                type: "SET_VOLUME",
                value: data.value
            });
            break;
    }
};