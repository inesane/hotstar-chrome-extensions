const DEFAULTS = {
  skipIntro: true,
  skipAds: true,
  autoNextEpisode: true,
  profileName: "",
};

const skipIntroEl = document.getElementById("skipIntro");
const skipAdsEl = document.getElementById("skipAds");
const autoNextEpisodeEl = document.getElementById("autoNextEpisode");
const profileNameEl = document.getElementById("profileName");

// Load saved settings
chrome.storage.sync.get(DEFAULTS, (settings) => {
  skipIntroEl.checked = settings.skipIntro;
  skipAdsEl.checked = settings.skipAds;
  autoNextEpisodeEl.checked = settings.autoNextEpisode;
  profileNameEl.value = settings.profileName;
});

function saveAndNotify() {
  const settings = {
    skipIntro: skipIntroEl.checked,
    skipAds: skipAdsEl.checked,
    autoNextEpisode: autoNextEpisodeEl.checked,
    profileName: profileNameEl.value.trim(),
  };

  chrome.storage.sync.set(settings);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "SETTINGS_UPDATE",
        settings,
      }).catch(() => {});
    }
  });
}

skipIntroEl.addEventListener("change", saveAndNotify);
skipAdsEl.addEventListener("change", saveAndNotify);
autoNextEpisodeEl.addEventListener("change", saveAndNotify);
profileNameEl.addEventListener("input", saveAndNotify);


