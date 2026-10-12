/* Japon 2026 — démarrage, navigation, thème, événements globaux */
'use strict';
(function () {
  const J = window.J;
  const { $, $$ } = J;

  const VIEW_OF = { '': 'home', itineraire: 'itineraire', jour: 'jour', aujourdhui: 'jour', activites: 'activites', carte: 'carte', outils: 'outils' };
  const TITLES = { home: 'Accueil', itineraire: 'Itinéraire', jour: 'Programme du jour', activites: 'Activités', carte: 'Carte', outils: 'Outils pratiques' };
  const KEEP_SCROLL = ['itineraire', 'activites', 'outils'];
  const scrollMem = {};
  let current = null;
  let firstRoute = true;

  /* ---------- Navigation ---------- */
  let lastHash = '#/';
  function handleRoute() {
    // Ancre interne (#programme, #main…) : on fait défiler sans changer de page
    const h = location.hash;
    if (h && !h.startsWith('#/')) {
      history.replaceState(null, '', lastHash);
      const t = document.getElementById(decodeURIComponent(h.slice(1)));
      if (t) { t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); if (t.id === 'main') t.focus({ preventScroll: true }); }
      return;
    }
    lastHash = h || '#/';
    if (current) scrollMem[current] = window.scrollY;
    const prev = current;
    J.route = J.parseHash();
    const seg = J.route.parts[0] || '';
    const name = VIEW_OF[seg] || 'home';
    if (prev && prev !== name) J.views[prev]?.leave?.();
    current = name;

    $$('.view').forEach((v) => (v.hidden = v.dataset.view !== name));
    const view = J.views[name];
    const el = $(`[data-view="${name}"]`);
    if (view) view.render(J.route);
    else el.innerHTML = `<div class="wrap page-head"><p class="section-label">${TITLES[name]}</p><h1 class="page-title">Bientôt <em>ici</em></h1><p class="page-sub">Cette section arrive à l’étape suivante de la refonte.</p></div>`;

    const navKey = name === 'jour' ? 'itineraire' : name;
    $$('[data-nav]').forEach((a) => (a.dataset.nav === navKey ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    document.body.classList.toggle('is-map', name === 'carte');
    document.body.classList.toggle('is-home', name === 'home');
    updateTodayFab();
    document.title = `${(view?.title && view.title(J.route)) || TITLES[name]} — Japon 2026`;

    if (!J.route.query.has('a') && !(name === 'jour' && seg === 'aujourdhui')) {
      const y = prev !== name && KEEP_SCROLL.includes(name) ? scrollMem[name] || 0 : 0;
      if (prev !== name || name === 'jour' || name === 'home') window.scrollTo({ top: y, behavior: 'instant' });
    }
    onScroll();
    if (!firstRoute) $('#main').focus({ preventScroll: true });
    firstRoute = false;
  }
  J.rerender = () => {
    const v = current && J.views[current];
    if (v) (v.update || v.render).call(v, J.route);
    updateTodayFab();
  };

  function updateTodayFab() {
    const t = J.todayDay();
    const onToday = current === 'jour' && (J.route.parts[0] === 'aujourdhui' || (t && +J.route.parts[1] === t.id));
    document.body.classList.toggle('is-today', !!onToday);
  }

  function onScroll() {
    const atHero = current === 'home' && window.scrollY < Math.max(40, window.innerHeight * 0.55);
    document.body.classList.toggle('at-hero', atHero);
  }

  /* ---------- Thème ---------- */
  function effectiveTheme() {
    const forced = document.documentElement.dataset.theme;
    if (forced) return forced;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function syncThemeUI() {
    const t = effectiveTheme();
    const label = t === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre';
    $('#themeToggle').setAttribute('aria-label', label);
    $('#themeToggle').title = label;
    $$('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', t === 'dark' ? '#0d111c' : '#f6f1e7'));
  }
  J.setTheme = (t) => {
    if (t) { document.documentElement.dataset.theme = t; J.store.set('theme', t); }
    else { delete document.documentElement.dataset.theme; J.store.remove('theme'); }
    syncThemeUI();
    J.emit('theme');
  };


  /* ---------- Bannière : fichiers de données modifiés depuis les modifications locales ---------- */
  function showFilesChangedBanner() {
    const b = $('#banner');
    b.innerHTML = `<div class="banner-inner">
      <p><b>Les fichiers de données ont changé</b> depuis tes modifications faites dans le site. Lesquelles garder ?</p>
      <button class="btn" type="button" data-banner="files">Utiliser les fichiers</button>
      <button class="btn" type="button" data-banner="keep">Garder mes modifications</button>
    </div>`;
    b.hidden = false;
  }

  /* ---------- Événements globaux ---------- */
  function bindGlobal() {
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('scroll', onScroll, { passive: true });
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', syncThemeUI);

    $('#themeToggle').addEventListener('click', () => J.setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark'));

    $('#banner').addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-banner]');
      if (!btn) return;
      if (btn.dataset.banner === 'files') {
        if (!(await J.confirm('Tes modifications locales seront remplacées par le contenu des fichiers JSON.', { ok: 'Utiliser les fichiers' }))) return;
        J.discardEdits(); J.toast('Contenu rechargé depuis les fichiers');
      } else { J.keepEdits(); J.toast('Modifications locales conservées'); }
      $('#banner').hidden = true;
    });

    // Fermeture de la modale en touchant le fond
    $('#modal').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

    // Visionneuse photo
    const lb = $('#lightbox');
    const closeLb = () => { lb.hidden = true; $('img', lb).removeAttribute('src'); };
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('.lightbox-close')) closeLb(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

    document.addEventListener('click', async (e) => {
      const ph = e.target.closest('[data-photo]');
      if (ph) {
        const [actId, i] = ph.dataset.photo.split(':');
        const act = J.idx.act.get(+actId)?.act;
        const list = act ? await J.actPhotos(act) : [];
        if (list[+i]) J.openPhoto(list[+i].src, list[+i].name);
      }
    });

    // Cases « fait » : synchronisées partout où l'activité apparaît
    document.addEventListener('change', async (e) => {
      const cb = e.target.closest('[data-done]');
      if (cb) {
        const id = +cb.dataset.done;
        J.done.set(id, cb.checked);
        $$(`[data-done="${id}"]`).forEach((x) => { x.checked = cb.checked; x.closest('.tl-item, .act-card')?.classList.toggle('is-done', cb.checked); });
        return;
      }
      const up = e.target.closest('[data-addphoto]');
      if (up && up.files.length) {
        const id = up.dataset.addphoto;
        const n = await J.photos.add(id, up.files);
        up.value = '';
        if (n) J.toast(n > 1 ? `${n} photos ajoutées` : 'Photo ajoutée');
        $$(`[data-gallery="${id}"]`).forEach((g) => J.fillGallery(g, id));
      }
    });

    J.on('change', () => J.rerender());
  }

  /* ---------- Démarrage ---------- */
  async function boot() {
    const bootEl = $('#boot');
    const fail = (html) => { bootEl.classList.add('is-error'); $('#bootMsg').innerHTML = html; };
    if (location.protocol === 'file:') {
      fail(`Ce site lit ses données dans le dossier <code>data/</code> : il doit être ouvert via une adresse <code>http://</code>.<br>
        Dans le dossier du site, lance <code>python -m http.server 8000</code> puis ouvre <code>http://localhost:8000</code>,
        ou publie le dossier sur un hébergement statique (GitHub Pages, Netlify…).`);
      return;
    }
    try { await J.loadData(); } catch (err) {
      fail(`Impossible de charger le programme.<br><small>${J.esc(err.message)}</small>`);
      return;
    }
    bootEl.remove();
    syncThemeUI();
    bindGlobal();
    handleRoute();
    if (J.filesChanged) showFilesChangedBanner();
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* hors-ligne indisponible, sans gravité */ });
    }
  }
  boot();
})();
