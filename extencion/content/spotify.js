console.log("Spotify content loaded");

const actions = {
    PLAY_PAUSE: togglePlay
};

chrome.runtime.onMessage.addListener((message) => {
    const fn = actions[message.type];
    if (!fn) return;

    const result = fn(message);

    chrome.runtime.sendMessage({
        ...result,
        request_id: message.request_id
    });
});

function togglePlay() {
    const btn = document.querySelector('[data-testid="control-button-playpause"]');

    if (!btn) return { ok: false };

    btn.click();
    return { ok: true };
}