# Privacy Policy — JioHotstar Chrome Extensions

**Last updated:** March 24, 2026

This policy covers both extensions in this repository: **Hotstar Subtitle Styler** and **JioHotstar Auto Skip**.

## Overview

These Chrome extensions enhance the JioHotstar (hotstar.com) viewing experience. They are designed with user privacy as a core principle.

## Data Collection

These extensions do **not** collect, transmit, store, or share any user data. Specifically:

- **No personal data** is collected (name, email, account info, etc.)
- **No browsing history** is collected or tracked
- **No analytics or telemetry** is sent to any server
- **No cookies** are set or read by these extensions
- **No network requests** are made by these extensions

## Data Storage

Both extensions store only user preferences using Chrome's built-in `chrome.storage.sync` API. This data:

- Is stored locally in your browser and synced across your Chrome devices via your Google account
- Contains only settings (no personal information)
- Can be cleared at any time by uninstalling the extension

**Subtitle Styler** stores: subtitle style preferences (font size, color, background opacity, etc.)

**Auto Skip** stores: toggle states (skip intro, skip ads, auto next episode) and an optional profile name for auto-selection after ad refresh.

The Auto Skip extension also uses `sessionStorage` (cleared when the tab closes) to track ad refresh state. No data persists beyond the browser session.

## Permissions

- **`storage`** — Used to save user preferences locally.
- **`debugger`** (Auto Skip only) — Used to send a single trusted keyboard shortcut (`F` key) to restore the player's fullscreen mode after an ad-triggered page refresh. The debugger attaches and detaches within milliseconds. No data is read, inspected, or extracted from the page.
- **Host permissions (`*.hotstar.com`, `*.jiohotstar.com`)** — Content scripts run on these sites to modify subtitle styles (Subtitle Styler) and detect/interact with player controls (Auto Skip). No data is read from or extracted from these pages.

## Third-Party Services

These extensions do not use any third-party services, SDKs, or APIs.

## Changes to This Policy

Any changes to this privacy policy will be reflected in this document with an updated date.

## Contact

For questions about this privacy policy, please open an issue at: https://github.com/inesane/hotstar-chrome-extensions/issues
