/* Japon 2026 — carte interactive (Leaflet + OpenStreetMap, sans clé) et trajets par jour */
'use strict';
(function () {
  const J = window.J;
  const { esc } = J;
  let map = null, layer = null, meLayer = null;
  let markers = new Map();
  let dayId = null; // null = tous les lieux
  let collapsed = false;

  const MODES = { walking: '🚶 À pied', transit: '🚆 Transports', cycling: '🚲 Vélo', driving: '🚗 Voiture' };

  /* Leaflet est chargé seulement quand on ouvre la carte */
  let leafletP = null;
  const loadLeaflet = () => {
    if (window.L) return Promise.resolve();
    if (!leafletP) leafletP = new Promise((res, rej) => {
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = 'assets/vendor/leaflet/leaflet.css';
      document.head.append(css);
      const s = document.createElement('script');
      s.src = 'assets/vendor/leaflet/leaflet.js';
      s.onload = res; s.onerror = rej;
      document.head.append(s);
    });
    return leafletP;
  };

  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#c4432b';
  const routeOf = (id) => J.idx.route.get(id);
  const ensureRoute = (id) => {
    let r = routeOf(id);
    if (!r) { r = { jour: id, hebergement: '', adresseHebergement: '', etapes: [] }; J.data.trajets.push(r); J.data.trajets.sort((a, b) => J.dayIndex(a.jour) - J.dayIndex(b.jour)); J.reindex(); }
    return r;
  };
  const icon = (cls, label) => L.divIcon({ className: '', html: `<div class="mk ${cls}"><span>${label}</span></div>`, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] });

  /* ---------- Données affichées ---------- */
  function allPlaces() {
    const groups = new Map();
    const add = (p, info) => {
      if (!J.hasCoords(p)) return;
      const key = `${p.lat.toFixed(4)},${p.lon.toFixed(4)}`;
      if (!groups.has(key)) groups.set(key, { lat: p.lat, lon: p.lon, items: [], hotel: false, city: info.city });
      const g = groups.get(key);
      if (info.hotel) g.hotel = true;
      if (!g.items.some((x) => x.nom === p.nom && x.dayId === info.dayId)) g.items.push({ nom: p.nom, adresse: p.adresse, ...info });
    };
    J.data.hebergements.forEach((h) => add(h, { hotel: true, city: h.ville, dayId: null }));
    J.data.trajets.forEach((r) => {
      const day = J.day(r.jour);
      if (!day) return;
      r.etapes.forEach((s) => { if (s.type !== 'hotel') add(s, { hotel: false, city: J.dayColorCity(day), dayId: r.jour, stepId: s.id }); });
    });
    return [...groups.values()];
  }

  function popupHTML(items, p) {
    const days = [...new Set(items.filter((x) => x.dayId).map((x) => x.dayId))];
    return `<b>${esc(items[0].nom)}</b>${items.length > 1 ? `<div class="pop-meta">${items.slice(1).map((x) => esc(x.nom)).filter((n, i, a) => a.indexOf(n) === i && n !== items[0].nom).join(' · ')}</div>` : ''}
      <div class="pop-meta">${esc(items[0].adresse || '')}</div>
      ${days.length ? `<div class="pop-meta">${days.map((id) => `J${J.dayIndex(id) + 1}`).join(', ')}</div>` : ''}
      <div class="pop-actions">
        <a class="btn btn-xs" href="${esc(J.gmapsTo(p))}" target="_blank" rel="noopener">${J.icon('route')} Y aller</a>
        ${days.length ? `<a class="btn btn-xs" href="#/jour/${days[0]}">Voir le J${J.dayIndex(days[0]) + 1}</a>` : ''}
      </div>`;
  }

  /* ---------- Dessin ---------- */
  function draw({ fit = true, focus = null } = {}) {
    if (!map) return;
    layer.clearLayers();
    markers = new Map();
    const bounds = [];
    if (dayId == null) {
      allPlaces().forEach((g) => {
        const m = L.marker([g.lat, g.lon], { icon: g.hotel ? icon('hotel', '宿') : icon(`small c-${g.city}`, ''), title: g.items[0].nom, riseOnHover: true })
          .bindPopup(popupHTML(g.items, g)).addTo(layer);
        g.items.forEach((x) => x.stepId && markers.set(x.stepId, m));
        bounds.push([g.lat, g.lon]);
      });
    } else {
      const day = J.day(dayId);
      const r = routeOf(dayId);
      const steps = r ? r.etapes : [];
      const color = css('--shu');
      let n = 0, prev = null;
      steps.forEach((s) => {
        const isHotel = s.type === 'hotel';
        const label = isHotel ? '宿' : ++n;
        if (!J.hasCoords(s)) return;
        const m = L.marker([s.lat, s.lon], { icon: icon(isHotel ? 'hotel' : `c-${J.dayColorCity(day)}`, label), title: s.nom, riseOnHover: true })
          .bindPopup(popupHTML([{ nom: s.nom, adresse: s.adresse, dayId }], s)).addTo(layer);
        markers.set(s.id, m);
        if (prev) {
          L.polyline([[prev.lat, prev.lon], [s.lat, s.lon]], { color, weight: 4, opacity: 0.85, dashArray: s.mode === 'transit' ? '2 9' : null, lineCap: 'round' }).addTo(layer);
        }
        prev = s;
        bounds.push([s.lat, s.lon]);
      });
    }
    if (focus && markers.has(focus)) {
      const m = markers.get(focus);
      map.setView(m.getLatLng(), Math.max(map.getZoom(), 15));
      m.openPopup();
      m.getElement()?.querySelector('.mk')?.classList.add('is-focus');
    } else if (fit) {
      // Sur mobile, le panneau recouvre le bas de la carte : on cadre au-dessus
      const pnl = J.$('#mapPanel');
      const over = pnl && getComputedStyle(pnl).position === 'absolute' ? pnl.offsetHeight + 12 : 0;
      const opts = { paddingTopLeft: [36, 36], paddingBottomRight: [36, 36 + over], maxZoom: 15 };
      if (bounds.length) map.fitBounds(bounds.length === 1 ? [bounds[0], bounds[0]] : bounds, opts);
      else map.setView([35.2, 137.4], 6);
    }
    panel();
  }

  function panel() {
    const box = J.$('#mapPanelBody');
    if (!box) return;
    const title = J.$('#mapPanelTitle');
    if (dayId == null) {
      const places = allPlaces();
      title.textContent = `Tous les lieux · ${places.length}`;
      const cities = J.data.villes.filter((v) => v.id !== 'trajet');
      box.innerHTML = `
        <div class="legend">${cities.map((v) => J.cityChip(v.id)).join('')}<span class="city-chip" style="--c:var(--ink)">宿 Logements</span></div>
        <p class="muted" style="font-size:.85rem">Choisis un jour en haut pour voir son trajet dans l’ordre, avec les étapes numérotées.</p>
        <ul class="map-steps">${J.data.hebergements.map((h) => `<li class="map-step"><span class="steps"><span class="n hotel">宿</span></span>
          <button class="go" type="button" data-go-hotel="${esc(h.id)}"><span class="nm">${esc(h.nom)}</span><span class="ad">${esc(J.city(h.ville).nom)} · ${esc(h.adresse)}</span></button><span></span></li>`).join('')}</ul>`;
      return;
    }
    const day = J.day(dayId);
    const r = routeOf(dayId);
    const steps = r ? r.etapes : [];
    const placed = steps.filter(J.hasCoords).length;
    title.textContent = `J${J.dayIndex(dayId) + 1} · ${J.dayLabel(day)}`;
    let n = 0;
    box.innerHTML = `
      <div class="map-stats"><span class="pill">${J.plural(steps.length, 'étape', 'étapes')}</span><span class="pill">${J.plural(placed, 'lieu localisé', 'lieux localisés')}</span>${steps.some((s) => s.mode === 'transit') ? '<span class="pill">┄ transports</span>' : ''}</div>
      ${steps.length ? `<ol class="map-steps">${steps.map((s, i) => {
        const isHotel = s.type === 'hotel';
        const label = isHotel ? '宿' : ++n;
        return `<li class="map-step">
          <span class="steps c-${esc(J.dayColorCity(day))}"><span class="n${isHotel ? ' hotel' : ''}">${label}</span></span>
          <button class="go" type="button" data-go="${s.id}"><span class="nm">${esc(s.nom || 'Étape')}</span>
            <span class="ad${J.hasCoords(s) ? '' : ' warn'}">${esc(s.adresse || 'Adresse à préciser')}${J.hasCoords(s) ? '' : ' · position à préciser'}</span>
            <span class="ad">${esc(MODES[s.mode] || MODES.walking)}</span></button>
          <span class="ops">
            <button type="button" data-step-move="${i}:-1" ${i === 0 ? 'disabled' : ''} aria-label="Monter">↑</button>
            <button type="button" data-step-move="${i}:1" ${i === steps.length - 1 ? 'disabled' : ''} aria-label="Descendre">↓</button>
            <button type="button" data-step-edit="${s.id}" aria-label="Modifier">✎</button>
            <button type="button" data-step-del="${s.id}" aria-label="Supprimer">✕</button>
          </span>
        </li>`;
      }).join('')}</ol>` : '<div class="empty">Aucune étape. Ajoute un lieu ou une activité du jour.</div>'}
      <div class="btn-row">
        <button class="btn btn-sm btn-primary" type="button" data-step-add>${J.icon('plus')} Ajouter une étape</button>
        ${steps.length ? `<a class="btn btn-sm" href="${esc(J.gmapsRoute(steps))}" target="_blank" rel="noopener">Itinéraire Google Maps ↗</a>` : ''}
        <a class="btn btn-sm btn-ghost" href="#/jour/${dayId}">Voir le programme</a>
      </div>
      <p class="muted" style="font-size:.8rem">Astuce : les étapes se suivent dans l’ordre de la liste. La carte utilise OpenStreetMap ; la recherche de lieux demande une connexion Internet.</p>`;
  }

  /* ---------- Étapes : ajout / modification ---------- */
  function stepModal(existing) {
    const day = J.day(dayId);
    const acts = J.sortedActs(day);
    const s = existing || { nom: '', adresse: '', mode: 'walking', type: 'place' };
    let picked = existing && J.hasCoords(existing) ? { lat: existing.lat, lon: existing.lon } : null;
    const dlg = J.openModal({
      title: existing ? (existing.type === 'hotel' ? 'Point de départ / logement' : 'Modifier l’étape') : 'Ajouter une étape',
      kanji: '道',
      submit: existing ? 'Enregistrer' : 'Ajouter',
      done: existing ? 'Enregistré' : 'Ajoutée',
      body: `<div class="form-grid">
          ${existing ? '' : `<label class="field"><span>Réutiliser une activité du jour</span><select class="select" name="act"><option value="">— Choisir —</option>${acts.map((a) => `<option value="${a.id}">${esc(a.heure ? a.heure + ' · ' : '')}${esc(a.nom)}</option>`).join('')}</select></label>`}
          <label class="field"><span>Nom du lieu</span><input class="input" name="nom" value="${esc(s.nom)}" placeholder="ex. Shibuya Sky"></label>
          <label class="field"><span>Adresse ou lieu au Japon</span><input class="input" name="adresse" value="${esc(s.adresse || '')}" placeholder="Adresse, quartier ou nom du lieu"></label>
          <div class="btn-row"><button class="btn btn-sm" type="button" data-search>${J.icon('search')} Rechercher sur la carte</button><span class="muted" id="geoStatus" style="font-size:.85rem;align-self:center">${picked ? '📍 Position connue' : ''}</span></div>
          <div class="suggestions" id="suggestions"></div>
          <label class="field"><span>Pour y aller</span><select class="select" name="mode">${Object.entries(MODES).map(([k, v]) => `<option value="${k}"${s.mode === k ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
        </div>`,
      onSubmit: async (form) => {
        const nom = form.elements.nom.value.trim();
        const adresse = form.elements.adresse.value.trim();
        if (!nom && !adresse) { J.toast('Saisis un nom ou une adresse', 'error'); return false; }
        if (!picked && adresse && (!existing || adresse !== existing.adresse)) {
          const hit = await J.geocode(adresse + ', Japon');
          if (hit) picked = { lat: hit.lat, lon: hit.lon };
        }
        if (existing && adresse !== existing.adresse && !picked) { existing.lat = null; existing.lon = null; }
        const r = ensureRoute(dayId);
        const data = { nom: nom || adresse, adresse, mode: form.elements.mode.value, lat: picked ? picked.lat : null, lon: picked ? picked.lon : null };
        if (existing) Object.assign(existing, data);
        else r.etapes.push({ id: J.nextStepId(), type: 'place', ...data });
        J.commit(picked ? (existing ? 'Étape modifiée' : 'Étape ajoutée au trajet') : 'Étape enregistrée — position à préciser');
        return true;
      },
    });
    const f = J.$('form', dlg);
    const status = J.$('#geoStatus', dlg);
    const box = J.$('#suggestions', dlg);
    f.elements.act?.addEventListener('change', (e) => {
      const a = acts.find((x) => String(x.id) === e.target.value);
      if (!a) return;
      f.elements.nom.value = a.nom;
      const st = a.etape != null ? J.idx.step.get(a.etape)?.step : null;
      if (st) { f.elements.adresse.value = st.adresse || ''; picked = J.hasCoords(st) ? { lat: st.lat, lon: st.lon } : null; status.textContent = picked ? '📍 Position reprise de l’activité' : ''; }
    });
    f.elements.adresse.addEventListener('input', () => { picked = null; status.textContent = ''; });
    J.$('[data-search]', dlg).addEventListener('click', async () => {
      const q = f.elements.adresse.value.trim() || f.elements.nom.value.trim();
      if (!q) { J.toast('Saisis un nom ou une adresse', 'error'); return; }
      status.textContent = 'Recherche…';
      const items = await J.geocode(q, 5);
      if (!items.length) { status.textContent = 'Aucun résultat : essaie une adresse plus précise.'; box.innerHTML = ''; return; }
      status.textContent = 'Choisis le bon résultat :';
      box.innerHTML = items.map((it, i) => `<button type="button" data-pick="${i}">${esc(it.label)}</button>`).join('');
      box.onclick = (e) => {
        const b = e.target.closest('[data-pick]');
        if (!b) return;
        const it = items[+b.dataset.pick];
        picked = { lat: it.lat, lon: it.lon };
        f.elements.adresse.value = it.label;
        if (!f.elements.nom.value.trim()) f.elements.nom.value = it.name || it.label.split(',')[0];
        box.innerHTML = '';
        status.textContent = '📍 Position choisie';
      };
    });
  }

  /* ---------- Vue ---------- */
  J.views.carte = {
    title: () => 'Carte',
    async render(route) {
      const el = J.$('[data-view="carte"]');
      const q = route.query;
      dayId = q.get('jour') ? +q.get('jour') : null;
      if (dayId != null && !J.day(dayId)) dayId = null;
      if (!J.$('#leafletMap', el)) {
        el.innerHTML = `
          <div class="map-bar">
            <button class="icon-btn" type="button" data-day-step="-1" aria-label="Jour précédent">${J.icon('left')}</button>
            <label class="sr-only" for="mapDay">Jour affiché</label>
            <select class="select" id="mapDay"></select>
            <button class="icon-btn" type="button" data-day-step="1" aria-label="Jour suivant">${J.icon('right')}</button>
            <button class="icon-btn" type="button" id="mapLocate" aria-label="Me localiser" title="Me localiser">${J.icon('locate')}</button>
          </div>
          <div class="map-body">
            <div id="leafletMap" role="application" aria-label="Carte des lieux du voyage"></div>
            <section class="map-panel" id="mapPanel" aria-labelledby="mapPanelTitle">
              <div class="map-panel-head"><h2 id="mapPanelTitle">Carte</h2><button class="handle" type="button" aria-expanded="true" aria-controls="mapPanelBody" aria-label="Réduire ou agrandir la liste">${J.icon('chevron')}</button></div>
              <div class="map-panel-body" id="mapPanelBody"></div>
            </section>
          </div>`;
        this.bind(el);
      }
      this.fillSelect();
      try { await loadLeaflet(); } catch {
        J.$('#leafletMap', el).innerHTML = '<div class="empty" style="margin:16px">Impossible de charger la carte (connexion ?).</div>';
        panel();
        return;
      }
      if (!map) {
        map = L.map('leafletMap', { zoomControl: true, attributionControl: true }).setView([35.2, 137.4], 6);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, crossOrigin: 'anonymous', attribution: '&copy; contributeurs <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
        layer = L.layerGroup().addTo(map);
      }
      setTimeout(() => map.invalidateSize(), 60);
      draw({ focus: q.get('etape') ? +q.get('etape') : null });
    },
    update() { this.fillSelect(); draw({ fit: false }); },
    fillSelect() {
      const sel = J.$('#mapDay');
      if (!sel) return;
      sel.innerHTML = `<option value="">Tous les lieux</option>` + J.data.jours.map((d, i) => `<option value="${d.id}">J${i + 1} · ${esc(J.fmt.short(J.dayDate(i)))} — ${esc(J.dayLabel(d))}</option>`).join('');
      sel.value = dayId == null ? '' : String(dayId);
    },
    setDay(id) {
      dayId = id;
      J.setQuery({ jour: id ?? '' });
      J.$('#mapDay').value = id == null ? '' : String(id);
      draw();
    },
    bind(el) {
      J.$('#mapDay', el).addEventListener('change', (e) => this.setDay(e.target.value ? +e.target.value : null));
      el.addEventListener('click', async (e) => {
        const t = e.target.closest('button');
        if (!t) return;
        if (t.dataset.dayStep) {
          const ids = [null, ...J.data.jours.map((d) => d.id)];
          const i = ids.indexOf(dayId);
          this.setDay(ids[(i + +t.dataset.dayStep + ids.length) % ids.length]);
        } else if (t.id === 'mapLocate') this.locate();
        else if (t.classList.contains('handle')) {
          collapsed = !collapsed;
          J.$('#mapPanel').classList.toggle('is-collapsed', collapsed);
          t.setAttribute('aria-expanded', String(!collapsed));
        } else if (t.dataset.go) {
          const m = markers.get(+t.dataset.go);
          if (m) { map.setView(m.getLatLng(), Math.max(map.getZoom(), 15)); m.openPopup(); }
          else J.toast('Ce lieu n’a pas encore de position sur la carte', 'error');
        } else if (t.dataset.goHotel) {
          const h = J.idx.hotel.get(t.dataset.goHotel);
          if (h && J.hasCoords(h)) map.setView([h.lat, h.lon], 15);
        } else if (t.dataset.stepMove) {
          const [i, d] = t.dataset.stepMove.split(':').map(Number);
          const r = routeOf(dayId);
          if (!r || !r.etapes[i + d]) return;
          [r.etapes[i], r.etapes[i + d]] = [r.etapes[i + d], r.etapes[i]];
          J.commit(null, { silent: true }); draw({ fit: false });
        } else if (t.dataset.stepDel) {
          const r = routeOf(dayId);
          const s = r && r.etapes.find((x) => x.id === +t.dataset.stepDel);
          if (!s || !(await J.confirm(`Retirer « ${s.nom} » du trajet ?`, { title: 'Supprimer l’étape', ok: 'Supprimer' }))) return;
          r.etapes = r.etapes.filter((x) => x !== s);
          J.commit('Étape supprimée', { silent: true }); draw({ fit: false });
        } else if (t.dataset.stepEdit) {
          const s = J.idx.step.get(+t.dataset.stepEdit)?.step;
          if (s) stepModal(s);
        } else if (t.hasAttribute('data-step-add')) stepModal(null);
      });
    },
    locate() {
      if (!navigator.geolocation) { J.toast('Géolocalisation indisponible sur cet appareil', 'error'); return; }
      J.toast('Recherche de ta position…');
      navigator.geolocation.getCurrentPosition((pos) => {
        const ll = [pos.coords.latitude, pos.coords.longitude];
        if (meLayer) map.removeLayer(meLayer);
        meLayer = L.layerGroup([
          L.circle(ll, { radius: pos.coords.accuracy, color: '#2f80ed', weight: 1, fillOpacity: 0.08 }),
          L.marker(ll, { icon: L.divIcon({ className: '', html: '<div class="mk me"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), title: 'Ma position' }),
        ]).addTo(map);
        map.setView(ll, 15);
      }, () => J.toast('Position refusée ou indisponible', 'error'), { enableHighAccuracy: true, timeout: 12000 });
    },
  };

  J.on('theme', () => { if (map && dayId != null) draw({ fit: false }); });
})();
