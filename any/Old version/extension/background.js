console.log("BACKGROUND STARTED");

let ws = null;

const WS_URL = "ws://127.0.0.1:8000/ws";
const MUSIC_URL = "https://music.yandex.ru/";

// ---------------- CONNECT ----------------

function connect() {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log("WS connected");

        // 🔥 KEEPALIVE (FIXED JSON PING)
        setInterval(() => {
            if (ws && ws.readyState === 1) {
                ws.send(JSON.stringify({ type: "ping" }));
            }
        }, 25000);
    };

    ws.onmessage = async (event) => {
        let data;

        try {
            data = JSON.parse(event.data);
        } catch {
            return;
        }

        const tab = await getOrCreateTab();

        chrome.tabs.sendMessage(tab.id, data);
    };

    ws.onclose = () => {
        console.log("WS reconnect...");
        setTimeout(connect, 3000);
    };

    ws.onerror = () => {
        ws.close();
    };
}

// ---------------- RESPONSE BRIDGE ----------------

chrome.runtime.onMessage.addListener((msg) => {
    if (!ws || ws.readyState !== 1) return;

    if (msg && msg.request_id) {
        ws.send(JSON.stringify(msg));
    }
});

// ---------------- TAB ----------------

async function getOrCreateTab() {
    let tabs = await chrome.tabs.query({
        url: "https://music.yandex.ru/*"
    });

    if (tabs.length > 0) {
        return tabs[0];
    }

    const tab = await chrome.tabs.create({
        url: MUSIC_URL,
        active: false
    });

    await waitForLoad(tab.id);

    return tab;
}

function waitForLoad(tabId) {
    return new Promise((resolve) => {
        const listener = (id, info) => {
            if (id === tabId && info.status === "complete") {
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
            }
        };

        chrome.tabs.onUpdated.addListener(listener);
    });
}

// start
connect();