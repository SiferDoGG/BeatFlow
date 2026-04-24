console.log("BACKGROUND STARTED");

// слушаем команды из popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("BG GOT:", message);

    const tab = await getOrCreateYandexTab();

    chrome.tabs.sendMessage(tab.id, message);
});

// найти или создать вкладку
async function getOrCreateYandexTab() {
    let tabs = await chrome.tabs.query({
        url: "https://music.yandex.ru/*"
    });

    if (tabs.length > 0) {
        return tabs[0];
    }

    return await chrome.tabs.create({
        url: "https://music.yandex.ru/",
        active: false
    });
}