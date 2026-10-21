// ==UserScript==
// @name         YouTube Ad Skipper (accélération)
// @namespace    mattrick08
// @version      1.1.0
// @description  Détecte les pubs YouTube, coupe le son, accélère à x16, saute à la fin et clique sur "Passer".
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const AD_RATE = 16;
  const RESTORE_DELAY_MS = 600; // évite de restaurer entre 2 pubs enchaînées
  const SKIP_SELECTORS = [
    '.ytp-skip-ad-button',
    '.ytp-ad-skip-button',
    '.ytp-ad-skip-button-modern',
    '.ytp-ad-skip-button-container button',
    'button.ytp-ad-skip-button-modern',
  ];
  const OVERLAY_CLOSE = '.ytp-ad-overlay-close-button, .ytp-ad-overlay-slot .ytp-ad-overlay-close-container';

  // État sauvegardé avant la pub, restauré après
  let saved = null;
  let lastAdSeen = 0;

  const getPlayer = () => document.querySelector('.html5-video-player');
  const getVideo = () => document.querySelector('video.html5-main-video') || document.querySelector('video');
  const isAd = (player) =>
    !!player && (player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting'));

  function clickSkip() {
    for (const sel of SKIP_SELECTORS) {
      const btn = document.querySelector(sel);
      if (btn && btn.offsetParent !== null) {
        btn.click();
        return true;
      }
    }
    return false;
  }

  function closeOverlays() {
    document.querySelectorAll(OVERLAY_CLOSE).forEach((el) => el.click());
  }

  function handleAd(video) {
    lastAdSeen = Date.now();
    if (!saved) {
      saved = { muted: video.muted, rate: video.playbackRate };
    }
    video.muted = true;
    video.playbackRate = AD_RATE;

    // Relance la lecture si la 2e pub reste bloquée en pause
    if (video.paused && !video.ended) {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }

    // Saute à la fin de la pub si la durée est connue
    if (Number.isFinite(video.duration) && video.duration > 0 && video.currentTime < video.duration - 0.1) {
      try {
        video.currentTime = video.duration;
      } catch (_) {}
    }

    clickSkip();
  }

  function restore(video) {
    if (!saved) return;
    if (Date.now() - lastAdSeen < RESTORE_DELAY_MS) return; // peut-être une autre pub qui arrive
    video.muted = saved.muted;
    video.playbackRate = saved.rate || 1;
    saved = null;
  }

  function tick() {
    const player = getPlayer();
    const video = getVideo();
    if (!player || !video) return;

    if (isAd(player)) {
      handleAd(video);
    } else {
      restore(video);
    }
    closeOverlays();
  }

  // Observer sur le lecteur (réaction immédiate)
  let observedPlayer = null;
  function attachObserver() {
    const player = getPlayer();
    if (!player || player === observedPlayer) return;
    observedPlayer = player;
    new MutationObserver(tick).observe(player, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: true,
    });
  }

  // Évènements média (capture : ils ne remontent pas jusqu'au document)
  ['loadedmetadata', 'durationchange', 'emptied', 'pause', 'ended', 'canplay'].forEach((evt) =>
    document.addEventListener(evt, tick, true)
  );

  // Filet de sécurité : intervalle + ré-attache après navigation SPA
  setInterval(() => {
    attachObserver();
    tick();
  }, 250);

  document.addEventListener('yt-navigate-finish', () => {
    attachObserver();
    tick();
  });
})();
