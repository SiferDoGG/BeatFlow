const API = "http://127.0.0.1:8000";

async function play() {
    await fetch(`${API}/play`, { method: "POST" });
}

async function pause() {
    await fetch(`${API}/pause`, { method: "POST" });
}

async function next() {
    await fetch(`${API}/next`, { method: "POST" });
}

document.getElementById("vol").addEventListener("input", async (e) => {
    await fetch(`${API}/volume/${e.target.value}`, {
        method: "POST"
    });
});