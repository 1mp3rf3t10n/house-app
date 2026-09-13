# HOUSE PWA

This package is an installable web app (PWA) version of HOUSE.

## Fastest Android install
1. Put this folder on a computer.
2. In the folder, run:
   `python -m http.server 8000`
3. On your Android phone, open the computer's local IP at port 8000 in Chrome.
4. Use **Install app** / **Add to Home screen**.

For a normal public install, host the folder on any HTTPS static host (for example Vercel). Once served over HTTPS, Chrome can install it like an app.

## Included
- House group chat
- 11 individual chats
- text messages
- voice-message recording
- spoken character replies
- image attachments
- video attachments
- offline cache after first load
- permanent avatar assets
- local message persistence

## Standalone HTML
`HOUSE.html` is also provided separately. It is a single-file version with the avatar images embedded directly inside it. It is convenient for opening/testing, but the PWA folder is the version intended for installation.


## Netlify / PWABuilder hardening
This build uses root-absolute PWA paths, explicit manifest/service-worker headers, app id/scope/start_url, and install metadata for better PWABuilder detection.
