/* ============================================================
   ЛЕНОЧКА v2 — main.js
   ============================================================ */
'use strict';

// Mark document as JS-ready immediately — enables reveal animations
// and safe cursor hiding
document.documentElement.classList.add('js-ready');

/* ─── CUSTOM CURSOR ───────────────────────────────────────── */
(function() {
  // Only activate on true pointer devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Activate cursor hiding only now that we confirmed JS works
  document.body.classList.add('js-cursor');

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx, ry = my;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function lerp(a, b, t) { return a + (b - a) * t; }

  (function tick() {
    rx = lerp(rx, mx, 0.13);
    ry = lerp(ry, my, 0.13);
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  })();

  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, [data-cursor-hover]')) {
      document.body.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, [data-cursor-hover]')) {
      document.body.classList.remove('cursor-hover');
    }
  });
})();

/* ─── SCROLL PROGRESS BAR ─────────────────────────────────── */
const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progressBar.style.width = pct + '%';
  }, { passive: true });
}

/* ─── NAV SCROLL ──────────────────────────────────────────── */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ─── HAMBURGER ───────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger && mobileMenu) {
  let menuOpen = false;
  hamburger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    const spans = hamburger.querySelectorAll('span');
    if (menuOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }));
}

/* ─── SMOOTH ANCHOR SCROLL ────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' });
    }
  });
});

/* ─── SCROLL REVEAL ───────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  revealEls.forEach(el => obs.observe(el));

  // Hard fallback: if something still hidden after 3s, force-show everything
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      el.classList.add('visible');
    });
  }, 3000);
} else {
  // No IntersectionObserver support — show everything immediately
  revealEls.forEach(el => el.classList.add('visible'));
}

/* ─── HERO TEXT SCRAMBLE ──────────────────────────────────── */
function scramble(el, finalText, duration) {
  const chars = 'АБВГДЕЖЗИКЛМНОПЧабвгдежзи0123456789#@!';
  const steps = Math.floor(duration / 45);
  let step = 0;
  const iv = setInterval(() => {
    const revealed = Math.floor((step / steps) * finalText.length);
    el.textContent = finalText.split('').map((ch, i) =>
      i < revealed || ch === ' '
        ? ch
        : chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    step++;
    if (step > steps) { el.textContent = finalText; clearInterval(iv); }
  }, 45);
}

window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.scramble-word').forEach(el => {
      const final = el.dataset.final || el.textContent;
      el.dataset.final = final;
      scramble(el, final, 1200);
    });
  }, 300);
});

/* ─── COUNTER ANIMATION ───────────────────────────────────── */
function animateCount(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const dur = 1500;
  const start = performance.now();
  const easeOut = t => 1 - Math.pow(1 - t, 4);
  (function update(now) {
    const t = Math.min((now - start) / dur, 1);
    el.textContent = Math.floor(easeOut(t) * target) + suffix;
    if (t < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  })(start);
}
if ('IntersectionObserver' in window) {
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); cObs.unobserve(e.target); } });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-counter]').forEach(el => cObs.observe(el));
}

/* ─── TELEGRAM CHAT ANIMATION ─────────────────────────────── */
(function() {
  const box = document.getElementById('phone-messages');
  if (!box) return;
  const msgs = [
    { type: 'bot',    html: '☀️ <b>Доброе утро!</b> Твой дайджест готов', delay: 0 },
    { type: 'bot',    html: '🔴 Клиент Артём не отвечал <b>3 дня</b> — написала черновик', delay: 700 },
    { type: 'user',   html: 'Покажи задачи на сегодня', delay: 1500 },
    { type: 'typing', html: '', delay: 1900 },
    { type: 'bot',    html: '📋 <b>14 задач</b>, 3 горят к вечеру', delay: 2700 },
  ];
  let running = false;

  function addMsg(m) {
    box.querySelector('.cmsg-typing')?.remove();
    const el = document.createElement('div');
    if (m.type === 'typing') {
      el.className = 'cmsg-typing';
      el.innerHTML = '<span class="d"></span><span class="d"></span><span class="d"></span>';
    } else {
      el.className = 'cmsg cmsg-' + m.type;
      el.innerHTML = m.html;
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      el.style.transition = 'opacity .3s ease, transform .3s ease';
    }
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
    if (m.type !== 'typing') {
      requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'none'; });
    }
  }

  function run() {
    if (running) return;
    running = true;
    box.innerHTML = '';
    msgs.forEach(m => setTimeout(() => addMsg(m), m.delay));
    setTimeout(() => { running = false; setTimeout(run, 2500); }, 5500);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { setTimeout(run, 400); }
    }, { threshold: 0.2 }).observe(box);
  } else {
    setTimeout(run, 800);
  }
})();

