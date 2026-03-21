
'use strict';

const IMAGES = [
  { src: 'fragments-img/image-1.jpg',  label: 'Fragment 01' },
  { src: 'fragments-img/image-2.jpg',  label: 'Fragment 02' },
  { src: 'fragments-img/image-3.jpg',  label: 'Fragment 03' },
  { src: 'fragments-img/image-4.jpg',  label: 'Fragment 04' },
  { src: 'fragments-img/image-5.jpg',  label: 'Fragment 05' },
  { src: 'fragments-img/image-6.jpg',  label: 'Fragment 06' },
  { src: 'fragments-img/image-7.jpg',  label: 'Fragment 07' },
  { src: 'fragments-img/image-8.jpg',  label: 'Fragment 08' },
  { src: 'fragments-img/image-10.jpg', label: 'Fragment 10' },
  { src: 'fragments-img/image-11.jpg', label: 'Fragment 11' },
  { src: 'fragments-img/image-12.jpg', label: 'Fragment 12' },
  { src: 'fragments-img/image-13.jpg', label: 'Fragment 13' },
  { src: 'fragments-img/image-15.jpg', label: 'Fragment 15' },
  { src: 'fragments-img/image-16.jpg', label: 'Fragment 16' },
  { src: 'fragments-img/image-17.jpg', label: 'Fragment 17' },
  { src: 'fragments-img/image-18.jpg', label: 'Fragment 18' },
  { src: 'fragments-img/image-19.jpg', label: 'Fragment 19' },
  { src: 'fragments-img/image-20.jpg', label: 'Fragment 20' },
  { src: 'fragments-img/image-21.jpg', label: 'Fragment 21' },
  { src: 'fragments-img/image-22.jpg', label: 'Fragment 22' },
  { src: 'fragments-img/image-23.jpg', label: 'Fragment 23' },
  { src: 'fragments-img/image-24.jpg', label: 'Fragment 24' },
  { src: 'fragments-img/image-25.jpg', label: 'Fragment 25' },
  { src: 'fragments-img/image-26.jpg', label: 'Fragment 26' },
  { src: 'fragments-img/image-27.jpg', label: 'Fragment 27' },
  { src: 'fragments-img/image-28.jpg', label: 'Fragment 28' },
];

const CARD_MAX_W     = 280;
const CARD_GAP       = 28;
const CARD_STEP      = CARD_MAX_W + CARD_GAP;  

const PINCH_THRESH   = 0.06;
const SWIPE_VEL      = 0.035;
const SWIPE_COOLDOWN = 750;
const WRIST_BUF_LEN  = 10;

let centerIndex = 0;
let isFocused   = false;
let swipeLocked = false;
const wristBuf  = [];
const TOTAL     = IMAGES.length;

const strip        = document.getElementById('strip');
const counterEl    = document.getElementById('counter');
const totalCountEl = document.getElementById('totalCount');
const imgLabelEl   = document.getElementById('imgLabel');
const navDotsEl    = document.getElementById('navDots');
const gestureLabel = document.getElementById('gestureLabel');
const badgePip     = document.getElementById('badgePip');
const videoEl      = document.getElementById('webcam');
const canvasEl     = document.getElementById('output');
const ctx          = canvasEl.getContext('2d');

canvasEl.width  = 420;
canvasEl.height = 316;

let cardWraps = [];

function buildStrip() {
  strip.innerHTML = '';
  IMAGES.forEach((img, i) => {
    const wrap     = document.createElement('div');
    wrap.className = 'card-wrap';
    wrap.dataset.label = img.label;
    wrap.dataset.index = i;

    const el     = document.createElement('img');
    el.className = 'card';
    el.src       = img.src;
    el.alt       = img.label;
    el.loading   = i < 4 ? 'eager' : 'lazy';

    wrap.addEventListener('click', () => scrollToCard(i));
    wrap.appendChild(el);
    strip.appendChild(wrap);
  });

  cardWraps = Array.from(strip.querySelectorAll('.card-wrap'));
  totalCountEl.textContent = String(TOTAL).padStart(2, '0');
}

