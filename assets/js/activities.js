/* Japon 2026 — activités : carrousel des expériences (japon3), recherche, filtres ville / catégorie, cartes */
'use strict';
(function () {
  const J = window.J;
  const { esc } = J;
  let st = { q: '', villes: new Set(), cats: new Set(), hide: false };

  const all = () => J.data.jours.flatMap((day) => J.sortedActs(day).map((a) => ({ a, day })));
  const hay = ({ a, day }) => {
    const c = J.cat(a.categorie);
    return J.norm([a.nom, a.notes, a.description, J.actAddress(a, day), J.dayLabel(day), day.titre, J.city(a.ville).nom, c.label, c.labelLong].join(' '));
  };
  const when = (a, day) => { const i = J.dayIndex(day.id); return `J${i + 1} · ${J.fmt.mid(J.dayDate(i))}${a.heure ? ' · ' + a.heure : ''}`; };

  function syncURL() {
    J.setQuery({ q: st.q, ville: [...st.villes].join(','), cat: [...st.cats].join(','), masquer: st.hide ? '1' : '' });
  }

  function cardHTML({ a, day }, i) {
    const c = J.cat(a.categorie);
    const done = J.done.is(a.id);
    const step = a.etape != null ? J.idx.step.get(a.etape)?.step : null;
    const long = (a.notes || '').length > 150;
    const photo = (a.photos || [])[0];
    return `<article class="act-card hover-line fx-stagger${done ? ' is-done' : ''}${photo ? ' has-cover' : ''}" style="--cat:${esc(c.couleur)};--i:${Math.min(i, 14)}">
      ${photo ? `<button class="act-cover" type="button" data-photo="${a.id}:0" aria-label="Agrandir la photo de ${esc(a.nom)}"><img src="${esc(photo)}" alt="" loading="lazy" decoding="async"></button>` : ''}
      <div class="act-top"><a class="act-when" href="#/jour/${day.id}?a=${a.id}">${esc(when(a, day))}</a>${J.cityChip(a.ville)}</div>
      <div class="act-main"><span class="act-emoji" aria-hidden="true">${c.emoji}</span><h3 class="act-name">${esc(a.nom)}</h3></div>
      ${J.isReserved(a) ? '<div class="act-badges"><span class="badge-reserved">Réservé</span></div>' : ''}
      ${a.notes ? `<p class="act-notes">${esc(a.notes)}</p>` : ''}
      ${long ? '<button class="act-more" type="button" data-more aria-expanded="false">Lire la suite</button>' : ''}
      ${a.description ? `<p class="act-desc">${esc(a.description)}</p>` : ''}
      <div class="act-foot">
        ${J.checkHTML(a.id, done, `Marquer « ${a.nom} » comme fait`)}
        ${J.catTag(a)}
        <span class="spacer"></span>
        ${+a.cout > 0 ? `<span class="cost">${esc(J.eur(a.cout))}</span>` : ''}
        ${step && J.hasCoords(step) ? `<a class="ibtn" href="#/carte?jour=${day.id}&etape=${step.id}" title="Voir sur la carte" aria-label="Voir ${esc(a.nom)} sur la carte">${J.icon('pin')}</a>` : ''}
        <button class="ibtn" type="button" data-act-edit="${a.id}" title="Modifier" aria-label="Modifier ${esc(a.nom)}">${J.icon('edit')}</button>
      </div>
    </article>`;
  }

  function carouselHTML() {
    const items = all().filter(({ a }) => a.categorie === 'activite');
    if (!items.length) return '';
    return `<section class="carousel reveal" data-carousel aria-labelledby="h-exp">
      <div class="carousel-head">
        <div>
          <span class="carousel-kicker">Expériences</span>
          <h2 id="h-exp">Les temps forts</h2>
          <p>Les ${items.length} activités 🎯 du programme, d’Osaka à Tokyo.</p>
        </div>
        <div class="owl-nav"><button class="c-prev" type="button" aria-label="Précédent">‹</button><button class="c-next" type="button" aria-label="Suivant">›</button></div>
      </div>
      <div class="carousel-track">
        ${items.map(({ a, day }) => `<a class="citem c-${esc(a.ville)}" href="#/jour/${day.id}?a=${a.id}">
          <div class="citem-art">${(a.photos || [])[0] ? `<img src="${esc(a.photos[0])}" alt="" loading="lazy" decoding="async">` : J.art.city(a.ville)}</div>
          <div class="overlay">
            <span class="pill">${esc(J.city(a.ville).nom)}</span>
            <div><h3>${esc(a.nom)}</h3><p>${esc(when(a, day))}${+a.cout > 0 ? ' · ' + esc(J.eur(a.cout)) : ''}${J.isReserved(a) ? ' · réservé' : ''}</p></div>
          </div>
        </a>`).join('')}
      </div>
    </section>`;
  }

  function results(el) {
    const tokens = J.norm(st.q).split(/\s+/).filter(Boolean);
    const list = all().filter((it) => {
      if (st.villes.size && !st.villes.has(it.a.ville)) return false;
      if (st.cats.size && !st.cats.has(it.a.categorie)) return false;
      if (st.hide && J.done.is(it.a.id)) return false;
      if (tokens.length) { const h = hay(it); return tokens.every((t) => h.includes(t)); }
      return true;
    });
    J.$('#actCount', el).textContent = list.length;
    J.$('#actGrid', el).innerHTML = list.length ? list.map(cardHTML).join('')
      : '<div class="empty" style="grid-column:1/-1"><strong>Aucune activité trouvée</strong>Essaie un autre mot ou retire un filtre.</div>';
    J.$('#actReset', el).hidden = !(st.q || st.villes.size || st.cats.size || st.hide);
    J.$$('[data-fville]', el).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fville ? st.villes.has(b.dataset.fville) : !st.villes.size)));
    J.$$('[data-fcat]', el).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fcat ? st.cats.has(b.dataset.fcat) : !st.cats.size)));
  }

  J.views.activites = {
    title: () => 'Activités',
    render(route) {
      const el = J.$('[data-view="activites"]');
      const q = route.query;
      const split = (k) => new Set((q.get(k) || '').split(',').filter(Boolean));
      st = { q: q.get('q') || '', villes: split('ville'), cats: split('cat'), hide: q.get('masquer') === '1' };
      const list = all();
      const count = (fn) => list.filter(fn).length;
      const usedCities = J.data.villes.filter((v) => list.some(({ a }) => a.ville === v.id));
      el.innerHTML = `
        <div class="wrap page-head">
          <p class="section-label">Activités</p>
          <h1 class="page-title">${list.length} activités, <em>à la carte</em></h1>
          <p class="page-sub">Cherche, filtre par ville ou par catégorie, coche ce qui est fait.</p>
        </div>
        <div class="wrap">${carouselHTML()}</div>
        <div class="filters"><div class="wrap">
          <div class="search">${J.icon('search')}<input class="input" type="search" id="actSearch" value="${esc(st.q)}" placeholder="Rechercher : temple, halal, Shibuya…" aria-label="Rechercher une activité" autocomplete="off" enterkeyhint="search"></div>
          <div class="chip-row" role="group" aria-label="Filtrer par ville">
            <button class="chip" type="button" data-fville="">Toutes les villes</button>
            ${usedCities.map((v) => `<button class="chip c-${esc(v.id)}" type="button" data-fville="${esc(v.id)}"><span class="dot"></span>${esc(v.nom)} <span class="chip-count">${count(({ a }) => a.ville === v.id)}</span></button>`).join('')}
          </div>
          <div class="chip-row" role="group" aria-label="Filtrer par catégorie">
            <button class="chip" type="button" data-fcat="">Toutes catégories</button>
            ${J.data.categories.filter((c) => list.some(({ a }) => a.categorie === c.id)).map((c) => `<button class="chip" type="button" data-fcat="${esc(c.id)}">${c.emoji} ${esc(c.label)} <span class="chip-count">${count(({ a }) => a.categorie === c.id)}</span></button>`).join('')}
          </div>
          <div class="filter-line">
            <span><b class="result-count" id="actCount">0</b> résultat(s)</span>
            <span class="btn-row" style="align-items:center">
              <label class="toggle"><input type="checkbox" id="actHide" ${st.hide ? 'checked' : ''}> Masquer les faites</label>
              <button class="btn btn-xs" type="button" id="actReset" hidden>Tout effacer</button>
            </span>
          </div>
        </div></div>
        <div class="wrap"><div class="act-grid" id="actGrid" aria-live="polite"></div></div>`;

      results(el);
      J.fx.carousel(J.$('[data-carousel]', el));
      J.fx.all(el);

      let deb = null;
      J.$('#actSearch', el).addEventListener('input', (e) => { clearTimeout(deb); deb = setTimeout(() => { st.q = e.target.value.trim(); syncURL(); results(el); }, 160); });
      J.$('#actHide', el).addEventListener('change', (e) => { st.hide = e.target.checked; syncURL(); results(el); });
      J.$('#actReset', el).addEventListener('click', () => { st = { q: '', villes: new Set(), cats: new Set(), hide: false }; J.$('#actSearch', el).value = ''; J.$('#actHide', el).checked = false; syncURL(); results(el); });
      el.querySelector('.filters').addEventListener('click', (e) => {
        const v = e.target.closest('[data-fville]'), c = e.target.closest('[data-fcat]');
        const toggle = (set, val) => { if (!val) set.clear(); else if (set.has(val)) set.delete(val); else set.add(val); };
        if (v) toggle(st.villes, v.dataset.fville);
        else if (c) toggle(st.cats, c.dataset.fcat);
        else return;
        syncURL(); results(el);
      });
      J.$('#actGrid', el).addEventListener('click', (e) => {
        const m = e.target.closest('[data-more]');
        if (!m) return;
        const card = m.closest('.act-card');
        const open = card.classList.toggle('is-open');
        m.setAttribute('aria-expanded', String(open));
        m.textContent = open ? 'Réduire' : 'Lire la suite';
      });
    },
    update(route) {
      const y = window.scrollY;
      this.render(route);
      window.scrollTo(0, y);
    },
  };
})();
