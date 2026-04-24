const ws = new WebSocket("ws://localhost:8000/ws");

ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    chrome.tabs.query({ url: "https://music.yandex.ru/*" }, (tabs) => {
        if (!tabs.length) return;

        chrome.tabs.sendMessage(tabs[0].id, msg);
    });
};