function buildNavDots() {
  navDotsEl.innerHTML = '';
  IMAGES.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'dot' + (i === 0 ? ' active' : '');
    btn.setAttribute('aria-label', `Go to image ${i + 1}`);
    btn.addEventListener('click', () => scrollToCard(i));
    navDotsEl.appendChild(btn);
  });
}

function syncNavDots() {
  navDotsEl.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === centerIndex);
  });
}


function scrollToCard(index, animate = true, flash = false) {
  centerIndex = Math.max(0, Math.min(TOTAL - 1, index));

  const galleryW = window.innerWidth * 0.62;
  const offset   = galleryW / 2 - CARD_MAX_W / 2 - centerIndex * CARD_STEP;

  if (!animate) {
    strip.style.transition = 'none';
    strip.style.transform  = `translateX(${offset}px)`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { strip.style.transition = ''; });
    });
  } else {
    strip.style.transform = `translateX(${offset}px)`;
  }

  applyCardStates();
  syncNavDots();
  counterEl.textContent  = String(centerIndex + 1).padStart(2, '0');
  imgLabelEl.textContent = IMAGES[centerIndex]?.label || '—';

  if (flash) {
    const activeWrap = cardWraps[centerIndex];
    if (activeWrap) {
      activeWrap.classList.add('swiped');
      setTimeout(() => activeWrap.classList.remove('swiped'), 560);
    }
  }
}

function applyCardStates() {
  if (isFocused) return;
  cardWraps.forEach((wrap, i) => {
    wrap.classList.remove('active', 'near', 'focus', 'blur-dim');
    const d = Math.abs(i - centerIndex);
    if      (d === 0) wrap.classList.add('active');
    else if (d === 1) wrap.classList.add('near');
  });
}


function setFocus(active) {
  if (active === isFocused) return;
  isFocused = active;
  if (active) {
    cardWraps.forEach((wrap, i) => {
      wrap.classList.remove('active', 'near');
      wrap.classList.add(i === centerIndex ? 'focus' : 'blur-dim');
    });
  } else {
    cardWraps.forEach(w => w.classList.remove('focus', 'blur-dim'));
    applyCardStates();
  }
}


function lockSwipe() {
  swipeLocked = true;
  wristBuf.length = 0;
  setTimeout(() => { swipeLocked = false; }, SWIPE_COOLDOWN);
}

const BADGES = {
  none:    { pip: 'no-hand', text: 'no hand detected'   },
  neutral: { pip: 'neutral', text: 'tracking…'          },
  open:    { pip: 'open',    text: 'open palm'           },
  pinch:   { pip: 'pinch',   text: 'pinch — focus mode' },
  swipe_l: { pip: 'swipe',   text: '← browsing left'    },
  swipe_r: { pip: 'swipe',   text: '→ browsing right'   },
};

function setBadge(key) {
  const b = BADGES[key] || BADGES.neutral;
  badgePip.className       = `badge-pip ${b.pip}`;
  gestureLabel.textContent = b.text;
}

function pinchDist(lm) {
  return Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);
}

function isOpenPalm(lm) {
  const pairs = [[8,6],[12,10],[16,14],[20,18]];
  return pairs.filter(([tip, pip]) => lm[tip].y < lm[pip].y).length >= 3;
}

function classifyGesture(lm) {
  if (pinchDist(lm) < PINCH_THRESH) return 'pinch';
  if (isOpenPalm(lm))               return 'open';
  return 'neutral';
}

function detectSwipe(lm) {
  wristBuf.push(lm[0].x);
  if (wristBuf.length > WRIST_BUF_LEN) wristBuf.shift();
  if (wristBuf.length < 6 || swipeLocked) return null;

  const vel = wristBuf[wristBuf.length - 1] - wristBuf[0];

  if (vel < -SWIPE_VEL) return 'prev';
  if (vel >  SWIPE_VEL) return 'next';
  return null;
}

