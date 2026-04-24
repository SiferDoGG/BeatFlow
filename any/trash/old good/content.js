console.log("Content script loaded");

chrome.runtime.onMessage.addListener((message) => {
    console.log("MSG:", message);

    switch (message.type) {
        case "PLAY_PAUSE":
            togglePlay();
            break;

        case "NEXT":
            next();
            break;

        case "SET_VOLUME":
            setVolume(message.value);
            break;
    }
});

// ---------- PLAYER CONTROL ----------

function togglePlay() {
    document.querySelector(
        '[aria-label="Пауза"], [aria-label="Воспроизведение"]'
    )?.click();
}

function next() {
    document.querySelector('[aria-label="Следующая песня"]')?.click();
}

function setVolume(value) {
    const volumeInput = document.querySelector(
        'input[aria-label="Управление громкостью"]'
    );

    if (!volumeInput) return;

    volumeInput.value = value;
    volumeInput.dispatchEvent(new Event("input", { bubbles: true }));
}