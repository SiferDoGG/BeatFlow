console.log("Yandex content loaded");

// ---------------- CACHE ----------------

const coverCache = new Map();

// ---------------- ACTIONS ----------------

const actions = {
    PLAY_PAUSE: togglePlay,
    NEXT: next,
    PREV: prev,
    SET_VOLUME: (msg) => setVolume(msg.value),
    SET_PROGRESS: (msg) => setProgress(msg.value),
    GET_PROGRESS: () => ({ ok: true, data: getProgress() }),
    GET_VOLUME: () => ({ ok: true, data: getVolume() }),
    GET_TRACK_INFO: () => ({ ok: true, data: getTrackInfo() })
};

// ---------------- WS ----------------

chrome.runtime.onMessage.addListener((message) => {
    const fn = actions[message.type];
    if (!fn) return;

    let result;

    try {
        result = fn(message);
    } catch (e) {
        result = { ok: false, error: e.message };
    }

    chrome.runtime.sendMessage({
        ...result,
        request_id: message.request_id
    });
});

// ---------------- PLAYER ----------------

function togglePlay() {
    const btn = document.querySelector(
        '[aria-label="Пауза"], [aria-label="Воспроизведение"]'
    );
    if (!btn) return { ok: false };
    btn.click();
    return { ok: true };
}

function next() {
    const btn = document.querySelector('[aria-label="Следующая песня"]');
    if (!btn) return { ok: false };
    btn.click();
    return { ok: true };
}

function prev() {
    const btn = document.querySelector('[aria-label="Предыдущая песня"]');
    if (!btn) return { ok: false };
    btn.click();
    return { ok: true };
}

// ---------------- VOLUME ----------------

function setVolume(value) {
    const input = document.querySelector(
        'input[aria-label="Управление громкостью"]'
    );

    if (!input) return { ok: false };

    const v = Math.min(1, Math.max(0, Number(value)));

    input.value = v;
    input.dispatchEvent(new Event("input", { bubbles: true }));

    return { ok: true };
}

function getVolume() {
    const input = document.querySelector(
        'input[aria-label="Управление громкостью"]'
    );

    if (!input) return null;

    const value = parseFloat(input.value);
    if (isNaN(value)) return null;

    return { value };
}

// ---------------- PROGRESS ----------------

function setProgress(value) {
    const input = document.querySelector(
        'input[aria-label="Управление таймкодом"]'
    );

    if (!input) return { ok: false };

    const max = parseFloat(input.max) || 100;
    const v = Math.min(1, Math.max(0, Number(value)));

    input.value = v * max;
    input.dispatchEvent(new Event("input", { bubbles: true }));

    return { ok: true };
}

function getProgress() {
    const input = document.querySelector(
        'input[aria-label="Управление таймкодом"]'
    );

    if (!input) return null;

    const current = parseFloat(input.value);
    const max = parseFloat(input.max);

    if (isNaN(current) || isNaN(max)) return null;

    return { current, max };
}

// ---------------- ROOT ----------------

function getPlayerRoot() {
    return document.querySelector(
        'section[class*="PlayerBarDesktopWithBackgroundProgressBar_root"]'
    );
}

// ---------------- COVER UPSCALE ----------------

function upgradeCover(url) {
    if (!url) return null;

    return url
        .replace(/50x50/g, "1000x1000")
        .replace(/200x200/g, "1000x1000")
        .replace(/300x300/g, "1000x1000")
        .replace(/400x400/g, "1000x1000")
        .replace(/800x800/g, "1000x1000");
}

// ---------------- TRACK INFO ----------------

function getTrackInfo() {
    const root = getPlayerRoot();
    if (!root) return null;

    const title =
        root.querySelector('a[href*="/track/"] span')?.textContent?.trim()
        || null;

    const artist =
        Array.from(root.querySelectorAll('a[href*="/artist/"] span'))
            .map(el => el.textContent.trim())
            .filter(Boolean)
            .join(", ") || null;

    const trackLink = root.querySelector('a[href*="/track/"]');
    const trackHref = trackLink?.getAttribute("href");

    const trackId = trackHref?.match(/track\/(\d+)/)?.[1] || null;

    let cover = null;

    const img = root.querySelector('img');

    if (img) {
        const srcset = img.getAttribute("srcset");

        if (srcset) {
            const last = srcset
                .split(",")
                .map(s => s.trim())
                .pop()
                ?.split(" ")[0];

            cover = last;
        }

        if (!cover) cover = img.src;

        cover = upgradeCover(cover);
    }

    if (trackId && !coverCache.has(trackId)) {
        getHQCover(trackId).then(hq => {
            if (hq) coverCache.set(trackId, hq);
        });
    }

    if (trackId && coverCache.has(trackId)) {
        cover = coverCache.get(trackId);
    }

    return {
        title,
        artist,
        cover,
        trackId
    };
}

// ---------------- HQ API ----------------

async function getHQCover(trackId) {
    if (!trackId) return null;

    if (coverCache.has(trackId)) return coverCache.get(trackId);

    try {
        const res = await fetch(
            `https://music.yandex.ru/handlers/track.jsx?track=${trackId}`
        );

        const data = await res.json();

        const uri =
            data?.track?.album?.coverUri ||
            data?.track?.coverUri;

        if (!uri) return null;

        const url = `https://${uri.replace("%%", "1000x1000")}`;

        coverCache.set(trackId, url);

        return url;

    } catch (e) {
        return null;
    }
}