# Hotstar Subtitle Styler

A Chrome extension to customize subtitle appearance on [JioHotstar](https://www.hotstar.com). Hotstar doesn't provide built-in subtitle customization — this extension fills that gap.

## Features

- **Font**: Size, family, color, weight (bold via text-stroke), italic
- **Background**: Color and opacity (applied to text spans only, not the container)
- **Text Shadow**: None, outline, drop shadow, raised, depressed — with color and opacity controls
- **Layout**: Vertical position, line spacing, text transform

All defaults match Hotstar's native subtitle styling out of the box.

## Install

1. Clone this repo or download as ZIP
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the project folder
5. Navigate to Hotstar, play a video with subtitles, and click the extension icon to customize

## How It Works

- A content script injects into Hotstar pages and overrides subtitle styles via CSS `!important` rules and inline style overrides
- A `MutationObserver` watches for dynamically added subtitle elements and applies styles in real-time
- Settings are synced via `chrome.storage.sync` and persist across sessions
- Background is applied only to `<span>` elements (matching Hotstar's native behavior), not container `<div>`s

## Default Values (matching Hotstar)

| Setting | Default |
|---|---|
| Font | Inconsolata-SemiBold |
| Font Size | 28px (1.75rem) |
| Font Color | #ffffff |
| Background | rgba(0, 0, 0, 0.8) |
| Line Height | 129% |
| Vertical Position | 10% from bottom |
| Text Shadow | None |
