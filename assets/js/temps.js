/* Japon 2026 — temps de trajet et durées de visite
   Trajets : estimés d'après la distance entre les lieux de la carte (à pied, vélo ou transports),
   remplacés par tes notes quand elles donnent un temps. Durées sur place : data/durees.json. */
'use strict';
(function () {
  const J = window.J;
  const { esc } = J;
  const T = (J.temps = {});

  const MODES = {
    walking: { label: 'à pied', emoji: '🚶', gmaps: 'walking' },
    cycling: { label: 'à vélo', emoji: '🚲', gmaps: 'bicycling' },
    transit: { label: 'en transports', emoji: '🚆', gmaps: 'transit' },
  };
  const SOURCES = { notes: '📝 tes notes', planning: '📅 horaires du planning', estimation: '≈ estimation', defaut: '≈ estimation', perso: '✎ ta durée', calcul: '≈ calculé sur la carte' };
  T.MODES = MODES;
  T.SOURCES = SOURCES;

  /* ---------- Formats ---------- */
  T.dur = (m) => {
    m = Math.round(m);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${h} h ${String(r).padStart(2, '0')}` : `${h} h`;
  };
  T.range = (a, b) => {
    if (Math.round(a) === Math.round(b)) return `≈ ${T.dur(a)}`;
    if (b < 60) return `${Math.round(a)}–${Math.round(b)} min`;
    return `${T.dur(a)} – ${T.dur(b)}`;
  };
  T.clock = (m) => { m = ((Math.round(m) % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
  const round5 = (x) => Math.max(5, Math.round(x / 5) * 5);
  const km = (x) => (x < 1 ? `${Math.round(x * 100) * 10} m` : `${x.toFixed(1).replace('.', ',')} km`);

  /* ---------- Données ---------- */
  const cfg = () => J.data.durees?.reglages || { marcheKmH: 4.5, veloKmH: 13, transportsKmH: 24, accesTransportsMin: 12, detour: 1.3, seuilMarcheKm: 1.2 };
  T.info = (a) => (J.data.durees?.activites || {})[a.id] || {};
  T.duree = (a) => {
    const i = T.info(a);
    if (Array.isArray(i.duree)) return { min: i.duree[0], max: i.duree[1], source: i.source || 'estimation', texte: i.texte || '' };
    const d = (J.data.durees?.parDefaut || {})[a.categorie] || [45, 90];
    return { min: d[0], max: d[1], source: 'defaut', texte: '' };
  };
  T.pos = (a, day) => {
    const step = a.etape != null ? J.idx.step.get(a.etape)?.step : null;
    if (J.hasCoords(step)) return { lat: step.lat, lon: step.lon, nom: a.nom };
    const p = (J.data.durees?.positions || {})[a.id];
    if (p) return { lat: p[0], lon: p[1], nom: a.nom, approx: true };
    if (a.categorie === 'hotel' && day.nuit) { const h = J.idx.hotel.get(day.nuit); if (J.hasCoords(h)) return { lat: h.lat, lon: h.lon, nom: h.nom }; }
    return null;
  };
  const dist = (p, q) => {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (q.lat - p.lat) * rad, dLon = (q.lon - p.lon) * rad;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(p.lat * rad) * Math.cos(q.lat * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  };
  T.gmaps = (from, to, mode) => 'https://www.google.com/maps/dir/?api=1&' + new URLSearchParams({
    origin: `${from.lat},${from.lon}`, destination: `${to.lat},${to.lon}`, travelmode: (MODES[mode] || MODES.transit).gmaps,
  });

  /* Trajet estimé entre deux points */
  T.leg = (from, to, forced) => {
    const c = cfg();
    const d = dist(from, to);
    const road = d * c.detour;
    let mode = forced || (d <= c.seuilMarcheKm ? 'walking' : 'transit');
    let m;
    if (mode === 'walking') m = (road / c.marcheKmH) * 60;
    else if (mode === 'cycling') m = (road / c.veloKmH) * 60 + 3;
    else m = c.accesTransportsMin + (road / c.transportsKmH) * 60;
    return { mode, km: d, min: round5(m * 0.85), max: round5(m * 1.2), source: 'calcul', from, to, gmaps: T.gmaps(from, to, mode) };
  };

  /* ---------- Une journée : trajets, durées, créneaux ---------- */
  T.day = (day) => {
    const i = J.dayIndex(day.id);
    const prev = J.data.jours[i - 1];
    const startHotel = prev && prev.nuit ? J.idx.hotel.get(prev.nuit) : null;
    let P = J.hasCoords(startHotel) ? { lat: startHotel.lat, lon: startHotel.lon, nom: startHotel.nom, hotel: true } : null;
    const items = [];
    J.sortedActs(day).forEach((a) => {
      const info = T.info(a);
      const L = T.pos(a, day);
      let leg = null;
      if (Array.isArray(info.acces)) {
        leg = { mode: info.accesMode || 'transit', min: info.acces[0], max: info.acces[1], source: info.accesSource || 'notes', texte: info.accesTexte || '', from: P, to: L };
        if (P && L) leg.gmaps = T.gmaps(P, L, leg.mode);
      } else if (a.categorie !== 'transport' && P && L && dist(P, L) > 0.08) {
        leg = T.leg(P, L, info.accesMode);
      }
      items.push({ a, t: J.timeToMin(a.heure), d: T.duree(a), info, pos: L, leg });
      if (Array.isArray(info.arrivee)) P = { lat: info.arrivee[0], lon: info.arrivee[1], nom: a.nom };
      else if (L) P = L;
      else if (a.categorie === 'transport') P = null; // ex. Shinkansen : on ne sait pas où l'on est ensuite
    });
    // Retour au logement le soir
    let back = null;
    const hotel = day.nuit ? J.idx.hotel.get(day.nuit) : null;
    const last = items[items.length - 1];
    if (P && !P.hotel && J.hasCoords(hotel) && last && last.a.categorie !== 'hotel' && dist(P, hotel) > 0.08) {
      back = T.leg(P, { lat: hotel.lat, lon: hotel.lon, nom: hotel.nom }, null);
    }
    // Créneaux : temps entre une activité et la suivante, comparé à durée + trajet
    const timed = items.filter((x) => x.t != null);
    timed.forEach((x, k) => {
      const nx = timed[k + 1];
      if (x.info.sansCreneau) return;
      if (!nx) { x.end = [x.t + x.d.min, x.t + x.d.max]; return; }
      let slot = nx.t - x.t;
      if (slot < 0) slot += 1440;
      const legNext = nx.leg || { min: 0, max: 0 };
      const needMin = x.d.min + legNext.min, needMax = x.d.max + legNext.max;
      x.slot = slot;
      x.status = slot >= needMax ? 'large' : slot >= needMin ? 'juste' : 'serre';
      x.libre = slot - needMax;
      x.manque = needMin - slot;
    });
    const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
    const visits = items.filter((x) => x.a.categorie !== 'transport' && !x.info.sansCreneau);
    const travelActs = items.filter((x) => x.a.categorie === 'transport' && !x.info.sansCreneau);
    const legs = items.filter((x) => x.leg).map((x) => x.leg).concat(back ? [back] : []);
    const first = timed.find((x) => !x.info.sansCreneau) || timed[0];
    const lastT = [...timed].reverse().find((x) => !x.info.sansCreneau);
    return {
      day, items, back,
      visite: [sum(visits, (x) => x.d.min), sum(visits, (x) => x.d.max)],
      trajet: [sum(legs, (l) => l.min) + sum(travelActs, (x) => x.d.min), sum(legs, (l) => l.max) + sum(travelActs, (x) => x.d.max)],
      libre: sum(timed, (x) => (x.status === 'large' ? x.libre : 0)),
      serres: timed.filter((x) => x.status === 'serre').length,
      debut: first ? first.t : null,
      fin: lastT ? lastT.t + lastT.d.max + (back ? back.max : 0) : null,
    };
  };

  /* Index rapide pour la page jour : trajet pour venir + durée par activité */
  T.forAct = (a, day) => {
    const r = T.day(day);
    return r.items.find((x) => x.a.id === a.id) || null;
  };

  /* ---------- Petits morceaux réutilisés (page jour, carrousel) ---------- */
  T.legText = (leg) => {
    if (!leg) return '';
    const m = MODES[leg.mode] || MODES.transit;
    return `${m.emoji} ${T.range(leg.min, leg.max)} ${m.label}${leg.km != null ? ` · ${km(leg.km)}` : ''}`;
  };
  T.legHTML = (leg, { cls = 'leg' } = {}) => {
    if (!leg) return '';
    const from = leg.from && leg.from.nom ? ` depuis ${esc(leg.from.nom)}` : '';
    return `<div class="${cls}">
      <span class="leg-main">${esc(T.legText(leg))}</span><span class="leg-from">${from}</span>
      <span class="leg-src">${esc(SOURCES[leg.source] || '')}</span>
      ${leg.texte ? `<span class="leg-note">${esc(leg.texte)}</span>` : ''}
      ${leg.gmaps ? `<a class="leg-link" href="${esc(leg.gmaps)}" target="_blank" rel="noopener">Horaires exacts ↗</a>` : ''}
    </div>`;
  };
  T.durChip = (d) => (d.max > 0 ? `<span class="dur-chip" title="${esc(SOURCES[d.source] || '')}">⏱ ${esc(T.range(d.min, d.max))}</span>` : '');

  /* ---------- Frise de la journée ---------- */
  function ganttHTML(r) {
    const timed = r.items.filter((x) => x.t != null && !x.info.sansCreneau);
    if (!timed.length) return '';
    const starts = timed.map((x) => x.t - (x.leg ? x.leg.max : 0));
    const ends = timed.map((x) => x.t + x.d.max).concat(r.fin != null ? [r.fin] : []);
    const a = Math.floor(Math.min(...starts) / 60) * 60;
    const b = Math.min(a + 24 * 60, Math.ceil(Math.max(...ends) / 60) * 60);
    const span = Math.max(60, b - a);
    const pct = (m) => ((m - a) / span) * 100;
    const ticks = [];
    for (let h = a; h <= b; h += 60) ticks.push(`<span class="g-tick" style="left:${pct(h)}%">${T.clock(h).slice(0, 2)}h</span>`);
    const blocks = timed.map((x) => {
      const c = J.cat(x.a.categorie);
      const leg = x.leg ? `<span class="g-leg" style="left:${pct(x.t - x.leg.max)}%;width:${(x.leg.max / span) * 100}%" title="${esc(T.legText(x.leg))}"></span>` : '';
      const w = Math.max(0.8, (((x.d.min + x.d.max) / 2) / span) * 100);
      return `${leg}<span class="g-block${x.status === 'serre' ? ' is-tight' : ''}${x.a.categorie === 'transport' ? ' is-move' : ''}" style="left:${pct(x.t)}%;width:${w}%;--cat:${esc(c.couleur)}" title="${esc(`${x.a.heure} · ${x.a.nom} · ${T.range(x.d.min, x.d.max)}`)}"></span>`;
    }).join('');
    const back = r.back && r.fin != null ? `<span class="g-leg" style="left:${pct(r.fin - r.back.max)}%;width:${(r.back.max / span) * 100}%" title="Retour au logement ${esc(T.legText(r.back))}"></span>` : '';
    return `<div class="gantt" role="img" aria-label="Frise de la journée de ${T.clock(a)} à ${T.clock(b)}">
      <div class="g-track">${blocks}${back}</div><div class="g-axis">${ticks.join('')}</div>
    </div>`;
  }

  function dayDetailHTML(day) {
    const r = T.day(day);
    const i = J.dayIndex(day.id);
    const statusHTML = (x) => {
      if (x.info.sansCreneau || x.status == null) return x.end ? `<span class="slot">fin vers ${T.clock(x.end[1])}</span>` : '';
      if (x.status === 'large') return `<span class="slot ok">✓ créneau ${T.dur(x.slot)}${x.libre >= 15 ? ` · ≈ ${T.dur(x.libre)} de libre` : ''}</span>`;
      if (x.status === 'juste') return `<span class="slot just">✓ créneau ${T.dur(x.slot)} · juste</span>`;
      return `<span class="slot tight">⚠ créneau ${T.dur(x.slot)} · il manque ≈ ${T.dur(x.manque)}</span>`;
    };
    const rows = r.items.map((x) => `
      ${x.leg ? `<li class="tt-leg">${T.legHTML(x.leg)}</li>` : ''}
      <li class="tt-act" style="--cat:${esc(J.cat(x.a.categorie).couleur)}">
        <time>${esc(x.a.heure || '—')}</time>
        <div class="tt-body">
          <a class="tt-name" href="#/jour/${day.id}?a=${x.a.id}">${J.cat(x.a.categorie).emoji} ${esc(x.a.nom)}</a>
          <div class="tt-meta">
            ${x.d.max > 0 ? `<span class="tt-dur">⏱ ${x.a.categorie === 'transport' ? 'trajet' : 'sur place'} ${esc(T.range(x.d.min, x.d.max))}</span>` : ''}
            <span class="tt-src">${esc(SOURCES[x.d.source] || '')}</span>
            ${statusHTML(x)}
          </div>
          ${x.d.texte ? `<p class="tt-note">${esc(x.d.texte)}</p>` : ''}
        </div>
      </li>`).join('');
    const prevNight = J.data.jours[i - 1]?.nuit;
    const startHotel = prevNight ? J.idx.hotel.get(prevNight) : null;
    return `<article class="card tt-day c-${esc(J.dayColorCity(day))}" id="tt-${day.id}">
      <header class="tt-head">
        <div class="day-kicker"><span class="day-num">J${i + 1}</span><span class="day-date">${esc(J.fmt.full(J.dayDate(i)))}</span>${J.dayCities(day).map(J.cityChip).join('')}</div>
        <h2 class="tt-title">${esc(J.dayLabel(day))}</h2>
        <div class="tt-pills">
          ${r.debut != null ? `<span class="pill">Début ${T.clock(r.debut)}</span>` : ''}
          ${r.fin != null ? `<span class="pill">Fin de journée ≈ ${T.clock(r.fin)}</span>` : ''}
          ${r.trajet[1] > 0 ? `<span class="pill">🚆 Trajets ${esc(T.range(r.trajet[0], r.trajet[1]))}</span>` : ''}
          ${r.visite[1] > 0 ? `<span class="pill">⏱ Sur place ${esc(T.range(r.visite[0], r.visite[1]))}</span>` : ''}
          ${r.libre >= 15 ? `<span class="pill ok">☕ ≈ ${T.dur(r.libre)} de marge</span>` : ''}
          ${r.serres ? `<span class="pill tight">⚠ ${J.plural(r.serres, 'créneau serré', 'créneaux serrés')}</span>` : ''}
        </div>
      </header>
      ${ganttHTML(r)}
      <ol class="tt-list">
        ${startHotel ? `<li class="tt-hotel">🏨 Départ : ${esc(startHotel.nom)}</li>` : ''}
        ${rows}
        ${r.back ? `<li class="tt-leg">${T.legHTML({ ...r.back, from: null })}<span class="leg-from">retour au logement</span></li>` : ''}
        ${day.nuit ? `<li class="tt-hotel">🏨 Nuit : ${esc(J.idx.hotel.get(day.nuit)?.nom || '')}</li>` : ''}
      </ol>
      <div class="btn-row"><a class="btn btn-sm" href="#/jour/${day.id}">Voir la journée</a><a class="btn btn-sm btn-ghost" href="#/carte?jour=${day.id}">${J.icon('map')} Carte du jour</a></div>
    </article>`;
  }

  /* ---------- Vue « Temps » ---------- */
  let sel = null;
  J.views.temps = {
    title: () => 'Temps de trajet',
    render(route) {
      const el = J.$('[data-view="temps"]');
      const jours = J.data.jours;
      const q = +route.query.get('jour');
      if (q && J.day(q)) sel = q;
      if (!sel || !J.day(sel)) sel = (J.tripPhase() === 'pendant' && J.todayDay()?.id) || jours[0].id;
      const all = jours.map((d) => T.day(d));
      const tot = (k, j) => all.reduce((s, r) => s + r[k][j], 0);
      const serres = all.reduce((s, r) => s + r.serres, 0);
      el.innerHTML = `
        <div class="wrap page-head">
          <p class="section-label">Temps</p>
          <h1 class="page-title">Trajets & durées, <em>jour par jour</em></h1>
          <p class="page-sub">Combien de temps pour aller d’une activité à l’autre, combien de temps rester sur place, et s’il reste de la marge. Touche un jour pour le détail.</p>
        </div>
        <div class="wrap">
          <div class="tt-kpis reveal">
            <div class="kpi"><div class="v">≈ ${esc(T.dur(Math.round((tot('trajet', 0) + tot('trajet', 1)) / 2 / 30) * 30))}</div><div class="l">de trajets sur place (hors vols)</div></div>
            <div class="kpi"><div class="v">≈ ${esc(T.dur(Math.round((tot('visite', 0) + tot('visite', 1)) / 2 / 30) * 30))}</div><div class="l">de visites au total</div></div>
            <div class="kpi"><div class="v">${serres}</div><div class="l">${serres > 1 ? 'créneaux serrés' : 'créneau serré'}</div></div>
          </div>
          <details class="card tt-help">
            <summary>Comment sont calculés les temps ?</summary>
            <p>Trajets : distance entre les lieux de la carte, à pied jusqu’à ${String(cfg().seuilMarcheKm).replace('.', ',')} km (${String(cfg().marcheKmH).replace('.', ',')} km/h), sinon en transports (≈ ${cfg().accesTransportsMin} min d’accès et d’attente + ${cfg().transportsKmH} km/h), à vélo le jour de la location. Quand tes notes donnent un temps, c’est lui qui est utilisé (📝). Le lien « Horaires exacts » ouvre Google Maps pour l’horaire réel.</p>
            <p>Durées sur place : 📝 tirées de tes notes quand elles existent, sinon ≈ durée habituelle pour ce type de visite. Tout se modifie avec ✎ sur l’activité, ou dans <code>data/durees.json</code>.</p>
            <p>Créneau : temps entre une activité et la suivante. ✓ si la visite et le trajet y tiennent, ⚠ s’il manque du temps.</p>
          </details>
          <div class="table-wrap card tt-overview">
            <table class="table">
              <thead><tr><th>Jour</th><th>Programme</th><th class="num">Trajets</th><th class="num">Sur place</th><th class="num">Marge</th><th></th></tr></thead>
              <tbody>${all.map((r, k) => `<tr class="${r.day.id === sel ? 'is-sel' : ''}" data-tt-day="${r.day.id}">
                <td><a href="#/temps?jour=${r.day.id}">J${k + 1}</a><div class="muted nowrap" style="font-size:.78rem">${esc(J.fmt.short(J.dayDate(k)))}</div></td>
                <td>${esc(J.dayLabel(r.day))}</td>
                <td class="num nowrap">${esc(T.range(r.trajet[0], r.trajet[1]))}</td>
                <td class="num nowrap">${esc(T.range(r.visite[0], r.visite[1]))}</td>
                <td class="num nowrap">${r.libre >= 15 ? esc(T.dur(r.libre)) : '—'}</td>
                <td>${r.serres ? `<span class="slot tight">⚠ ${r.serres}</span>` : ''}</td>
              </tr>`).join('')}</tbody>
            </table>
          </div>
          <nav class="day-strip tt-strip" aria-label="Choisir un jour">${jours.map((d, k) => `<a class="ds-item c-${esc(J.dayColorCity(d))}" href="#/temps?jour=${d.id}" ${d.id === sel ? 'aria-current="page"' : ''}><b>J${k + 1}</b><span>${esc(J.fmt.d(J.dayDate(k)))}</span></a>`).join('')}</nav>
          <div id="ttDetail" class="fx-blurin">${dayDetailHTML(J.day(sel))}</div>
        </div>`;
      J.$('.tt-overview tbody', el).addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const tr = e.target.closest('[data-tt-day]');
        if (tr) location.hash = `#/temps?jour=${tr.dataset.ttDay}`;
      });
      const cur = J.$('.tt-strip [aria-current]', el);
      if (cur) cur.parentElement.scrollLeft = cur.offsetLeft - cur.parentElement.clientWidth / 2;
      J.fx.all(el);
      if (q) requestAnimationFrame(() => J.$('#ttDetail', el)?.scrollIntoView({ block: 'start' }));
    },
    update(route) { const y = window.scrollY; this.render(route); window.scrollTo(0, y); },
  };
})();
