function send(type, extra = {}) {
    chrome.tabs.query({ url: "https://music.yandex.ru/*" }, (tabs) => {
        if (!tabs.length) return;

        chrome.tabs.sendMessage(tabs[0].id, {
            type,
            ...extra
        });
    });
}

// кнопки
document.getElementById("play").onclick = () => send("PLAY_PAUSE");
document.getElementById("next").onclick = () => send("NEXT");
document.getElementById("prev").onclick = () => send("PREV");

// громкость
document.getElementById("volume").addEventListener("input", (e) => {
    send("SET_VOLUME", {
        value: parseFloat(e.target.value)
    });
});

// перемотка
let isUserDragging = false;
const slider = document.getElementById("progress");

slider.addEventListener("mousedown", () => {
    isUserDragging = true;
});

slider.addEventListener("mouseup", () => {
    isUserDragging = false;
});

slider.addEventListener("input", (e) => {
    send("SET_PROGRESS", {
        value: parseFloat(e.target.value)
    });
});

// получение прогресса
async function getProgressFromTab() {
    const tabs = await chrome.tabs.query({
        url: "https://music.yandex.ru/*"
    });

    if (!tabs.length) return null;

    return new Promise((resolve) => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { type: "GET_PROGRESS" },
            (response) => {
                resolve(response);
            }
        );
    });
}

// синхронизация
function startProgressSync() {
    setInterval(async () => {
        const data = await getProgressFromTab();

        if (!data) return;

        const percent = data.current / data.max;

        if (!isUserDragging) {
            slider.value = percent;
        }
    }, 500);
}

// старт
document.addEventListener("DOMContentLoaded", () => {
    startProgressSync();
    startTrackInfoSync();
});

async function getTrackInfoFromTab() {
    const tabs = await chrome.tabs.query({
        url: "https://music.yandex.ru/*"
    });

    if (!tabs.length) return null;

    return new Promise((resolve) => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { type: "GET_TRACK_INFO" },
            (response) => {
                resolve(response);
            }
        );
    });
}

function startTrackInfoSync() {
    setInterval(async () => {
        const data = await getTrackInfoFromTab();

        if (!data) return;

        document.getElementById("title").innerText = data.title || "";
        document.getElementById("artist").innerText = data.artist || "";
        document.getElementById("cover").src = data.cover || "";
    }, 1000);
}