const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17]
];

function drawHand(lm, w, h, gesture) {
  const px = p => p.x * w;
  const py = p => p.y * h;

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth   = 1.5;
  CONNECTIONS.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(px(lm[a]), py(lm[a]));
    ctx.lineTo(px(lm[b]), py(lm[b]));
    ctx.stroke();
  });

  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = gesture === 'pinch' ? '#ff6b6b' : 'rgba(255,255,255,0.28)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(px(lm[4]), py(lm[4]));
  ctx.lineTo(px(lm[8]), py(lm[8]));
  ctx.stroke();
  ctx.setLineDash([]);

  lm.forEach((pt, i) => {
    const isThumb = i === 4;
    const isIndex = i === 8;
    const isWrist = i === 0;

    let r = 2.5;
    let c = 'rgba(237,233,224,0.6)';
    if (isWrist) { r = 4.5; c = '#7ad4f4'; }
    if (isThumb) { r = 5;   c = gesture === 'pinch' ? '#ff6b6b' : '#d4f455'; }
    if (isIndex) { r = 5;   c = gesture === 'pinch' ? '#ff6b6b' : '#d4f455'; }

    if ((isThumb || isIndex) && gesture === 'pinch') {
      ctx.beginPath();
      ctx.arc(px(pt), py(pt), r + 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,107,107,0.18)';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(px(pt), py(pt), r, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });

  if (gesture === 'open') {
    ctx.beginPath();
    ctx.arc(px(lm[0]), py(lm[0]), 12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(122,212,244,0.14)';
    ctx.fill();
  }
}

const hands = new Hands({
  locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands:            1,
  modelComplexity:        0,
  minDetectionConfidence: 0.70,
  minTrackingConfidence:  0.60
});

hands.onResults(results => {
  const w = canvasEl.width;
  const h = canvasEl.height;

  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(results.image, 0, 0, w, h);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const lm      = results.multiHandLandmarks[0];
    const gesture = classifyGesture(lm);

    drawHand(lm, w, h, gesture);

    if (gesture === 'pinch') {

      setFocus(true);
      wristBuf.length = 0;
      setBadge('pinch');

    } else {

      setFocus(false);

      const dir = detectSwipe(lm);

      if (dir === 'next' && centerIndex < TOTAL - 1) {
        scrollToCard(centerIndex + 1, true, true);
        setBadge('swipe_l');
        lockSwipe();

      } else if (dir === 'prev' && centerIndex > 0) {
        scrollToCard(centerIndex - 1, true, true);
        setBadge('swipe_r');
        lockSwipe();

      } else {
        setBadge(gesture === 'open' ? 'open' : 'neutral');
      }
    }

  } else {
    
    setFocus(false);
    wristBuf.length = 0;
    setBadge('none');
  }

  ctx.restore();
});

const camera = new Camera(videoEl, {
  onFrame: async () => { await hands.send({ image: videoEl }); },
  width: 640, height: 480
});

camera.start()
  .then(() => setBadge('neutral'))
  .catch(() => {
    gestureLabel.textContent = 'camera access denied';
    badgePip.className       = 'badge-pip no-hand';
  });

document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowRight':
      if (centerIndex < TOTAL - 1) scrollToCard(centerIndex + 1, true, true);
      break;
    case 'ArrowLeft':
      if (centerIndex > 0) scrollToCard(centerIndex - 1, true, true);
      break;
    case 'Escape':
      scrollToCard(0);
      break;
  }
  if (e.code === 'Space') { e.preventDefault(); setFocus(true); }
});

document.addEventListener('keyup', e => {
  if (e.code === 'Space') setFocus(false);
});

window.addEventListener('resize', () => scrollToCard(centerIndex, false));

window.addEventListener('load', () => {
  buildStrip();
  buildNavDots();
  scrollToCard(0, false);
});