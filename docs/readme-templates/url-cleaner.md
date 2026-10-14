# URL Cleaner

A Chrome extension that strips tracking parameters from URLs before you share them.

## The problem

Every shared link carries tracking data - utm_*, fbclid, gclid, mc_eid, dozens of others. When you paste a link into a message, you leak where you came from and sometimes a unique identifier.

## What it does

- Removes 40+ known tracking parameters
- Right-click context menu on any link
- Keyboard shortcut Alt+Shift+C
- Popup shows the cleaned URL with a copy button

## Technical decisions

- Manifest V3: required for new Chrome Web Store submissions.
- Deny-list over allow-list: allow-list breaks too many legitimate URLs.
- No external API: this is a privacy tool. Calling home would defeat the purpose.

## What would I change at scale?

- Sync the deny-list from a remote source with caching
- Firefox build
- Optionally strip tracking from all navigations

## What I learned

Manifest V3 changed how extensions work. Service workers are not persistent, so state has to live in chrome.storage. Starting on V2 and migrating would have been much worse.

## License

MIT
