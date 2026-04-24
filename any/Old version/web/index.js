const API = "http://127.0.0.1:8000";

// ---------------- CONTROLS ----------------

async function play() {
    await fetch(API + "/play", { method: "POST" });
    update();
}

async function next() {
    await fetch(API + "/next", { method: "POST" });
    update();
}

async function prev() {
    await fetch(API + "/prev", { method: "POST" });
    update();
}

async function setVolume(value) {
    await fetch(API + "/volume/" + value, { method: "POST" });
}

async function setProgress(value) {
    await fetch(API + "/progress/" + value, { method: "POST" });
}

// ---------------- UI UPDATE ----------------

async function update() {
    const res = await fetch(API + "/track");
    const data = await res.json();

    if (!data) return;

    document.getElementById("title").innerText = data.data?.title || "—";
    document.getElementById("artist").innerText = data.data?.artist || "—";
    document.getElementById("cover").src = data.data?.cover || "";
}

// автообновление
setInterval(update, 5000);
update();