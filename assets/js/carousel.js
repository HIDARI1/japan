/* Japon 2026 — carrousel d'activités (idée de l'ami, reprise dans le design du site) :
   une grande carte par activité, photo en couverture, compteur + segments, précédent/suivant,
   flèches du clavier, glisser du doigt, dépôt de photos par glisser-déposer. */
'use strict';
(function () {
  const J = window.J;
  const { esc } = J;
  const idx = new Map();    // jour -> activité affichée (index dans l'ordre horaire)
  const cover = new Map();  // activité -> photo de couverture choisie
  const CAT_KANJI = { visite: '観', repas: '食', transport: '駅', hotel: '宿', activite: '遊', shopping: '買', nature: '森', soiree: '夜', autre: '旅' };
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- Préférence d'affichage : carrousel ou liste ---------- */
  J.viewMode = () => J.store.get('vue', 'carrousel');
  J.viewModeHTML = () => {
    const m = J.viewMode();
    return `<div class="viewmode" role="group" aria-label="Affichage des activités">
      <button type="button" data-viewmode="carrousel" aria-pressed="${m === 'carrousel'}">${J.icon('cards')} Carrousel</button>
      <button type="button" data-viewmode="liste" aria-pressed="${m === 'liste'}">${J.icon('list')} Liste</button>
    </div>`;
  };
  J.activitiesHTML = (day) => (J.viewMode() === 'carrousel' ? J.carouselHTML(day) : J.timelineHTML(day));

  /* ---------- Index de départ : l'activité en cours le jour J, sinon la première ---------- */
  function current(day) {
    const acts = J.sortedActs(day);
    if (!acts.length) return 0;
    if (!idx.has(day.id)) {
      const st = J.nowState(day);
      const target = st.now || st.next;
      idx.set(day.id, target ? acts.indexOf(target) : 0);
    }
    const i = Math.min(acts.length - 1, Math.max(0, idx.get(day.id)));
    idx.set(day.id, i);
    return i;
  }
  J.carouselFocus = (dayId, actId) => {
    const day = J.day(dayId);
    if (!day) return;
    const i = J.sortedActs(day).findIndex((a) => a.id === +actId);
    if (i > -1) idx.set(day.id, i);
  };

  function cardHTML(a, day, st, anim) {
    const cat = J.cat(a.categorie);
    const done = J.done.is(a.id);
    const step = a.etape != null ? J.idx.step.get(a.etape)?.step : null;
    const addr = J.actAddress(a, day);
    const isNow = st.now && st.now.id === a.id;
    const isNext = st.next && st.next.id === a.id;
    const place = J.hasCoords(step) ? step : (addr ? { adresse: addr } : null);
    return `<article class="acard${done ? ' is-done' : ''}${anim ? ' slide-' + anim : ''}" id="card-${a.id}" data-card="${a.id}" style="--cat:${esc(cat.couleur)}">
      <div class="acard-hero" data-drop="${a.id}">
        <div class="acard-media c-${esc(a.ville)}" data-media="${a.id}">
          <div class="acard-ph">${J.art.city(a.ville)}<span class="acard-kj" aria-hidden="true">${CAT_KANJI[a.categorie] || '旅'}</span></div>
        </div>
        <div class="acard-shade" aria-hidden="true"></div>
        <div class="acard-top">
          <span class="acard-time">${esc(a.heure || '—')}</span>
          ${isNow ? '<span class="tl-flag">Maintenant</span>' : ''}${isNext ? '<span class="tl-flag next">Ensuite</span>' : ''}
          <div class="acard-tools">
            <label class="hbtn" title="Ajouter des photos">${J.icon('camera')}<span class="sr-only">Ajouter des photos à ${esc(a.nom)}</span><input class="sr-only" type="file" accept="image/*" multiple data-addphoto="${a.id}"></label>
            <button class="hbtn" type="button" data-act-edit="${a.id}" title="Modifier" aria-label="Modifier ${esc(a.nom)}">${J.icon('edit')}</button>
            <button class="hbtn hbtn-danger" type="button" data-act-del="${a.id}" title="Supprimer" aria-label="Supprimer ${esc(a.nom)}">${J.icon('trash')}</button>
          </div>
        </div>
        <div class="acard-bottom">
          <div class="acard-titleblock">
            <div class="acard-badges">
              <span class="atag">${cat.emoji} ${esc(cat.label)}</span>
              ${J.isReserved(a) ? '<span class="atag res">Réservé</span>' : ''}
              ${done ? '<span class="atag ok">✓ Terminée</span>' : ''}
            </div>
            <h3 class="acard-title">${esc(a.nom)}</h3>
          </div>
          <div class="acard-thumbs" data-thumbs="${a.id}"></div>
        </div>
      </div>
      <div class="acard-body">
        <div class="acard-main">
          ${a.description ? `<p class="acard-desc">${esc(a.description)}</p>` : '<p class="acard-desc is-empty">Pas encore de description — touche ✎ pour en ajouter une.</p>'}
          <div class="acard-addr">
            ${J.icon('pin')}
            <div>
              <div class="acard-label">Adresse</div>
              ${addr ? `<div class="acard-addr-text">${esc(addr)}</div>` : '<div class="acard-addr-text is-empty">Adresse non renseignée</div>'}
              ${place ? `<div class="acard-links">
                <a href="${esc(J.gmapsPlace(place))}" target="_blank" rel="noopener">Ouvrir dans Google Maps</a>
                <a href="${esc(J.gmapsTo(place))}" target="_blank" rel="noopener">Y aller</a>
                ${J.hasCoords(step) ? `<a href="#/carte?jour=${day.id}&etape=${step.id}">Voir sur la carte</a>` : ''}
              </div>` : ''}
            </div>
          </div>
        </div>
        <aside class="acard-info">
          <h4>Infos importantes</h4>
          ${a.notes ? `<p>${esc(a.notes)}</p>` : '<p class="is-empty">Aucune info particulière.</p>'}
          <div class="acard-facts">
            <span class="fact cost">${+a.cout > 0 ? esc(J.eur(a.cout)) : 'Budget : —'}</span>
            ${J.cityChip(a.ville)}
          </div>
        </aside>
      </div>
      <div class="acard-foot">
        <label class="done-toggle">${J.checkHTML(a.id, done, `Marquer « ${a.nom} » comme terminée`)}<span>Marquer comme terminée</span></label>
      </div>
    </article>`;
  }

  J.carouselHTML = (day, { anim = '' } = {}) => {
    const acts = J.sortedActs(day);
    if (!acts.length) return `<div class="acar" data-acar="${day.id}"><div class="empty"><strong>Aucune activité</strong>Ajoute-en une avec le bouton ci-dessous.</div></div>`;
    const i = current(day);
    const st = J.nowState(day);
    return `<section class="acar" data-acar="${day.id}" role="region" aria-roledescription="carrousel" aria-label="Activités du J${J.dayIndex(day.id) + 1}">
      <div class="acar-head">
        <div class="acar-count" aria-live="polite"><b>${pad(i + 1)}</b><span>/ ${pad(acts.length)}</span></div>
        <div class="acar-segs">
          ${acts.map((x, j) => `<button type="button" class="seg${j === i ? ' is-current' : ''}${J.done.is(x.id) ? ' is-done' : ''}${st.now && st.now.id === x.id ? ' is-now' : ''}" data-car-seg="${day.id}:${j}" title="${esc((x.heure ? x.heure + ' · ' : '') + x.nom)}" aria-label="Activité ${j + 1} : ${esc(x.nom)}" ${j === i ? 'aria-current="true"' : ''}></button>`).join('')}
        </div>
      </div>
      <div class="acar-stage">${cardHTML(acts[i], day, st, anim)}</div>
      <div class="acar-ctrl">
        <button class="acar-btn prev" type="button" data-car-nav="${day.id}:-1" ${i === 0 ? 'disabled' : ''}>${J.icon('left')} Précédent</button>
        <button class="acar-btn next" type="button" data-car-nav="${day.id}:1" ${i === acts.length - 1 ? 'disabled' : ''}>Suivant ${J.icon('right')}</button>
      </div>
      <p class="acar-hint">Astuce : flèches ← → du clavier, ou glisse la carte du doigt.</p>
    </section>`;
  };

  /* ---------- Photos : couverture, miniatures, visionneuse ---------- */
  async function paint(root) {
    for (const media of J.$$('[data-media]', root)) {
      const id = +media.dataset.media;
      const info = J.idx.act.get(id);
      if (!info) continue;
      const list = await J.actPhotos(info.act);
      const card = media.closest('.acard');
      const thumbs = J.$(`[data-thumbs="${id}"]`, root);
      if (!list.length) {
        card.classList.remove('has-photo');
        if (!J.$('.acard-cta', media)) media.insertAdjacentHTML('beforeend', `<label class="acard-cta">${J.icon('camera')} Ajouter ma photo<input type="file" accept="image/*" multiple data-addphoto="${id}" aria-label="Ajouter une photo pour ${esc(info.act.nom)}"></label>`);
        if (thumbs) thumbs.innerHTML = '';
        continue;
      }
      let c = cover.get(id) ?? 0;
      if (c < 0) c = list.length - 1;
      if (c >= list.length) c = 0;
      cover.set(id, c);
      card.classList.add('has-photo');
      media.innerHTML = `<button class="acard-img" type="button" data-photo="${id}:${c}" aria-label="Agrandir la photo"><img src="${esc(list[c].src)}" alt="${esc(info.act.nom)}" decoding="async"></button>`;
      if (thumbs) thumbs.innerHTML = list.length > 1 ? list.map((p, j) => `<button type="button" class="thumb${j === c ? ' is-on' : ''}" data-cover="${id}:${j}" aria-label="Photo ${j + 1}"><img src="${esc(p.src)}" alt="" loading="lazy"></button>`).join('') : '';
    }
  }
  J.mountCarousels = (root) => paint(root);

  function refresh(dayId, anim) {
    const day = J.day(dayId);
    J.$$(`[data-acar="${dayId}"]`).forEach((el) => {
      const focusNav = document.activeElement && el.contains(document.activeElement) ? document.activeElement.dataset.carNav : null;
      el.outerHTML = J.carouselHTML(day, { anim });
      const nel = J.$(`[data-acar="${dayId}"]`);
      paint(nel);
      if (focusNav) J.$(`[data-car-nav="${focusNav}"]:not([disabled])`, nel)?.focus();
    });
  }
  function go(dayId, to) {
    const day = J.day(dayId);
    if (!day) return;
    const n = J.sortedActs(day).length;
    const cur = current(day);
    if (to < 0 || to >= n || to === cur) return;
    idx.set(day.id, to);
    refresh(day.id, to > cur ? 'next' : 'prev');
  }

  /* ---------- Interactions ---------- */
  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-car-nav]');
    const seg = e.target.closest('[data-car-seg]');
    const cv = e.target.closest('[data-cover]');
    const vm = e.target.closest('[data-viewmode]');
    if (nav) { const [d, delta] = nav.dataset.carNav.split(':').map(Number); go(d, current(J.day(d)) + delta); }
    else if (seg) { const [d, j] = seg.dataset.carSeg.split(':').map(Number); go(d, j); }
    else if (cv) { const [id, j] = cv.dataset.cover.split(':').map(Number); cover.set(id, j); paint(cv.closest('.acar') || document); }
    else if (vm) { J.store.set('vue', vm.dataset.viewmode); J.rerender(); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const t = e.target instanceof Element ? e.target : null;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !['checkbox', 'file'].includes(t.type)) return;
    if ((t && t.closest('[data-slider], .fc-strip, .leaflet-container')) || J.$('#modal').open || !J.$('#lightbox').hidden) return;
    const car = J.$$('.view:not([hidden]) [data-acar]').find((c) => { const r = c.getBoundingClientRect(); return r.bottom > 60 && r.top < innerHeight - 60; });
    if (!car) return;
    e.preventDefault();
    const d = +car.dataset.acar;
    go(d, current(J.day(d)) + (e.key === 'ArrowRight' ? 1 : -1));
  });

  let sx = 0, sy = 0, sday = null;
  document.addEventListener('touchstart', (e) => {
    const st = e.target.closest && e.target.closest('.acar-stage');
    if (!st || e.target.closest('input, .acard-thumbs, .acard-tools')) { sday = null; return; }
    sday = +st.closest('[data-acar]').dataset.acar;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (sday == null) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) go(sday, current(J.day(sday)) + (dx < 0 ? 1 : -1));
    sday = null;
  }, { passive: true });

  /* Glisser-déposer des photos sur la carte */
  document.addEventListener('dragover', (e) => { const z = e.target.closest && e.target.closest('[data-drop]'); if (z) { e.preventDefault(); z.classList.add('is-drag'); } });
  document.addEventListener('dragleave', (e) => { const z = e.target.closest && e.target.closest('[data-drop]'); if (z) z.classList.remove('is-drag'); });
  document.addEventListener('drop', async (e) => {
    const z = e.target.closest && e.target.closest('[data-drop]');
    if (!z) return;
    e.preventDefault();
    z.classList.remove('is-drag');
    const files = Array.from(e.dataTransfer?.files || []).filter((f) => /^image\//.test(f.type));
    if (!files.length) return;
    const n = await J.photos.add(z.dataset.drop, files);
    if (n) J.toast(n > 1 ? `📷 ${n} photos ajoutées` : '📷 Photo ajoutée');
  });

  /* Mises à jour ciblées */
  J.on('done', ({ id }) => { const info = J.idx.act.get(id); if (info && J.$(`[data-acar="${info.day.id}"]`)) refresh(info.day.id); });
  // Après un ajout de photo : la dernière photo devient la couverture
  J.on('photos', (actId) => {
    if (actId != null) cover.set(+actId, -1);
    J.$$('.view:not([hidden]) [data-acar]').forEach((c) => paint(c));
  });
})();
