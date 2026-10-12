/* Japon 2026 — noyau : utilitaires, données, état perso, routeur, modales */
'use strict';
(function () {
  const J = (window.J = {});

  /* ---------- DOM & texte ---------- */
  J.$ = (sel, root = document) => root.querySelector(sel);
  J.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  J.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  J.norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  J.plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  J.clone = clone;

  /* ---------- Stockage local (tolérant : navigation privée, quota…) ---------- */
  const PREFIX = 'japon.v2.';
  J.store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(PREFIX + key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; } catch {
        J.toast('Stockage local indisponible : la modification ne sera pas conservée', 'error'); return false;
      }
    },
    remove(key) { try { localStorage.removeItem(PREFIX + key); } catch { /* rien */ } },
  };

  /* ---------- Événements internes ---------- */
  const handlers = {};
  J.on = (ev, fn) => (handlers[ev] = handlers[ev] || []).push(fn);
  J.emit = (ev, payload) => (handlers[ev] || []).forEach((fn) => fn(payload));

  /* ---------- Dates & formats ---------- */
  // ?now=2026-12-24T12:00 dans l'URL permet de simuler une date (aperçu du mode Jour J)
  J.now = () => {
    const forced = new URLSearchParams(location.search).get('now');
    const d = forced ? new Date(forced) : null;
    return d && !isNaN(d) ? d : new Date();
  };
  J.parseISODate = (iso) => { const [y, m, d] = String(iso).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  J.isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  J.todayISO = () => J.isoDate(J.now());
  const dtf = (o) => new Intl.DateTimeFormat('fr-FR', o);
  const F = {
    wd: dtf({ weekday: 'short' }), d: dtf({ day: 'numeric' }), m: dtf({ month: 'short' }),
    mid: dtf({ weekday: 'short', day: 'numeric', month: 'short' }),
    full: dtf({ weekday: 'long', day: 'numeric', month: 'long' }),
    short: dtf({ day: 'numeric', month: 'short' }),
    year: dtf({ day: 'numeric', month: 'short', year: 'numeric' }),
  };
  J.fmt = {
    wd: (d) => F.wd.format(d).replace('.', ''),
    d: (d) => F.d.format(d),
    m: (d) => F.m.format(d).replace('.', ''),
    mid: (d) => F.mid.format(d),
    full: (d) => F.full.format(d),
    short: (d) => F.short.format(d),
    year: (d) => F.year.format(d),
  };
  J.timeToMin = (t) => { if (!t || !/^\d{1,2}:\d{2}/.test(t)) return null; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const eur0 = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const eur2 = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const jpy = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'JPY', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 });
  J.eur = (n) => (Number.isInteger(+n) ? eur0 : eur2).format(+n || 0);
  J.yen = (n) => jpy.format(Math.round(+n || 0));

  /* ---------- Données ---------- */
  J.FILES = ['voyage', 'villes', 'categories', 'hebergements', 'jours', 'trajets', 'checklist'];
  J.EDITABLE = ['voyage', 'hebergements', 'jours', 'trajets'];
  J.data = null;
  let base = null;
  let baseHash = '';
  J.filesChanged = false;

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  }

  J.loadData = async () => {
    const texts = await Promise.all(J.FILES.map(async (f) => {
      const res = await fetch(`data/${f}.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Fichier data/${f}.json introuvable (${res.status})`);
      return res.text();
    }));
    base = {};
    J.FILES.forEach((f, i) => {
      try { base[f] = JSON.parse(texts[i]); } catch (e) { throw new Error(`data/${f}.json n’est pas un JSON valide : ${e.message}`); }
    });
    baseHash = hash(texts.join('\u0000'));
    J.data = clone(base);
    const edits = J.store.get('edits', null);
    if (edits && edits.files) {
      J.EDITABLE.forEach((f) => { if (edits.files[f] !== undefined) J.data[f] = edits.files[f]; });
      J.filesChanged = edits.baseHash !== baseHash;
    }
    J.reindex();
  };

  /* Index de recherche rapide, recalculé après chaque modification */
  J.idx = {};
  J.reindex = () => {
    const d = J.data;
    const idx = { day: new Map(), act: new Map(), step: new Map(), route: new Map(), city: new Map(), cat: new Map(), hotel: new Map() };
    d.villes.forEach((v) => idx.city.set(v.id, v));
    d.categories.forEach((c) => idx.cat.set(c.id, c));
    d.hebergements.forEach((h) => idx.hotel.set(h.id, h));
    d.jours.forEach((day, i) => {
      idx.day.set(day.id, { day, index: i });
      day.activites.forEach((a) => idx.act.set(a.id, { act: a, day, index: i }));
    });
    d.trajets.forEach((r) => {
      idx.route.set(r.jour, r);
      r.etapes.forEach((s) => idx.step.set(s.id, { step: s, route: r }));
    });
    J.idx = idx;
  };

  J.day = (id) => J.idx.day.get(+id)?.day || null;
  J.dayIndex = (id) => J.idx.day.get(+id)?.index ?? -1;
  J.dayDate = (dayOrIndex) => {
    const i = typeof dayOrIndex === 'number' ? dayOrIndex : J.dayIndex(dayOrIndex.id);
    const d = J.parseISODate(J.data.voyage.dateDepart);
    d.setDate(d.getDate() + i);
    return d;
  };
  J.dayISO = (day) => J.isoDate(J.dayDate(day));
  J.dayLabel = (day) => {
    const t = day.titre || '';
    const i = t.indexOf(' — ');
    return (i > -1 ? t.slice(i + 3) : t) || 'Jour sans titre';
  };
  J.sortedActs = (day) => day.activites
    .map((a, i) => ({ a, i }))
    .sort((x, y) => {
      const tx = J.timeToMin(x.a.heure), ty = J.timeToMin(y.a.heure);
      if (tx == null && ty == null) return x.i - y.i;
      if (tx == null) return 1;
      if (ty == null) return -1;
      return tx - ty || x.i - y.i;
    })
    .map((o) => o.a);
  J.dayCities = (day) => {
    const out = [];
    day.activites.forEach((a) => { if (a.ville && a.ville !== 'trajet' && !out.includes(a.ville)) out.push(a.ville); });
    return out.length ? out : ['trajet'];
  };
  J.dayColorCity = (day) => day.nuit || J.dayCities(day)[0];
  J.city = (id) => J.idx.city.get(id) || { id, nom: id || '—', kanji: '' };
  J.cat = (id) => J.idx.cat.get(id) || J.idx.cat.get('autre') || { id, label: id, emoji: '📌', couleur: '#888' };
  J.isReserved = (a) => /^RÉSERVÉ(?![\p{L}])/u.test(a.notes || '');
  J.lastDayISO = () => J.dayISO(J.data.jours[J.data.jours.length - 1]);
  J.todayDay = () => { const iso = J.todayISO(); return J.data.jours.find((d) => J.dayISO(d) === iso) || null; };
  J.tripPhase = () => {
    const now = J.now();
    const dep = new Date(J.data.voyage.depart?.dateHeure || J.data.voyage.dateDepart);
    if (now < dep) return 'avant';
    if (J.todayISO() > J.lastDayISO()) return 'apres';
    return 'pendant';
  };

  /* ---------- Modifications locales (calque par-dessus les JSON) ---------- */
  J.commit = (msg, { silent = false } = {}) => {
    const files = {};
    J.EDITABLE.forEach((f) => (files[f] = J.data[f]));
    // Identique aux fichiers ? alors rien n'est « modifié »
    if (J.EDITABLE.every((f) => JSON.stringify(files[f]) === JSON.stringify(base[f]))) J.store.remove('edits');
    else J.store.set('edits', { baseHash, savedAt: Date.now(), files });
    J.reindex();
    if (!silent) J.emit('change');
    if (msg) J.toast(msg);
  };
  J.editsInfo = () => J.store.get('edits', null);
  J.discardEdits = () => {
    J.store.remove('edits');
    J.data = clone(base);
    J.filesChanged = false;
    J.reindex();
    J.emit('change');
  };
  J.keepEdits = () => { const e = J.editsInfo(); if (e) { e.baseHash = baseHash; J.store.set('edits', e); } J.filesChanged = false; };
  J.editedFiles = () => {
    const e = J.editsInfo();
    if (!e) return [];
    return J.EDITABLE.filter((f) => JSON.stringify(e.files[f]) !== JSON.stringify(base[f]));
  };
  J.fileJSON = (f) => JSON.stringify(J.data[f], null, 2) + '\n';
  J.nextActId = () => Math.max(0, ...J.data.jours.flatMap((d) => d.activites.map((a) => a.id))) + 1;
  J.nextDayId = () => Math.max(0, ...J.data.jours.map((d) => d.id)) + 1;
  J.nextStepId = () => Math.max(0, ...J.data.trajets.flatMap((r) => r.etapes.map((s) => s.id))) + 1;

  /* ---------- État personnel (jamais écrit dans les JSON) ---------- */
  J.done = {
    all: () => J.store.get('fait', {}),
    is: (id) => !!J.store.get('fait', {})[id],
    set(id, v) {
      const all = J.store.get('fait', {});
      if (v) all[id] = true; else delete all[id];
      J.store.set('fait', all);
      J.emit('done', { id, v });
    },
  };

  /* ---------- Routeur (hash) ---------- */
  J.views = {};
  J.parseHash = () => {
    const raw = decodeURI(location.hash.replace(/^#/, '')) || '/';
    const [path, q] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    return { path: '/' + parts.join('/'), parts, query: new URLSearchParams(q || '') };
  };
  J.route = J.parseHash();
  J.setQuery = (params) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== '' && v != null && v !== false) qs.set(k, v); });
    const s = qs.toString();
    history.replaceState(null, '', '#' + J.route.path + (s ? '?' + s : ''));
    J.route = J.parseHash();
  };

  /* ---------- Toasts ---------- */
  J.toast = (msg, type) => {
    const box = J.$('#toasts');
    if (!box) return;
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'error' ? ' is-error' : '');
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.textContent = msg;
    box.append(el);
    while (box.children.length > 3) box.firstElementChild.remove();
    setTimeout(() => { el.classList.add('is-out'); setTimeout(() => el.remove(), 300); }, 3200);
  };

  /* ---------- Modale générique (élément <dialog>) ---------- */
  const modal = () => J.$('#modal');
  J.openModal = ({ title, kanji = '', body, submit = 'Enregistrer', cancel = 'Annuler', danger = false, onSubmit, onOpen, wide = false, done = 'Enregistré' }) => {
    const dlg = modal();
    dlg.innerHTML = `
      <form class="modal-form" novalidate style="display:contents">
        <div class="modal-head">
          <h2 id="modalTitle">${kanji ? `<span class="kj">${J.esc(kanji)}</span> ` : ''}${J.esc(title)}</h2>
          <button class="modal-close" type="button" data-close aria-label="Fermer">✕</button>
        </div>
        <div class="modal-body">${body}</div>
        <div class="modal-foot">
          ${cancel ? `<button class="btn btn-ghost" type="button" data-close>${J.esc(cancel)}</button>` : ''}
          ${submit ? `<button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" type="submit">${J.esc(submit)}</button>` : ''}
        </div>
      </form>`;
    dlg.style.width = wide ? 'min(720px, calc(100vw - 24px))' : '';
    const form = J.$('form', dlg);
    J.$$('[data-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = J.$('button[type=submit]', form);
      // Bouton à états (japon4) : chargement → coche « Enregistré » → fermeture
      const ok = onSubmit ? (J.fx && done ? await J.fx.flow(btn, async () => onSubmit(form), { done, hold: 650 }) : await onSubmit(form)) : true;
      if (ok !== false) dlg.close('ok');
    });
    dlg.returnValue = '';
    dlg.showModal();
    if (onOpen) onOpen(dlg);
    const first = J.$('input:not([type=hidden]):not([type=file]), select, textarea', dlg);
    if (first && matchMedia('(pointer: fine)').matches) first.focus();
    return dlg;
  };
  J.confirm = (message, { title = 'Confirmer', ok = 'Confirmer', danger = true } = {}) => new Promise((resolve) => {
    const dlg = J.openModal({ title, body: `<p>${J.esc(message)}</p>`, submit: ok, danger, done: '', onSubmit: () => true });
    dlg.addEventListener('close', () => resolve(dlg.returnValue === 'ok'), { once: true });
  });

  /* ---------- Photos (IndexedDB, redimensionnées pour économiser la place) ---------- */
  let dbp = null;
  const db = () => {
    if (!('indexedDB' in window)) return Promise.resolve(null);
    if (!dbp) dbp = new Promise((res) => {
      const req = indexedDB.open('japonPhotos_v2', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('photos');
      req.onsuccess = () => res(req.result);
      req.onerror = () => res(null);
    });
    return dbp;
  };
  const tx = async (mode, fn) => {
    const d = await db();
    if (!d) return null;
    return new Promise((res, rej) => {
      const t = d.transaction('photos', mode);
      const out = fn(t.objectStore('photos'));
      t.oncomplete = () => res(out && 'result' in out ? out.result : out);
      t.onerror = () => rej(t.error);
    });
  };
  const resize = (file, max = 1600) => new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve({ name: file.name, data: c.toDataURL('image/jpeg', 0.84) });
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
  J.photos = {
    async get(actId) { try { return (await tx('readonly', (s) => s.get(String(actId)))) || []; } catch { return []; } },
    async put(actId, list) {
      try { await tx('readwrite', (s) => (list.length ? s.put(list, String(actId)) : s.delete(String(actId)))); J.emit('photos', actId); return true; }
      catch { J.toast('Impossible d’enregistrer les photos (espace insuffisant ?)', 'error'); return false; }
    },
    async add(actId, files) {
      const added = (await Promise.all(Array.from(files).map((f) => resize(f)))).filter(Boolean);
      if (!added.length) return 0;
      const list = await J.photos.get(actId);
      await J.photos.put(actId, list.concat(added));
      return added.length;
    },
    async all() {
      try {
        const d = await db(); if (!d) return {};
        return await new Promise((res, rej) => {
          const t = d.transaction('photos'); const s = t.objectStore('photos');
          const k = s.getAllKeys(), v = s.getAll();
          t.oncomplete = () => { const o = {}; k.result.forEach((key, i) => (o[key] = v.result[i])); res(o); };
          t.onerror = () => rej(t.error);
        });
      } catch { return {}; }
    },
    async clear() { try { await tx('readwrite', (s) => s.clear()); J.emit('photos'); } catch { /* rien */ } },
  };
  J.fillGallery = async (el, actId) => {
    if (!el) return;
    const list = await J.photos.get(actId);
    el.innerHTML = list.map((p, i) => `<button type="button" data-photo="${actId}:${i}" aria-label="Agrandir la photo ${i + 1}"><img src="${p.data}" alt="${J.esc(p.name || 'Photo')}" loading="lazy"></button>`).join('');
  };
  J.openPhoto = (src, alt) => {
    const lb = J.$('#lightbox');
    const img = J.$('img', lb);
    img.src = src; img.alt = alt || 'Photo agrandie';
    lb.hidden = false;
    J.$('.lightbox-close', lb).focus();
  };

  /* ---------- Liens cartes, presse-papiers, téléchargement ---------- */
  J.hasCoords = (p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lon);
  J.gmapsPlace = (p) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(J.hasCoords(p) ? `${p.lat},${p.lon}` : (p.adresse || p.nom || ''));
  J.gmapsTo = (p) => 'https://www.google.com/maps/dir/?api=1&travelmode=transit&destination=' + encodeURIComponent(J.hasCoords(p) ? `${p.lat},${p.lon}` : (p.adresse || p.nom || ''));
  J.gmapsRoute = (steps) => 'https://www.google.com/maps/dir/' + steps
    .map((s) => (J.hasCoords(s) ? `${s.lat},${s.lon}` : (s.adresse || s.nom)))
    .filter(Boolean).map(encodeURIComponent).join('/');
  J.copy = async (text) => {
    try { await navigator.clipboard.writeText(text); J.toast('Copié dans le presse-papiers'); }
    catch {
      const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select();
      try { document.execCommand('copy'); J.toast('Copié dans le presse-papiers'); } catch { J.toast('Copie impossible', 'error'); }
      ta.remove();
    }
  };
  J.download = (filename, text, type = 'application/json') => {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  /* ---------- Icônes ---------- */
  const P = {
    map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z"/><path d="M9 4v14M15 6v14"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    route: '<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4Z"/><circle cx="12" cy="13" r="3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    locate: '<circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/>',
    fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    down: '<path d="M12 4v12M6 10l6 6 6-6M4 20h16"/>',
    up: '<path d="M12 20V8M6 14l6-6 6 6M4 4h16"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    chevron: '<path d="m6 15 6-6 6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  };
  J.icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${P[name] || ''}</svg>`;

  /* ---------- Apparitions au défilement ---------- */
  let io = null;
  J.reveal = (root) => {
    const els = J.$$('.reveal:not(.is-in)', root);
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach((e) => e.classList.add('is-in')); return; }
    io = io || new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach((e) => io.observe(e));
  };

  /* Case à cocher « fait » réutilisable */
  J.checkHTML = (id, checked, label) => `
    <span class="check"><input type="checkbox" data-done="${id}" ${checked ? 'checked' : ''} aria-label="${J.esc(label)}">
    <span class="check-box"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span></span>`;
})();
