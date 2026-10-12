/* Japon 2026 — itinéraire : composants de journée, frise des 16 jours, page d'un jour */
'use strict';
(function () {
  const J = window.J;
  const { esc } = J;

  /* ================= Composants partagés ================= */
  J.cityChip = (id) => `<span class="city-chip c-${esc(id)}">${esc(J.city(id).nom)}</span>`;
  J.catTag = (a) => { const c = J.cat(a.categorie); return `<span class="tag" style="--cat:${esc(c.couleur)}">${c.emoji} ${esc(c.label)}</span>`; };
  J.dayCost = (day) => day.activites.reduce((s, a) => s + (+a.cout || 0), 0);
  J.dayDone = (day) => day.activites.filter((a) => J.done.is(a.id)).length;

  /* « Maintenant / ensuite » : seulement pour la journée en cours */
  J.nowState = (day) => {
    if (J.dayISO(day) !== J.todayISO()) return {};
    const t = J.now();
    const m = t.getHours() * 60 + t.getMinutes();
    let now = null, next = null;
    J.sortedActs(day).forEach((a) => {
      const am = J.timeToMin(a.heure);
      if (am == null) return;
      if (am <= m) now = a; else if (!next) next = a;
    });
    return { now, next };
  };

  J.activityItemHTML = (a, day, st = {}) => {
    const cat = J.cat(a.categorie);
    const done = J.done.is(a.id);
    const step = a.etape != null ? J.idx.step.get(a.etape)?.step : null;
    const placed = step && J.hasCoords(step);
    const addr = J.actAddress(a, day);
    const isNow = st.now && st.now.id === a.id;
    const isNext = st.next && st.next.id === a.id;
    return `<li class="tl-item${done ? ' is-done' : ''}${isNow ? ' is-now' : ''}${isNext ? ' is-next' : ''}" id="a-${a.id}" style="--cat:${esc(cat.couleur)}">
      <div class="tl-time">${esc(a.heure || '—')}</div>
      <span class="tl-node" aria-hidden="true"></span>
      <article class="tl-card hover-line">
        <div class="tl-head">${J.checkHTML(a.id, done, `Marquer « ${a.nom} » comme fait`)}<h3 class="tl-name">${esc(a.nom)}</h3>${+a.cout > 0 ? `<span class="cost">${J.eur(a.cout)}</span>` : ''}</div>
        <div class="tl-meta">${isNow ? '<span class="tl-flag">Maintenant</span>' : ''}${isNext ? '<span class="tl-flag next">Ensuite</span>' : ''}${J.isReserved(a) ? '<span class="badge-reserved">Réservé</span>' : ''}${J.catTag(a)}${J.cityChip(a.ville)}</div>
        ${a.description ? `<p class="tl-desc">${esc(a.description)}</p>` : ''}
        ${a.notes ? `<p class="tl-notes">${esc(a.notes)}</p>` : ''}
        ${J.actAddress(a, day) ? `<p class="tl-addr">${J.icon('pin')}<span>${esc(J.actAddress(a, day))}</span></p>` : ''}
        <div class="gallery" data-gallery="${a.id}"></div>
        <div class="tl-actions">
          ${placed ? `<a class="ibtn" href="#/carte?jour=${day.id}&etape=${step.id}" title="Voir sur la carte" aria-label="Voir ${esc(a.nom)} sur la carte">${J.icon('pin')}</a>` : ''}
          ${placed || addr ? `<a class="ibtn" href="${esc(J.gmapsTo(placed ? step : { adresse: addr }))}" target="_blank" rel="noopener" title="Itinéraire (Google Maps)" aria-label="Itinéraire vers ${esc(a.nom)} dans Google Maps">${J.icon('route')}</a>` : ''}
          <label class="ibtn" title="Ajouter des photos">${J.icon('camera')}<span class="sr-only">Ajouter des photos à ${esc(a.nom)}</span><input class="sr-only" type="file" accept="image/*" multiple data-addphoto="${a.id}"></label>
          <span class="tl-actions-sp"></span>
          <button class="ibtn" type="button" data-act-edit="${a.id}" title="Modifier" aria-label="Modifier ${esc(a.nom)}">${J.icon('edit')}</button>
          <button class="ibtn ibtn-danger" type="button" data-act-del="${a.id}" title="Supprimer" aria-label="Supprimer ${esc(a.nom)}">${J.icon('trash')}</button>
        </div>
      </article>
    </li>`;
  };

  J.fillGalleries = (root) => J.$$('[data-gallery]', root).forEach((g) => J.fillGallery(g, g.dataset.gallery));

  J.timelineHTML = (day) => {
    const st = J.nowState(day);
    const acts = J.sortedActs(day);
    if (!acts.length) return '<div class="empty"><strong>Aucune activité</strong>Ajoute-en une avec le bouton ci-dessous.</div>';
    return `<ol class="timeline">${acts.map((a) => J.activityItemHTML(a, day, st)).join('')}</ol>`;
  };

  J.dayHeadHTML = (day, { tag = 'h2', stepper = false } = {}) => {
    const i = J.dayIndex(day.id);
    const prev = J.data.jours[i - 1], next = J.data.jours[i + 1];
    const hotel = day.nuit ? J.idx.hotel.get(day.nuit) : null;
    const cost = J.dayCost(day);
    const isToday = J.dayISO(day) === J.todayISO();
    return `<header class="day-head c-${esc(J.dayColorCity(day))}">
      <div class="day-kicker">
        <span class="day-num">J${i + 1}</span>
        <span class="day-date">${esc(J.fmt.full(J.dayDate(i)))}</span>
        ${isToday ? '<span class="td-today">Aujourd’hui</span>' : ''}
        ${J.dayCities(day).map(J.cityChip).join('')}
      </div>
      <${tag} class="day-title">${esc(J.dayLabel(day))}</${tag}>
      <div class="day-tally">
        <span class="pill"><span><b data-tally-done="${day.id}">${J.dayDone(day)}</b>/${day.activites.length} faites</span></span>
        ${cost ? `<span class="pill"><span class="cost">${esc(J.eur(cost))}</span> estimés</span>` : ''}
        ${hotel ? `<span class="pill">🏨 ${esc(hotel.nom)}</span>` : ''}
        <button class="ibtn" type="button" data-day-edit="${day.id}" title="Renommer ou supprimer ce jour" aria-label="Renommer ou supprimer ce jour">${J.icon('edit')}</button>
        ${stepper ? `<span class="day-stepper">
          ${prev ? `<a class="ibtn" href="#/jour/${prev.id}" title="Jour précédent" aria-label="Jour précédent">${J.icon('left')}</a>` : ''}
          ${next ? `<a class="ibtn" href="#/jour/${next.id}" title="Jour suivant" aria-label="Jour suivant">${J.icon('right')}</a>` : ''}
        </span>` : ''}
      </div>
    </header>`;
  };

  J.notesHTML = (day) => `<div class="card info-card notes-card">
      <h3><span class="kj" aria-hidden="true">記</span> Notes du jour <span class="save-hint" data-saved="${day.id}" aria-live="polite"></span></h3>
      <textarea class="notes-input" data-day-notes="${day.id}" rows="3" placeholder="Infos pratiques, météo, conseils…" aria-label="Notes du jour">${esc(day.notes || '')}</textarea>
    </div>`;

  J.addActHTML = (day) => `<button class="btn btn-sm add-act" type="button" data-day-add="${day.id}">${J.icon('plus')} Ajouter une activité</button>`;

  /* Agrandit les zones de notes à la taille du texte */
  J.autoGrow = (root) => J.$$('.notes-input', root).forEach((t) => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; });

  /* ================= Vue : itinéraire complet ================= */
  J.views.itineraire = {
    title: () => 'Itinéraire',
    render() {
      const el = J.$('[data-view="itineraire"]');
      const d = J.data;
      const today = J.todayISO();
      const start = J.dayDate(0), end = J.dayDate(d.jours.length - 1);
      el.innerHTML = `
        <div class="wrap page-head">
          <p class="section-label">Itinéraire</p>
          <h1 class="page-title">${d.jours.length} jours, <em>de Paris à Tokyo</em></h1>
          <p class="page-sub">Du ${esc(J.fmt.full(start))} ${start.getFullYear()} au ${esc(J.fmt.full(end))} ${end.getFullYear()}. Touche un jour pour voir son programme heure par heure.</p>
        </div>
        <div class="wrap">
          <div class="reveal">${J.routeLineHTML()}</div>
          <div class="card rhythm-card reveal">
            <div class="rhythm-head"><h2>Rythme du voyage</h2><span class="muted">activités par jour</span></div>
            <div class="rhythm-wrap" id="rhythmWrap"></div>
          </div>
          <ol class="trip-days">
            ${d.jours.map((day, i) => {
              const c = J.dayColorCity(day);
              const iso = J.dayISO(day);
              const dt = J.dayDate(i);
              const hotel = day.nuit ? J.idx.hotel.get(day.nuit) : null;
              const doneN = J.dayDone(day);
              const cost = J.dayCost(day);
              return `<li class="trip-day c-${esc(c)}${iso === today ? ' is-today' : ''}${iso < today ? ' is-past' : ''} reveal">
                <div class="td-date"><span class="td-wd">${esc(J.fmt.wd(dt))}</span><span class="td-d">${esc(J.fmt.d(dt))}</span><span class="td-m">${esc(J.fmt.m(dt))}</span></div>
                <span class="td-node" aria-hidden="true"></span>
                <a class="td-card hover-line" href="#/jour/${day.id}">
                  <div class="td-top"><span class="td-num">J${i + 1}</span>${iso === today ? '<span class="td-today">Aujourd’hui</span>' : ''}${J.dayCities(day).map(J.cityChip).join('')}</div>
                  <h2 class="td-title">${esc(J.dayLabel(day))}</h2>
                  <ul class="td-acts">
                    ${J.sortedActs(day).map((a) => `<li class="${J.done.is(a.id) ? 'is-done' : ''}"><time>${esc(a.heure || '—')}</time><span aria-hidden="true">${J.cat(a.categorie).emoji}</span><span>${esc(a.nom)}</span></li>`).join('') || '<li class="muted">Aucune activité</li>'}
                  </ul>
                  <div class="td-meta">
                    <span>${J.plural(day.activites.length, 'activité', 'activités')}</span>
                    ${cost ? `<span class="sep"></span><span class="cost">${esc(J.eur(cost))}</span>` : ''}
                    ${hotel ? `<span class="sep"></span><span>🏨 ${esc(hotel.nom)}</span>` : ''}
                    ${doneN ? `<span class="sep"></span><span>${doneN}/${day.activites.length} faites <span class="progress"><span style="width:${Math.round((doneN / Math.max(1, day.activites.length)) * 100)}%"></span></span></span>` : ''}
                  </div>
                </a>
              </li>`;
            }).join('')}
          </ol>
          <div class="trip-add"><button class="btn btn-sm" type="button" data-add-day>${J.icon('plus')} Ajouter un jour</button></div>
        </div>`;
      this.chart();
      J.fx.all(el);
    },
    chart() {
      const wrap = J.$('#rhythmWrap');
      if (!wrap) return;
      wrap.innerHTML = J.art.rhythmChart(wrap.clientWidth || 340);
      J.fx.draw(wrap);
    },
  };
  let rz = null;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (!J.$('[data-view="itineraire"]').hidden) { J.views.itineraire.chart(); J.$('#rhythmWrap .fx-draw')?.classList.add('is-drawn'); } }, 200); });

  /* ================= Vue : une journée ================= */
  function stepsHTML(day) {
    const r = J.idx.route.get(day.id);
    if (!r || !r.etapes.length) return '<p class="muted">Pas de trajet enregistré pour ce jour.</p>';
    let n = 0;
    return `<ol class="steps c-${esc(J.dayColorCity(day))}">${r.etapes.map((s) => {
      const label = s.type === 'hotel' ? '宿' : ++n;
      return `<li><span class="n${s.type === 'hotel' ? ' hotel' : ''}" aria-hidden="true">${label}</span><div><div class="nm">${esc(s.nom)}</div><div class="ad">${esc(s.adresse || '')}${J.hasCoords(s) ? '' : ' · <em>position à préciser</em>'}</div></div></li>`;
    }).join('')}</ol>`;
  }

  J.views.jour = {
    title(route) { const d = this.resolve(route).day; return d ? `J${J.dayIndex(d.id) + 1} · ${J.dayLabel(d)}` : 'Programme du jour'; },
    resolve(route) {
      if (route.parts[0] !== 'aujourdhui') return { day: J.day(route.parts[1]) };
      const phase = J.tripPhase();
      const jours = J.data.jours;
      if (phase === 'pendant') return { day: J.todayDay() || jours[0], live: true };
      if (phase === 'avant') {
        const days = Math.round((J.parseISODate(J.data.voyage.dateDepart) - J.parseISODate(J.todayISO())) / 864e5);
        return { day: jours[0], intro: days > 0 ? `Le voyage commence dans <b>${J.plural(days, 'jour', 'jours')}</b>. En attendant, voici le programme du J1 : une fois sur place, ce bouton ouvrira directement la journée en cours.` : 'C’est le jour du départ ! Voici le programme du J1.' };
      }
      return { day: jours[jours.length - 1], intro: 'Le voyage est terminé — voici la dernière journée.' };
    },
    render(route) {
      const el = J.$('[data-view="jour"]');
      const { day, intro, live } = this.resolve(route);
      if (day && route.query.get('a')) J.carouselFocus(day.id, route.query.get('a'));
      if (!day) {
        el.innerHTML = '<div class="wrap page-head"><h1 class="page-title">Jour introuvable</h1><p class="page-sub"><a href="#/itineraire">Retour à l’itinéraire</a></p></div>';
        return;
      }
      const jours = J.data.jours;
      const i = J.dayIndex(day.id);
      const prev = jours[i - 1], next = jours[i + 1];
      const todayISO = J.todayISO();
      const hotel = day.nuit ? J.idx.hotel.get(day.nuit) : null;
      const r = J.idx.route.get(day.id);
      const st = J.nowState(day);

      el.innerHTML = `
        <div class="day-strip-wrap"><nav class="day-strip" aria-label="Jours du voyage">
          ${jours.map((d, k) => `<a class="ds-item c-${esc(J.dayColorCity(d))}${J.dayISO(d) === todayISO ? ' is-today' : ''}" href="#/jour/${d.id}" ${d.id === day.id ? 'aria-current="page"' : ''}><b>J${k + 1}</b><span>${esc(J.fmt.d(J.dayDate(k)))}</span></a>`).join('')}
        </nav></div>
        <div class="wrap day-wrap fx-blurin">
          ${intro ? `<div class="intro-card">${intro}</div>` : ''}
          ${J.dayHeadHTML(day, { tag: 'h1', stepper: true })}
          ${st.now || st.next ? `<div class="now-card"><span class="lbl">En ce moment</span>
            ${st.now ? `<div class="now-row"><time>${esc(st.now.heure)}</time><span>${esc(st.now.nom)}</span></div>` : ''}
            ${st.next ? `<div class="now-row"><time>${esc(st.next.heure)}</time><span>Ensuite : ${esc(st.next.nom)}</span></div>` : ''}</div>` : ''}
          <div class="day-grid">
            <div class="day-main" id="dayMain">
              <div class="acts-bar"><h2 class="acts-title">${J.plural(day.activites.length, 'activité', 'activités')}</h2>${J.viewModeHTML()}</div>
              ${J.activitiesHTML(day)}
              <div class="add-row">${J.addActHTML(day)}</div>
              <nav class="day-nav" aria-label="Jours voisins">
                ${prev ? `<a class="prev" href="#/jour/${prev.id}"><span class="lbl">← J${i}</span><span class="t">${esc(J.dayLabel(prev))}</span></a>` : '<span></span>'}
                ${next ? `<a class="next" href="#/jour/${next.id}"><span class="lbl">J${i + 2} →</span><span class="t">${esc(J.dayLabel(next))}</span></a>` : ''}
              </nav>
            </div>
            <aside class="day-aside">
              ${J.notesHTML(day)}
              ${hotel ? `<div class="card info-card hover-line"><h3><span class="kj" aria-hidden="true">宿</span> Logement de la nuit</h3>
                <p><b>${esc(hotel.nom)}</b></p><p class="addr">${esc(hotel.adresse)}</p>
                <div class="btn-row"><button class="btn btn-xs" type="button" data-copy="${esc(hotel.adresse)}">${J.icon('copy')} Copier l’adresse</button>
                <a class="btn btn-xs" href="${esc(J.gmapsTo(hotel))}" target="_blank" rel="noopener">${J.icon('route')} Y aller</a></div></div>` : ''}
              <div class="card info-card hover-line"><h3><span class="kj" aria-hidden="true">道</span> Trajet du jour</h3>
                ${stepsHTML(day)}
                <div class="btn-row">
                  <a class="btn btn-xs" href="#/carte?jour=${day.id}">${J.icon('map')} Voir sur la carte</a>
                  ${r && r.etapes.length ? `<a class="btn btn-xs" href="${esc(J.gmapsRoute(r.etapes))}" target="_blank" rel="noopener">${J.icon('ext')} Google Maps</a>` : ''}
                </div>
              </div>
            </aside>
          </div>
        </div>`;

      J.fillGalleries(el);
      J.mountCarousels(el);
      J.autoGrow(el);
      J.fx.all(el);
      const cur = J.$('.ds-item[aria-current]', el);
      if (cur) { const s = cur.parentElement; s.scrollLeft = cur.offsetLeft - s.clientWidth / 2 + cur.clientWidth / 2; }
      const qa = route.query.get('a');
      const target = qa ? (J.$(`#a-${qa}`, el) || J.$('.acar', el)) : (live && (J.$('.tl-item.is-now', el) || J.$('.tl-item.is-next', el) || J.$('.acar', el)));
      if (target) requestAnimationFrame(() => { target.scrollIntoView({ block: 'center' }); target.classList.add('is-flash'); });
      bindSwipe(J.$('#dayMain', el), prev, next);
    },
  };

  function bindSwipe(zone, prev, next) {
    if (!zone) return;
    let x0 = null, y0 = null;
    zone.addEventListener('touchstart', (e) => {
      if (e.target.closest('input, textarea, .gallery, .tl-actions, .acar')) { x0 = null; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    zone.addEventListener('touchend', (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 80 && Math.abs(dy) < 50) {
        const to = dx < 0 ? next : prev;
        if (to) location.hash = `#/jour/${to.id}`;
      }
      x0 = null;
    });
  }

  /* ================= Actions (délégation, valables partout) ================= */
  document.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-act-edit], [data-act-del], [data-day-add], [data-day-edit], [data-add-day], [data-copy]');
    if (!t) return;
    if (t.dataset.actEdit) J.editor.activity({ id: +t.dataset.actEdit });
    else if (t.dataset.dayAdd) J.editor.activity({ dayId: +t.dataset.dayAdd });
    else if (t.dataset.dayEdit) J.editor.day(+t.dataset.dayEdit);
    else if (t.hasAttribute('data-add-day')) J.editor.addDay();
    else if (t.dataset.copy) J.copy(t.dataset.copy);
    else if (t.dataset.actDel) {
      const info = J.idx.act.get(+t.dataset.actDel);
      if (!info) return;
      if (!(await J.confirm(`Supprimer « ${info.act.nom} » ?`, { title: 'Supprimer l’activité', ok: 'Supprimer' }))) return;
      info.day.activites = info.day.activites.filter((a) => a.id !== info.act.id);
      J.commit(`🗑️ ${info.act.nom} supprimée`);
    }
  });

  // Notes du jour : enregistrées automatiquement pendant la frappe
  const timers = {};
  document.addEventListener('input', (e) => {
    const ta = e.target.closest('[data-day-notes]');
    if (!ta) return;
    J.autoGrow(ta.parentElement);
    const id = +ta.dataset.dayNotes;
    clearTimeout(timers[id]);
    timers[id] = setTimeout(() => {
      const day = J.day(id);
      if (!day) return;
      day.notes = ta.value;
      J.commit(null, { silent: true });
      J.$$(`[data-saved="${id}"]`).forEach((s) => { s.textContent = '✓ enregistré'; setTimeout(() => (s.textContent = ''), 1600); });
    }, 600);
  });

  // Compteurs « x/y faites » mis à jour quand on coche
  J.on('done', ({ id }) => {
    const info = J.idx.act.get(id);
    if (!info) return;
    J.$$(`[data-tally-done="${info.day.id}"]`).forEach((b) => (b.textContent = J.dayDone(info.day)));
  });
})();
