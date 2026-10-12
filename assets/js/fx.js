/* Japon 2026 — animations reprises des templates fournis :
   - Tidal (japon.zip) : compteurs animés, courbe qui se dessine, apparition en cascade
   - Animated image slider (japon2.zip) : slider à cartes empilées + texte qui apparaît en fondu flou
   - Travel features / Owl carousel (japon3.zip) : carrousel de cartes avec flèches rondes (sans jQuery)
   - Button State Builder (japon4.zip) : boutons chargement → succès, onde au clic */
'use strict';
(function () {
  const J = window.J;
  const fx = (J.fx = {});
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- Tidal : compteur qui défile (easing power2.out) ---------- */
  fx.countUp = (el, target, { duration = 1600, delay = 0, format = (v) => String(Math.round(v)) } = {}) => {
    if (reduce() || !Number.isFinite(target)) { el.textContent = format(target); return; }
    el.textContent = format(0);
    // valeur finale garantie, même si l'onglet est en arrière-plan (animations suspendues)
    setTimeout(() => { el.textContent = format(target); }, delay + duration + 120);
    const t0 = performance.now() + delay;
    const step = (t) => {
      const p = Math.min(1, Math.max(0, (t - t0) / duration));
      el.textContent = format(target * (1 - (1 - p) * (1 - p)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const FORMATS = { eur: (v) => J.eur(Math.round(v)), int: (v) => String(Math.round(v)), pad2: (v) => String(Math.round(v)).padStart(2, '0') };
  let countIO = null;
  fx.counters = (root) => {
    const els = J.$$('[data-count]:not([data-counted])', root);
    const run = (el) => { el.dataset.counted = '1'; fx.countUp(el, +el.dataset.count, { format: FORMATS[el.dataset.format] || FORMATS.int, delay: +(el.dataset.delay || 0) }); };
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    countIO = countIO || new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { countIO.unobserve(en.target); run(en.target); } }), { threshold: 0.4 });
    els.forEach((el) => countIO.observe(el));
  };

  /* ---------- Tidal : tracé SVG qui se dessine quand il devient visible ---------- */
  let drawIO = null;
  fx.draw = (root) => {
    const els = J.$$('.fx-draw:not(.is-drawn)', root);
    if (reduce() || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-drawn')); return; }
    drawIO = drawIO || new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-drawn'); drawIO.unobserve(en.target); }
    }), { threshold: 0.3 });
    els.forEach((e) => drawIO.observe(e));
  };

  /* ---------- Button State Builder : onde au clic ---------- */
  document.addEventListener('pointerdown', (e) => {
    const host = e.target.closest('.btn, .chip, .fc-card, .fx-ripple-host');
    if (!host || reduce()) return;
    const r = host.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.2;
    const s = document.createElement('span');
    s.className = 'fx-ripple';
    s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    host.append(s);
    setTimeout(() => s.remove(), 650);
  });

  /* ---------- Button State Builder : idle → chargement (points) → succès (coche) ---------- */
  fx.flow = async (btn, work, { done = 'Enregistré', hold = 900 } = {}) => {
    if (!btn) return work();
    if (btn.dataset.state === 'loading') return undefined;
    const html = btn.innerHTML;
    btn.style.minWidth = btn.offsetWidth + 'px';
    btn.dataset.state = 'loading';
    btn.innerHTML = '<span class="fx-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="sr-only">Enregistrement…</span>';
    let result;
    try {
      [result] = await Promise.all([work(), sleep(reduce() ? 0 : 420)]);
      if (result === false) throw new Error('refusé');
      btn.dataset.state = 'success';
      btn.innerHTML = `<svg class="fx-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.5l5 5L20 7"/></svg><span>${J.esc(done)}</span>`;
      await sleep(reduce() ? 200 : hold);
    } catch (err) {
      btn.dataset.state = 'error';
      btn.innerHTML = '<span>Vérifie le formulaire</span>';
      await sleep(1100);
      result = false;
    } finally {
      if (btn.isConnected) { btn.dataset.state = ''; btn.innerHTML = html; btn.style.minWidth = ''; }
    }
    return result;
  };

  /* ---------- Animated image slider (japon2) ----------
     Le 2e élément est la diapositive affichée ; « suivant » envoie le 1er à la fin, « précédent » ramène le dernier devant. */
  fx.slider = (root) => {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = '1';
    const track = J.$('.slide', root);
    const counter = J.$('.slider-count', root);
    const sync = () => {
      const items = J.$$('.item', track);
      items.forEach((it, i) => { it.setAttribute('aria-hidden', String(i !== 1)); J.$$('a, button', it).forEach((a) => (a.tabIndex = i === 1 ? 0 : -1)); });
      if (counter) counter.textContent = `${+items[1].dataset.n} / ${items.length}`;
    };
    const next = () => { track.append(J.$$('.item', track)[0]); sync(); };
    const prev = () => { const items = J.$$('.item', track); track.prepend(items[items.length - 1]); sync(); };
    J.$('.next', root).addEventListener('click', next);
    J.$('.prev', root).addEventListener('click', prev);
    root.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); });
    let x0 = null, y0 = null;
    root.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    root.addEventListener('touchend', (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dy) < 60) (dx < 0 ? next : prev)();
      x0 = null;
    });
    sync();
  };

  /* ---------- Travel features carousel (japon3, version sans jQuery/Owl) ---------- */
  fx.carousel = (root) => {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = '1';
    const track = J.$('.carousel-track', root);
    const step = () => { const it = J.$('.citem', track); return it ? it.getBoundingClientRect().width + 10 : track.clientWidth; };
    const go = (dir) => {
      const max = track.scrollWidth - track.clientWidth - 2;
      // boucle comme « loop: true » d'Owl : au bout, on repart au début
      if (dir > 0 && track.scrollLeft >= max) track.scrollTo({ left: 0, behavior: 'smooth' });
      else if (dir < 0 && track.scrollLeft <= 2) track.scrollTo({ left: max + 2, behavior: 'smooth' });
      else track.scrollBy({ left: dir * step(), behavior: 'smooth' });
    };
    J.$('.c-next', root).addEventListener('click', () => go(1));
    J.$('.c-prev', root).addEventListener('click', () => go(-1));
  };

  fx.all = (root) => { fx.counters(root); fx.draw(root); J.reveal(root); };
})();
