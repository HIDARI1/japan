/* Japon 2026 — accueil : hero (Tidal), programme jour par jour, slider des étapes (japon2), réservations */
'use strict';
(function () {
  const J = window.J;
  const { esc } = J;
  let timer = null;
  let sel = null; // jour affiché dans « Programme »

  /* Répartition des jours par ville (barre de route) */
  J.citySegments = () => {
    const segs = [];
    J.data.jours.forEach((day) => {
      const c = J.dayColorCity(day);
      const last = segs[segs.length - 1];
      if (last && last.city === c) last.n++; else segs.push({ city: c, n: 1 });
    });
    return segs;
  };

  /* Étapes = villes avec au moins une nuit, dans l'ordre du voyage */
  J.stages = () => {
    const out = [];
    J.data.jours.forEach((day, i) => {
      if (!day.nuit) return;
      let s = out.find((x) => x.city === day.nuit);
      if (!s) { s = { city: day.nuit, first: day, firstIndex: i, lastIndex: i, nights: 0 }; out.push(s); }
      s.nights++; s.lastIndex = i;
    });
    return out.map((s) => ({
      ...s,
      from: J.dayDate(s.firstIndex),
      to: J.dayDate(s.lastIndex + 1),
      hotel: J.data.hebergements.find((h) => h.ville === s.city || h.id === s.city) || null,
      acts: J.data.jours.reduce((n, d) => n + d.activites.filter((a) => a.ville === s.city).length, 0),
    }));
  };

  J.routeLineHTML = () => {
    const segs = J.citySegments();
    const nights = {};
    J.data.jours.forEach((d) => { if (d.nuit) nights[d.nuit] = (nights[d.nuit] || 0) + 1; });
    const legend = segs.filter((s, i, a) => a.findIndex((x) => x.city === s.city) === i)
      .map((s) => `<span class="city-chip c-${esc(s.city)}"><b>${esc(J.city(s.city).nom)}</b>${nights[s.city] ? `<span class="muted">${J.plural(nights[s.city], 'nuit', 'nuits')}</span>` : ''}</span>`).join('');
    return `<div class="route-line">
      <div class="route-line-bar" role="img" aria-label="Répartition des ${J.data.jours.length} jours par ville">
        ${segs.map((s) => `<span class="c-${esc(s.city)}" style="--n:${s.n}" title="${esc(J.city(s.city).nom)} · ${J.plural(s.n, 'jour', 'jours')}"></span>`).join('')}
      </div>
      <div class="route-line-legend">${legend}</div>
    </div>`;
  };

  /* ---------- Compte à rebours ---------- */
  const depDate = () => new Date(J.data.voyage.depart?.dateHeure || J.data.voyage.dateDepart);
  const parts = () => {
    const s = Math.max(0, Math.floor((depDate() - J.now()) / 1000));
    return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
  };
  function countdownHTML() {
    const v = J.data.voyage;
    const phase = J.tripPhase();
    if (phase === 'avant') {
      const when = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).format(depDate());
      const p = parts();
      return `<div class="cd-grid" role="timer" aria-live="off">
          ${['jours', 'heures', 'min', 's'].map((u, i) => `<div class="cd-cell"><span class="cd-num" data-cd="${i}">${i ? String(p[i]).padStart(2, '0') : p[i]}</span><span class="cd-unit">${u}</span></div>`).join('')}
        </div>
        <p class="cd-caption">avant <b>${esc(v.depart?.libelle || 'le départ')}</b> — ${esc(when)} <span class="muted">(heure de Paris)</span></p>`;
    }
    if (phase === 'pendant') {
      const day = J.todayDay() || J.data.jours[0];
      const i = J.dayIndex(day.id);
      const n = J.data.jours.length;
      return `<a class="cd-live" href="#/aujourdhui">
        <div class="cd-live-top"><span class="cd-live-day">Jour ${i + 1} <small>/ ${n}</small></span>${J.cityChip(J.dayColorCity(day))}</div>
        <div class="cd-live-title">${esc(J.dayLabel(day))}</div>
        <div class="progress" aria-hidden="true"><span style="width:${Math.round(((i + 1) / n) * 100)}%"></span></div>
      </a>`;
    }
    const last = J.data.jours[J.data.jours.length - 1];
    return `<div class="cd-live"><div class="cd-live-day">おかえり</div><div class="cd-live-title">Voyage terminé — retour le ${esc(J.fmt.full(J.dayDate(last)))}.</div></div>`;
  }
  function tick() {
    const cells = J.$$('[data-cd]');
    if (!cells.length) return;
    const p = parts();
    if (p.every((x) => x === 0)) { J.views.home.render(); return; }
    cells.forEach((c, i) => { const v = i ? String(p[i]).padStart(2, '0') : String(p[i]); if (c.textContent !== v) c.textContent = v; });
  }

  /* ---------- Programme : cartes « prévisions » (Tidal) + journée choisie ---------- */
  function fcStripHTML() {
    const jours = J.data.jours;
    const max = Math.max(...jours.map((d) => d.activites.length), 1);
    const todayISO = J.todayISO();
    return jours.map((d, i) => {
      const dt = J.dayDate(i);
      const c = J.dayColorCity(d);
      const n = d.activites.length;
      const done = J.dayDone(d);
      return `<button class="fc-card c-${esc(c)}${J.dayISO(d) === todayISO ? ' is-today' : ''}" type="button" role="tab" aria-selected="${d.id === sel}" data-pick-day="${d.id}" aria-label="J${i + 1}, ${esc(J.fmt.full(dt))} : ${esc(J.dayLabel(d))}">
        <span class="fc-day">${esc(J.fmt.wd(dt))}<br>${esc(J.fmt.d(dt))} ${esc(J.fmt.m(dt))}</span>
        <span class="fc-j">J${i + 1}</span>
        <span class="fc-kj" aria-hidden="true">${esc(J.city(c).kanji)}</span>
        <span class="fc-num">${n}<small>act.</small></span>
        <span class="fc-city">${esc(J.city(c).nom)}</span>
        <span class="fc-wave">${J.art.miniWave(n / max)}</span>
        <span class="fc-prog" aria-hidden="true"><i style="width:${n ? Math.round((done / n) * 100) : 0}%"></i></span>
      </button>`;
    }).join('');
  }
  function programHTML() {
    const day = J.day(sel) || J.data.jours[0];
    return `<div class="program-day fx-blurin" role="tabpanel">
      ${J.dayHeadHTML(day)}
      <div class="program-grid">
        <div>${J.timelineHTML(day)}<div class="add-row">${J.addActHTML(day)}<a class="btn btn-sm btn-ghost" href="#/jour/${day.id}">Ouvrir la journée ${J.icon('right')}</a></div></div>
        <div class="program-side">${J.notesHTML(day)}</div>
      </div>
    </div>`;
  }
  function pickDay(id, { focus = false } = {}) {
    sel = id;
    J.$$('[data-pick-day]').forEach((b) => b.setAttribute('aria-selected', String(+b.dataset.pickDay === id)));
    const body = J.$('#programBody');
    if (!body) return;
    body.innerHTML = programHTML();
    J.fillGalleries(body);
    J.autoGrow(body);
    J.fx.all(body);
    const card = J.$(`[data-pick-day="${id}"]`);
    if (card) { const s = card.parentElement; s.scrollTo({ left: card.offsetLeft - s.clientWidth / 2 + card.clientWidth / 2, behavior: focus ? 'smooth' : 'auto' }); }
  }

  /* ---------- Slider des étapes (japon2) ---------- */
  function sliderHTML(stages) {
    // Le 2e élément est affiché : on place la dernière étape en tête pour démarrer sur la première
    const order = stages.length > 1 ? [stages[stages.length - 1], ...stages.slice(0, -1)] : stages;
    return `<div class="slider" data-slider tabindex="0" role="region" aria-roledescription="carrousel" aria-label="Villes étapes (flèches gauche/droite)">
      <div class="slide">
        ${order.map((s) => {
          const n = stages.indexOf(s) + 1;
          const v = J.city(s.city);
          return `<div class="item c-${esc(s.city)}" data-n="${n}" role="group" aria-roledescription="diapositive" aria-label="${n} sur ${stages.length} : ${esc(v.nom)}">
            <div class="item-art">${J.art.city(s.city)}</div>
            <span class="thumb-name">${esc(v.nom)}</span>
            <div class="content">
              <div class="kanji" aria-hidden="true">${esc(v.kanji)}</div>
              <div class="name">${esc(v.nom)}</div>
              <div class="des">
                <b>${esc(J.fmt.short(s.from))} → ${esc(J.fmt.short(s.to))} · ${J.plural(s.nights, 'nuit', 'nuits')}</b><br>
                ${s.hotel ? `${esc(s.hotel.nom)}<br>` : ''}${J.plural(s.acts, 'activité', 'activités')} · ${esc(v.secteur || '')}
              </div>
              <a class="seeMore btn btn-sm" href="#/jour/${s.first.id}">Voir le programme ${J.icon('right')}</a>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="slider-btns">
        <span class="slider-count" aria-live="polite"></span>
        <button class="prev" type="button" aria-label="Étape précédente">◁</button>
        <button class="next" type="button" aria-label="Étape suivante">▷</button>
      </div>
    </div>`;
  }

  function restHTML() {
    const d = J.data;
    const stages = J.stages();
    const reserved = d.jours.flatMap((day) => day.activites.filter(J.isReserved).map((a) => ({ a, day })));
    const cl = J.checklistStats();
    return `
      <section class="section program" id="programme" aria-labelledby="h-prog">
        <div class="wrap section-head reveal">
          <p class="section-label">01 — Programme</p>
          <h2 class="section-title" id="h-prog">Jour par jour, <em>heure par heure</em></h2>
          <p class="section-intro">Choisis un jour : ses activités s’affichent juste en dessous. Coche ce qui est fait, ajoute tes photos, modifie avec ✎.</p>
        </div>
        <div class="fc-strip-wrap"><div class="fc-strip" role="tablist" aria-label="Choisir un jour">${fcStripHTML()}</div></div>
        <div class="wrap" id="programBody"></div>
      </section>

      ${J.art.divider('--bg', '--bg-2', 1)}
      <section class="section stages-sec" aria-labelledby="h-stages">
        <div class="wrap section-head reveal">
          <p class="section-label">02 — Les étapes</p>
          <h2 class="section-title" id="h-stages">${stages.length} villes, <em>une seule ligne</em></h2>
        </div>
        <div class="wrap reveal">${sliderHTML(stages)}${J.routeLineHTML()}</div>
      </section>
      ${J.art.divider('--bg-2', '--bg', 0)}

      <section class="section wrap" aria-labelledby="h-booked">
        <div class="section-head reveal">
          <p class="section-label">03 — Déjà réservé</p>
          <h2 class="section-title" id="h-booked">Les rendez-vous <em>à ne pas manquer</em></h2>
        </div>
        <div class="tickets">
          ${reserved.map(({ a, day }) => {
            const dt = J.dayDate(day);
            return `<a class="ticket hover-line reveal" href="#/jour/${day.id}?a=${a.id}">
              <div class="ticket-stub"><span class="d">${esc(J.fmt.d(dt))}</span><span class="m">${esc(J.fmt.m(dt))}</span><span class="t">${esc(a.heure || '')}</span></div>
              <div class="ticket-body">
                <span class="badge-reserved">Réservé</span>
                <h3>${esc(a.nom)}</h3>
                <p>J${J.dayIndex(day.id) + 1} · ${esc(J.fmt.full(dt))} · ${esc(J.dayLabel(day))}</p>
              </div>
            </a>`;
          }).join('') || '<p class="empty">Aucune réservation confirmée pour l’instant.</p>'}
        </div>
        <a class="card todo-teaser hover-line reveal" href="#/outils?t=checklist">
          <span class="todo-ring" style="--p:${cl.total ? Math.round((cl.done / cl.total) * 100) : 0}"><span>${cl.done}/${cl.total}</span></span>
          <span><h3>À vérifier & réserver</h3><p>Checklist tirée des notes du programme : billets, horaires, adresses à confirmer.</p></span>
          <span class="arrow" aria-hidden="true">→</span>
        </a>
      </section>`;
  }

  J.views.home = {
    el: () => J.$('[data-view="home"]'),
    render() {
      const el = this.el();
      const d = J.data;
      const v = d.voyage;
      const allActs = d.jours.flatMap((x) => x.activites);
      const budget = allActs.reduce((s, a) => s + (+a.cout || 0), 0);
      const start = J.dayDate(0), end = J.dayDate(d.jours.length - 1);
      if (sel == null || !J.day(sel)) sel = (J.tripPhase() === 'pendant' && J.todayDay()?.id) || d.jours[0].id;

      el.innerHTML = `
        <header class="hero">
          <div class="hero-art" aria-hidden="true">${J.art.heroMountain()}<div class="hero-waves" id="heroWaves"></div></div>
          <div class="hero-vert" aria-hidden="true">日本の旅</div>
          <div class="hero-inner wrap">
            <p class="eyebrow rise" style="--d:.15s"><span class="dot" aria-hidden="true"></span>${esc(v.badge)}</p>
            <h1 class="hero-title rise-blur" style="--d:.3s">${esc(v.titre)} <em>${esc(v.sousTitre)}</em></h1>
            <p class="hero-sub rise" style="--d:.55s">${esc(v.nom)} · ${esc(J.fmt.short(start))} → ${esc(J.fmt.year(end))}</p>
            <div class="hero-chips rise" style="--d:.7s">
              <div class="hchip"><b data-count="${d.jours.length}" data-delay="900">${d.jours.length}</b><span>Jours</span></div>
              <div class="hchip"><b data-count="${J.stages().length}" data-delay="900">${J.stages().length}</b><span>Villes</span></div>
              <div class="hchip"><b data-count="${allActs.length}" data-delay="900">${allActs.length}</b><span>Activités</span></div>
              <div class="hchip warm"><b data-count="${budget}" data-format="eur" data-delay="900">${esc(J.eur(budget))}</b><span>Budget estimé</span></div>
            </div>
            <div class="countdown rise" style="--d:.85s" id="countdown">${countdownHTML()}</div>
            <div class="hero-cta rise" style="--d:1s">
              <a class="btn btn-primary fx-shimmer" href="#programme">Voir le programme</a>
              <a class="btn btn-ghost" href="#/aujourdhui">今日 · Jour J</a>
            </div>
          </div>
        </header>
        <div id="homeRest">${restHTML()}</div>`;

      J.art.buildWaves(J.$('#heroWaves', el));
      // Compte à rebours qui défile au chargement (comme les compteurs du hero Tidal), puis tic-tac normal
      const p = parts();
      J.$$('[data-cd]', el).forEach((c, i) => J.fx.countUp(c, p[i], { duration: 1500, delay: 900, format: (x) => (i ? String(Math.round(x)).padStart(2, '0') : String(Math.round(x))) }));
      this.stop();
      timer = setTimeout(() => { tick(); timer = setInterval(tick, 1000); }, 2500);
      this.bind(el);
      pickDay(sel);
      J.fx.all(el);
    },
    /* Après une modification : on ne redessine que le contenu sous le hero */
    update() {
      const rest = J.$('#homeRest');
      if (!rest) return this.render();
      if (!J.day(sel)) sel = J.data.jours[0].id;
      rest.innerHTML = restHTML();
      J.$$('.reveal', rest).forEach((x) => x.classList.add('is-in'));
      this.bind(this.el());
      pickDay(sel);
      J.fx.all(rest);
    },
    bind(el) {
      J.fx.slider(J.$('[data-slider]', el));
      J.$('.fc-strip', el).addEventListener('click', (e) => {
        const b = e.target.closest('[data-pick-day]');
        if (b) pickDay(+b.dataset.pickDay, { focus: true });
      });
      J.$('.fc-strip', el).addEventListener('keydown', (e) => {
        if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
        const cards = J.$$('[data-pick-day]', el);
        const i = cards.findIndex((c) => +c.dataset.pickDay === sel);
        const n = cards[Math.min(cards.length - 1, Math.max(0, i + (e.key === 'ArrowRight' ? 1 : -1)))];
        if (n) { pickDay(+n.dataset.pickDay, { focus: true }); n.focus(); }
      });
    },
    stop() { clearTimeout(timer); clearInterval(timer); timer = null; },
    leave() { this.stop(); },
  };

  // Progression des cartes jour quand on coche une activité
  J.on('done', ({ id }) => {
    const info = J.idx.act.get(id);
    const bar = info && J.$(`[data-pick-day="${info.day.id}"] .fc-prog i`);
    if (bar) bar.style.width = Math.round((J.dayDone(info.day) / Math.max(1, info.day.activites.length)) * 100) + '%';
  });
})();
