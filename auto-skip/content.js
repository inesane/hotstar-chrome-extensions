(() => {
  "use strict";

  const DEFAULTS = {
    skipIntro: true,
    skipAds: true,
    profileName: "",
  };

  let settings = { ...DEFAULTS };

  const REFRESH_KEY = "autoskip_last_ad_refresh";
  const PROFILE_KEY = "autoskip_profile_name";
  const NEEDS_RESELECT_KEY = "autoskip_needs_reselect";
  const COOLDOWN_MS = 120_000;
  const STARTUP_DELAY_MS = 15_000;
  const pageLoadTime = Date.now();

  // ── Post-Refresh: Fullscreen ─────────────────────────────────────────
  // Runs immediately on script load. If we just refreshed for an ad,
  // poll for the video element and press F to restore fullscreen.

  const needsPostRefresh = sessionStorage.getItem(NEEDS_RESELECT_KEY) === "true";

  if (needsPostRefresh) {
    // Poll for video, handle profile selection, and restore fullscreen
    let fsAttempts = 0;
    const fsInterval = setInterval(() => {
      fsAttempts++;

      // Keep trying to select profile while waiting for video
      tryAutoSelectProfileOnce();

      if (document.querySelector("video")) {
        clearInterval(fsInterval);
        sessionStorage.removeItem(NEEDS_RESELECT_KEY);
        sessionStorage.removeItem(PROFILE_KEY);
        setTimeout(() => {
          chrome.runtime.sendMessage({ type: "PRESS_KEY", key: "f" });
        }, 2000);
      }
      if (fsAttempts >= 60) clearInterval(fsInterval);
    }, 1000);
  }

  let profileDone = false;

  function tryAutoSelectProfileOnce() {
    if (profileDone) return;

    const name = settings.profileName?.toLowerCase();
    if (!name) return;

    // Hotstar profile wrappers have data-testid="profile-wrapper-id"
    // Each contains a <p> with the profile name and a clickable role="button" div
    const wrappers = document.querySelectorAll('[data-testid="profile-wrapper-id"]');
    for (const wrapper of wrappers) {
      const text = (wrapper.textContent?.trim() || "").toLowerCase();
      if (text.includes(name)) {
        const btn = wrapper.querySelector('[role="button"]') || wrapper;
        btn.click();
        profileDone = true;
        return;
      }
    }
  }


  // ── Skip Intro / Skip Recap ──────────────────────────────────────────

  const SKIP_TEXT_PATTERNS = [
    /skip\s*intro/i,
    /skip\s*recap/i,
    /skip\s*opening/i,
    /skip\s*credits/i,
  ];

  function isSkipButton(el) {
    const text = el.textContent?.trim() || "";
    if (text.length > 30) return false;
    if (SKIP_TEXT_PATTERNS.some((re) => re.test(text))) return true;

    const label = el.getAttribute("aria-label") || "";
    if (SKIP_TEXT_PATTERNS.some((re) => re.test(label))) return true;

    return false;
  }

  function tryClickSkipButtons() {
    if (!settings.skipIntro) return;

    const clickables = document.querySelectorAll(
      'button, [role="button"], a, div[class*="skip" i], span[class*="skip" i]'
    );
    for (const el of clickables) {
      if (isSkipButton(el) && isVisible(el)) {
        el.click();
        return;
      }
    }
  }

  // ── Ad Detection & Refresh ───────────────────────────────────────────

  function recentlyRefreshed() {
    const last = sessionStorage.getItem(REFRESH_KEY);
    if (!last) return false;
    return Date.now() - parseInt(last, 10) < COOLDOWN_MS;
  }

  const AD_COUNTER_RE = /^\s*\d+\s+of\s+\d+\s*$/i;

  function findAdCounter() {
    const candidates = document.querySelectorAll("div, span, p");
    for (const el of candidates) {
      const text = el.textContent?.trim() || "";
      if (text.length > 10) continue;
      if (!AD_COUNTER_RE.test(text)) continue;
      if (!isVisible(el)) continue;
      if (isInsidePlayer(el)) return el;
    }
    return null;
  }

  function isInsidePlayer(el) {
    let node = el;
    while (node && node !== document.body) {
      const cls = node.className || "";
      if (typeof cls === "string") {
        const lower = cls.toLowerCase();
        if (
          lower.includes("player") ||
          lower.includes("video") ||
          lower.includes("overlay") ||
          lower.includes("shaka")
        ) {
          return true;
        }
      }
      if (node.querySelector?.("video")) return true;
      node = node.parentElement;
    }
    return false;
  }

  function handleAdDetection() {
    if (!settings.skipAds) return;
    if (Date.now() - pageLoadTime < STARTUP_DELAY_MS) return;
    if (recentlyRefreshed()) return;

    const counter = findAdCounter();
    if (counter) {
      sessionStorage.setItem(NEEDS_RESELECT_KEY, "true");
      sessionStorage.setItem(REFRESH_KEY, Date.now().toString());
      if (settings.profileName) {
        sessionStorage.setItem(PROFILE_KEY, settings.profileName);
      }

      location.reload();
    }
  }

  // ── Utilities ────────────────────────────────────────────────────────

  function isVisible(el) {
    if (!el.offsetParent && getComputedStyle(el).position !== "fixed") return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  let lastUrl = location.href;
  function checkUrlChange() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      sessionStorage.removeItem(REFRESH_KEY);
    }
  }

  // ── Main Loop ────────────────────────────────────────────────────────

  const observer = new MutationObserver(() => {
    tryClickSkipButtons();
    checkUrlChange();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  setInterval(() => {
    tryClickSkipButtons();
    handleAdDetection();
    checkUrlChange();
  }, 2000);

  // ── Settings ─────────────────────────────────────────────────────────

  chrome.storage.sync.get(DEFAULTS, (stored) => {
    settings = stored;
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "SETTINGS_UPDATE") {
      settings = message.settings;
    }
  });
})();
