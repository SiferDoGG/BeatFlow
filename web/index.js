let currentService = "yandex";

const API = "http://127.0.0.1:8000/player";

// ---------------- ELEMENTS ----------------

const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");

const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

const volume = document.getElementById("volume");
const seek = document.getElementById("seek");

// ---------------- STATE ----------------

let isSeeking = false;
let seekValue = 0;
let lastCover = null;

// ---------------- SEND ----------------

async function send(action, value = null) {
    const body = { service: currentService, action };

    if (value !== null && Number.isFinite(value)) {
        body.value = value;
    }

    const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    return await res.json();
}

// ---------------- CONTROLS ----------------

playBtn.onclick = () => send("PLAY_PAUSE");
nextBtn.onclick = () => send("NEXT");
prevBtn.onclick = () => send("PREV");

volume.oninput = (e) => {
    const v = Number(e.target.value);
    if (!Number.isFinite(v)) return;
    send("SET_VOLUME", v);
};

// ---------------- TRACK INFO ----------------

async function updateTrack() {
    const res = await send("GET_TRACK_INFO");

    if (!res?.data) return;

    const d = res.data;

    title.textContent = d.title || "Unknown";
    artist.textContent = d.artist || "---";

    if (d.cover && d.cover !== lastCover) {
        lastCover = d.cover;

        const url = d.cover + "?t=" + Date.now();

        const img = new Image();
        img.src = url;

        img.onload = () => {
            cover.src = url;
        };
    }
}

setInterval(updateTrack, 3000);
updateTrack();

// ---------------- SEEK ----------------

seek.addEventListener("pointerdown", (e) => {
    isSeeking = true;
    seek.setPointerCapture(e.pointerId);
});

seek.addEventListener("input", (e) => {
    const v = Number(e.target.value);
    if (!Number.isFinite(v)) return;
    seekValue = v;
});

seek.addEventListener("pointerup", async (e) => {
    if (!isSeeking) return;

    isSeeking = false;
    seek.releasePointerCapture(e.pointerId);

    await send("SET_PROGRESS", seekValue / 100);
});

seek.addEventListener("pointercancel", () => {
    isSeeking = false;
});

// ---------------- SYNC ----------------

async function updateProgress() {
    const res = await send("GET_PROGRESS");

    if (!res?.data || isSeeking) return;

    const { current, max } = res.data;
    if (!max) return;

    seek.value = (current / max) * 100;
}

setInterval(updateProgress, 500);

// ---------------- VOLUME SYNC ----------------

async function updateVolume() {
    const res = await send("GET_VOLUME");

    if (!res?.data) return;

    if (Number.isFinite(res.data.value)) {
        volume.value = res.data.value;
    }
}

setInterval(updateVolume, 3000);