console.log("Content script loaded");

chrome.runtime.onMessage.addListener((message) => {
    let result = { ok: true };

    switch (message.type) {
        case "PLAY_PAUSE":
            result = togglePlay();
            break;

        case "NEXT":
            result = next();
            break;

        case "PREV":
            result = prev();
            break;

        case "SET_VOLUME":
            result = setVolume(message.value);
            break;

        case "SET_PROGRESS":
            result = setProgress(message.value);
            break;

        case "GET_PROGRESS":
            result = { ok: true, data: getProgress() };
            break;

        case "GET_TRACK_INFO":
            result = { ok: true, data: getTrackInfo() };
            break;
    }

    // 🔥 ВАЖНО: отправляем В BACKGROUND
    chrome.runtime.sendMessage({
        ...result,
        request_id: message.request_id
    });
});

// ---------- ACTIONS ----------

function togglePlay() {
    const btn = document.querySelector(
        '[aria-label="Пауза"], [aria-label="Воспроизведение"]'
    );

    if (!btn) return { ok: false, error: "play button not found" };

    btn.click();
    return { ok: true };
}

function next() {
    const btn = document.querySelector('[aria-label="Следующая песня"]');
    if (!btn) return { ok: false, error: "next button not found" };

    btn.click();
    return { ok: true };
}

function prev() {
    const btn = document.querySelector('[aria-label="Предыдущая песня"]');
    if (!btn) return { ok: false, error: "prev button not found" };

    btn.click();
    return { ok: true };
}

function setVolume(value) {
    const input = document.querySelector(
        'input[aria-label="Управление громкостью"]'
    );

    if (!input) return { ok: false, error: "volume input not found" };

    const v = Math.max(0, Math.min(1, value));

    input.value = v;
    input.dispatchEvent(new Event("input", { bubbles: true }));

    return { ok: true, value: v };
}

function setProgress(value) {
    const input = document.querySelector(
        'input[aria-label="Управление таймкодом"]'
    );

    if (!input) return { ok: false, error: "progress input not found" };

    const max = parseFloat(input.max) || 100;
    const newValue = value * max;

    input.value = newValue;
    input.dispatchEvent(new Event("input", { bubbles: true }));

    return { ok: true, value: newValue };
}

// ---------- DATA ----------

function getProgress() {
    const input = document.querySelector(
        'input[aria-label="Управление таймкодом"]'
    );

    if (!input) return null;

    return {
        current: parseFloat(input.value),
        max: parseFloat(input.max)
    };
}

function getPlayerRoot() {
    return document.querySelector(
        'section[class*="PlayerBarDesktopWithBackgroundProgressBar_root"]'
    );
}

function getTrackInfo() {
    const root = getPlayerRoot();
    if (!root) return null;

    const title =
        root.querySelector('.Meta_title__GGBnH, a[href*="/track/"] span')
            ?.textContent?.trim() || null;

    const artist =
        root.querySelector('.Meta_artists__VnR52 a span, a[href*="/artist/"] span')
            ?.textContent?.trim() || null;

    const cover = root.querySelector('img')?.src || null;

    const trackLink = root.querySelector('a[href*="/track/"]');

    let trackId = null;
    if (trackLink) {
        const match = trackLink.href.match(/track\/(\d+)/);
        if (match) trackId = match[1];
    }

    return { title, artist, cover, trackId };
}