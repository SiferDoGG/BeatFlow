console.log("Content script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case "PLAY_PAUSE":
            togglePlay();
            break;

        case "NEXT":
            next();
            break;

        case "PREV":
            prev();
            break;

        case "SET_VOLUME":
            setVolume(message.value);
            break;

        case "SET_PROGRESS":
            setProgress(message.value);
            break;

        case "GET_PROGRESS":
            sendResponse(getProgress());
            return true;

        case "GET_TRACK_INFO":
            sendResponse(getTrackInfo());
            return true;
    }
});

// ▶ / ⏸
function togglePlay() {
    document.querySelector(
        '[aria-label="Пауза"], [aria-label="Воспроизведение"]'
    )?.click();
}

// ⏭
function next() {
    document.querySelector('[aria-label="Следующая песня"]')?.click();
}

// ⏮
function prev() {
    document.querySelector('[aria-label="Предыдущая песня"]')?.click();
}

// 🔊 громкость
function setVolume(value) {
    const input = document.querySelector(
        'input[aria-label="Управление громкостью"]'
    );

    if (!input) return;

    const v = Math.max(0, Math.min(1, value));

    input.value = v;
    input.style.setProperty("--seek-before-width", `${v * 100}%`);
    input.style.backgroundSize = `${v * 100}% 100%`;

    input.dispatchEvent(new Event("input", { bubbles: true }));
}

// ⏱ перемотка
function setProgress(value) {
    const input = document.querySelector(
        'input[aria-label="Управление таймкодом"]'
    );

    if (!input) return;

    const max = parseFloat(input.max) || 100;
    const newValue = value * max;

    input.value = newValue;

    const percent = (newValue / max) * 100;

    input.style.setProperty("--seek-before-width", `${percent}%`);
    input.style.backgroundSize = `${percent}% 100%`;

    input.dispatchEvent(new Event("input", { bubbles: true }));
}

// 📊 получить прогресс
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

    // 🎵 название
    const title = root.querySelector(
        '.Meta_title__GGBnH, a[href*="/track/"] span'
    )?.textContent?.trim() || null;

    // 👤 артист
    const artist = root.querySelector(
        '.Meta_artists__VnR52 a span, a[href*="/artist/"] span'
    )?.textContent?.trim() || null;

    // 🖼 обложка (строго из player)
    const cover = root.querySelector('img')?.src || null;

    // 🆔 track id
    const trackLink = root.querySelector('a[href*="/track/"]');

    let trackId = null;
    if (trackLink) {
        const match = trackLink.href.match(/track\/(\d+)/);
        if (match) trackId = match[1];
    }

    return {
        title,
        artist,
        cover,
        trackId
    };
}