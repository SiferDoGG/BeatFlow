console.log("BACKGROUND STARTED");

let ws = null;

const WS_URL = "ws://127.0.0.1:8000/ws";

// ---------------- SERVICES ----------------

const SERVICES = {
    yandex: {
        url: "https://music.yandex.ru/",
        match: "https://music.yandex.ru/*"
    },
    spotify: {
        url: "https://open.spotify.com/",
        match: "https://open.spotify.com/*"
    }
};

// ---------------- CONNECT ----------------

function connect() {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log("WS connected");

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

        if (!data.service) {
            console.log("No service provided");
            return;
        }

        const tab = await getServiceTab(data.service);

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

// ---------------- TAB MANAGER ----------------

async function getServiceTab(service) {
    const cfg = SERVICES[service];

    if (!cfg) {
        throw new Error("Unknown service: " + service);
    }

    let tabs = await chrome.tabs.query({
        url: cfg.match
    });

    if (tabs.length > 0) {
        return tabs[0];
    }

    const tab = await chrome.tabs.create({
        url: cfg.url,
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

// ---------------- START ----------------

connect();