/* ─── TILT CARDS ──────────────────────────────────────────── */
if (window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.feat-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(6px)`;
      card.style.transition = 'transform .08s linear, box-shadow .2s, border-color .2s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1), box-shadow .2s, border-color .2s';
    });
  });
}

/* ─── AUDIENCE TABS ───────────────────────────────────────── */
document.querySelectorAll('.aud-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.aud-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.aud-panel').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
    tab.classList.add('active');
    const panel = document.getElementById('panel-' + tab.dataset.tab);
    if (panel) {
      panel.style.display = 'grid';
      panel.classList.add('active');
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(12px)';
      requestAnimationFrame(() => {
        panel.style.transition = 'opacity .45s var(--ease), transform .45s var(--ease)';
        panel.style.opacity = '1';
        panel.style.transform = 'none';
      });
    }
  });
});
// Set initial panel visibility via JS (CSS default is display:none)
const firstPanel = document.getElementById('panel-solo');
if (firstPanel) { firstPanel.style.display = 'grid'; }

/* Pricing toggle removed — 2 fixed plans */

/* ─── FAQ ACCORDION ───────────────────────────────────────── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* Old drag carousel removed */

/* ─── STICKY BAR ──────────────────────────────────────────── */
(function() {
  const bar = document.getElementById('sticky-bar');
  if (!bar) return;
  const watched = new Set();

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? watched.add(e.target.id) : watched.delete(e.target.id));
    bar.classList.toggle('visible', watched.size === 0 && window.scrollY > 200);
  }, { threshold: 0.15 });

  ['hero', 'cta', 'site-footer'].forEach(id => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });

  window.addEventListener('scroll', () => {
    bar.classList.toggle('visible', watched.size === 0 && window.scrollY > 200);
  }, { passive: true });
})();

/* ─── COOKIE BANNER ───────────────────────────────────────── */
(function() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  if (localStorage.getItem('lenochka-v2-cookies')) { banner.classList.add('hidden'); return; }
  setTimeout(() => banner.classList.remove('hidden'), 1400);
  const dismiss = c => { localStorage.setItem('lenochka-v2-cookies', c); banner.classList.add('hidden'); };
  document.getElementById('cookie-accept')?.addEventListener('click',  () => dismiss('all'));
  document.getElementById('cookie-decline')?.addEventListener('click', () => dismiss('necessary'));
})();

/* ═══════════════════════════════════════════════════════════
   THEME PANEL — light / dark toggle
   ═══════════════════════════════════════════════════════════ */
(function () {
  const root     = document.documentElement;
  const panel    = document.getElementById('theme-panel');
  const btn      = document.getElementById('theme-btn');
  const closeBtn = document.getElementById('panel-close');
  const backdrop = document.getElementById('theme-backdrop');
  if (!panel || !btn) return;

  /* ── Restore saved preference ───────────────────────────── */
  let currentTheme = localStorage.getItem('lnv2-theme') || 'light';
  applyTheme(currentTheme, false);
  syncUI();

  /* ── Panel open / close ─────────────────────────────────── */
  function openPanel() {
    panel.classList.add('open');
    backdrop.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
  function closePanel() {
    panel.classList.remove('open');
    backdrop.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    // Close docs panel if open
    document.getElementById('docs-panel')?.classList.remove('open');
    document.getElementById('docs-backdrop')?.classList.remove('open');
    document.getElementById('docs-btn')?.setAttribute('aria-expanded', 'false');
    panel.classList.contains('open') ? closePanel() : openPanel();
  });
  closeBtn?.addEventListener('click', closePanel);
  backdrop.addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

  /* ── Theme switcher ─────────────────────────────────────── */
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const val = opt.dataset.themeVal;
      if (val === currentTheme) return;
      currentTheme = val;
      localStorage.setItem('lnv2-theme', val);
      applyTheme(val, true);
      syncUI();
    });
  });

  /* ── Helpers ────────────────────────────────────────────── */
  function applyTheme(theme, animate) {
    if (animate) {
      root.classList.add('theme-transitioning');
      setTimeout(() => root.classList.remove('theme-transitioning'), 500);
    }
    theme === 'dark'
      ? root.setAttribute('data-theme', 'dark')
      : root.removeAttribute('data-theme');
  }

  function syncUI() {
    document.querySelectorAll('.theme-option').forEach(o => {
      o.classList.toggle('active', o.dataset.themeVal === currentTheme);
    });
  }
})();

/* ═══════════════════════════════════════════════════════════
   DOCS PANEL
   ═══════════════════════════════════════════════════════════ */
(function () {
  const btn      = document.getElementById('docs-btn');
  const panel    = document.getElementById('docs-panel');
  const closeBtn = document.getElementById('docs-panel-close');
  const backdrop = document.getElementById('docs-backdrop');
  const themePanel = document.getElementById('theme-panel');
  if (!btn || !panel) return;

  function open() {
    panel.classList.add('open');
    backdrop?.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    // Close theme panel if open
    themePanel?.classList.remove('open');
    document.getElementById('theme-backdrop')?.classList.remove('open');
    document.getElementById('theme-btn')?.setAttribute('aria-expanded', 'false');
  }
  function close() {
    panel.classList.remove('open');
    backdrop?.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    panel.classList.contains('open') ? close() : open();
  });
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* Old auto-carousel removed */

/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS — drag track + dot indicators
   ═══════════════════════════════════════════════════════════ */
(function () {
  const wrap  = document.getElementById('testi-track-wrap');
  const track = document.getElementById('testi-track');
  const dots  = document.querySelectorAll('.testi-dot');
  const prev  = document.getElementById('testi-prev');
  const next  = document.getElementById('testi-next');
  if (!wrap || !track) return;

  const CARD_W   = 363;   // card width (360) + gap (3)
  const TOTAL    = track.querySelectorAll('.testi-card-v2').length;
  let offset     = 0;
  let isDragging = false;
  let startX     = 0;
  let dragOffset = 0;
  let currentIdx = 0;

  /* ── Clamp & snap helpers ──────────────────────────────── */
  function maxOff() { return -(track.scrollWidth - wrap.clientWidth + 96); }
  function clamp(v) { return Math.max(maxOff(), Math.min(0, v)); }
  function idxFromOffset(o) {
    return Math.min(TOTAL - 1, Math.max(0, Math.round(Math.abs(o) / CARD_W)));
  }

  /* ── Move to position ──────────────────────────────────── */
  function moveTo(x, animate) {
    track.style.transition = animate
      ? 'transform .45s cubic-bezier(.16,1,.3,1)'
      : 'none';
    track.style.transform = `translateX(${x}px)`;
    offset = x;
    currentIdx = idxFromOffset(x);
    updateDots();
  }

  /* ── Dot sync ──────────────────────────────────────────── */
  function updateDots() {
    dots.forEach((d, i) => d.classList.toggle('active', i === currentIdx));
  }

  /* ── Drag (pointer events) ─────────────────────────────── */
  wrap.addEventListener('pointerdown', e => {
    isDragging = true;
    startX = e.clientX - offset;
    dragOffset = offset;
    wrap.setPointerCapture(e.pointerId);
    wrap.classList.add('dragging');
    document.body.classList.add('cursor-drag');
    track.style.transition = 'none';
  });

  wrap.addEventListener('pointermove', e => {
    if (!isDragging) return;
    dragOffset = clamp(e.clientX - startX);
    track.style.transform = `translateX(${dragOffset}px)`;
  });

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    wrap.classList.remove('dragging');
    document.body.classList.remove('cursor-drag');
    const snapped = clamp(Math.round(dragOffset / CARD_W) * CARD_W);
    moveTo(snapped, true);
  }

  wrap.addEventListener('pointerup',     endDrag);
  wrap.addEventListener('pointercancel', endDrag);
  wrap.addEventListener('dragstart',     e => e.preventDefault());

  /* ── Arrow buttons ─────────────────────────────────────── */
  prev?.addEventListener('click', () =>
    moveTo(clamp(offset + CARD_W), true)
  );
  next?.addEventListener('click', () =>
    moveTo(clamp(offset - CARD_W), true)
  );

  /* ── Dot buttons ───────────────────────────────────────── */
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.idx);
      moveTo(clamp(-idx * CARD_W), true);
    });
  });

  /* ── Init ──────────────────────────────────────────────── */
  updateDots();
})();