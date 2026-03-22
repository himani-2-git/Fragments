# Fragments
### *A vision gallery*

> Pictures I gathered from the world as I saw it, and taught a machine to see it too.

---

Fragments is a personal photo gallery that you navigate with your hands. Using your webcam, it tracks your gestures in real time and lets you browse through images by waving, swiping, or pinching the air. No mouse required.

It started as a collection of photographs and became something a little more an experiment in making a gallery feel alive.

---

## How to use it

Open `index.html` in your browser, allow camera access when asked, and then just use your hand.

| Gesture | What it does |
|---|---|
| ✋ Swipe left / right | Browse to the next or previous image |
| 🤏 Pinch | Focus mode — dims everything else |
| `← →` Arrow keys | Same as swiping, if you prefer keyboard |
| `Space` | Hold to focus |
| `Escape` | Jump back to the first image |

The small camera preview in the bottom-right corner shows you what the hand tracker is seeing, with a live skeleton overlay drawn on your hand. A badge below it tells you what gesture it thinks you're making.

---

## Project structure

```
fragments/
├── index.html          — the whole layout lives here
├── style.css           — all the visual design and animations
├── script.js           — gesture detection + gallery logic
└── fragments-img/      — your photos (image-1.jpg through image-28.jpg)
```

The images are named `image-1.jpg`, `image-2.jpg`, and so on (a few numbers are skipped — that's intentional). If you want to add or swap photos, just drop them into `fragments-img/` and update the `IMAGES` array at the top of `script.js`.

---

## How the gesture detection works

It uses [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) — a Google library that detects 21 landmarks on your hand from a standard webcam feed, running entirely in the browser with no data sent anywhere.

Three gestures are recognised:

- **Pinch** — detected when the distance between your thumb tip and index fingertip drops below a threshold
- **Open palm** — detected when at least 3 of your 4 fingers are extended upward
- **Swipe** — tracked by watching how fast your wrist moves horizontally across the last 10 frames

There's a 750ms cooldown after each swipe so it doesn't trigger multiple times from one motion.

---

## Running locally

No build step, no dependencies to install. Just open the file:

```bash
# Option 1 — directly in browser
open index.html

# Option 2 — via a local server (recommended, avoids camera permission issues in some browsers)
npx serve .
# then visit http://localhost:3000
```

> **Note:** Camera access requires either `localhost` or an `https://` connection. If you open the file directly and the camera doesn't work, use the local server approach above.

---

## Browser support

Works best in Chrome or Edge. Firefox should work too. Safari on macOS may have issues with camera permissions depending on your settings.

---

## A note on the photos

The `fragments-img/` folder holds 26 photographs — moments collected over time, filtered through a very particular way of seeing. The machine learned the hand; the eye chose what to point it at.

---

*Built with MediaPipe Hands, a little CSS patience, and a lot of passion for photography.*
