/* Japon 2026 — fenêtres d'édition (activité, jour, logement, paramètres du voyage) */
'use strict';
(function () {
  const J = window.J;
  const { esc } = J;
  const E = (J.editor = {});

  const options = (list, value, label) => list.map((o) => `<option value="${esc(o.value)}"${String(o.value) === String(value ?? '') ? ' selected' : ''}>${esc(label ? label(o) : o.label)}</option>`).join('');
  const invalid = (form, name, msg) => {
    const f = form.elements[name];
    f.setAttribute('aria-invalid', 'true');
    f.focus();
    J.toast(msg, 'error');
    return false;
  };

  /* ---------- Activité : ajout / modification (+ photos) ---------- */
  E.activity = ({ id, dayId } = {}) => {
    const info = id ? J.idx.act.get(id) : null;
    const day = info ? info.day : J.day(dayId);
    if (!day) return;
    const a = info ? info.act : { nom: '', heure: '', categorie: 'visite', ville: J.dayColorCity(day), cout: 0, notes: '', description: '', adresse: '' };
    const timeType = !a.heure || /^\d{2}:\d{2}$/.test(a.heure) ? 'time' : 'text';
    const cats = J.data.categories.map((c) => ({ value: c.id, label: `${c.emoji} ${c.labelLong || c.label}` }));
    const villes = J.data.villes.map((v) => ({ value: v.id, label: v.nom }));
    const jours = J.data.jours.map((d, i) => ({ value: d.id, label: `J${i + 1} — ${J.dayLabel(d)}` }));
    J.openModal({
      title: info ? 'Modifier l’activité' : 'Ajouter une activité',
      kanji: info ? '編' : '加',
      submit: info ? 'Enregistrer' : 'Ajouter',
      done: info ? 'Enregistré' : 'Ajoutée',
      body: `<div class="form-grid cols-2">
          <label class="field span-2"><span>Nom</span><input class="input" name="nom" value="${esc(a.nom)}" placeholder="Nom de l’activité…" autocomplete="off"></label>
          <label class="field span-2"><span>Adresse</span><input class="input" name="adresse" value="${esc(a.adresse || '')}" placeholder="${esc(J.actAddress(a, day) || 'Adresse ou lieu précis…')}" autocomplete="off"></label>
          <label class="field"><span>Heure</span><input class="input" type="${timeType}" name="heure" value="${esc(a.heure || '')}" ${timeType === 'text' ? 'placeholder="HH:MM"' : ''}></label>
          <label class="field"><span>Coût estimé (€)</span><input class="input" type="number" name="cout" min="0" step="1" inputmode="decimal" placeholder="0" value="${+a.cout || ''}"></label>
          <label class="field"><span>Catégorie</span><select class="select" name="categorie">${options(cats, a.categorie)}</select></label>
          <label class="field"><span>Ville</span><select class="select" name="ville">${options(villes, a.ville)}</select></label>
          <label class="field span-2"><span>Jour</span><select class="select" name="jour">${options(jours, day.id)}</select></label>
          <label class="field span-2"><span>Description courte</span><textarea class="textarea" name="description" placeholder="Décris ce que tu veux voir, pourquoi tu as choisi ce lieu…">${esc(a.description || '')}</textarea></label>
          <label class="field span-2"><span>Infos importantes</span><textarea class="textarea" name="notes" placeholder="Adresse, horaires, conseils…">${esc(a.notes || '')}</textarea></label>
          <div class="field span-2"><span class="field-label">Photos de cette activité (plusieurs possibles)</span>
            <input class="input" type="file" name="photos" accept="image/*" multiple>
            <div class="photo-edit" id="photoEdit"></div>
            <small class="muted">Les photos restent enregistrées dans ce navigateur ; la sauvegarde complète (Outils → Données) les inclut.</small>
          </div>
        </div>`,
      onOpen: (dlg) => {
        const box = J.$('#photoEdit', dlg);
        const refresh = async () => {
          if (!info) return;
          const fixed = a.photos || [];
          const mine = await J.photos.get(a.id);
          box.innerHTML = fixed.map((src, i) => `<figure><img src="${esc(src)}" alt="${esc(a.nom)}"><button type="button" data-rm-fixed="${i}" aria-label="Retirer la photo ${i + 1}">✕</button></figure>`).join('')
            + mine.map((p, i) => `<figure><img src="${p.data}" alt="${esc(p.name || 'Photo')}"><button type="button" data-rm="${i}" aria-label="Retirer la photo ${fixed.length + i + 1}">✕</button></figure>`).join('');
        };
        box.addEventListener('click', async (e) => {
          const b = e.target.closest('[data-rm], [data-rm-fixed]');
          if (!b) return;
          if (b.dataset.rmFixed != null) {
            a.photos.splice(+b.dataset.rmFixed, 1);
            if (!a.photos.length) delete a.photos;
            J.commit(null, { silent: true });
            J.emit('photos', a.id);
          } else {
            const list = await J.photos.get(a.id);
            list.splice(+b.dataset.rm, 1);
            await J.photos.put(a.id, list);
          }
          refresh();
          J.$$(`[data-gallery="${a.id}"]`).forEach((g) => J.fillGallery(g, a.id));
        });
        refresh();
      },
      onSubmit: async (form) => {
        const v = Object.fromEntries(new FormData(form));
        const nom = String(v.nom || '').trim();
        if (!nom) return invalid(form, 'nom', 'Saisis un nom pour l’activité');
        const target = J.day(v.jour) || day;
        const data = { heure: String(v.heure || '').trim(), nom, categorie: v.categorie, ville: v.ville, cout: parseFloat(v.cout) || 0, notes: String(v.notes || '').trim(), description: String(v.description || '').trim(), adresse: String(v.adresse || '').trim() };
        let act = a;
        if (info) {
          Object.assign(act, data);
          if (target !== day) { day.activites = day.activites.filter((x) => x.id !== act.id); target.activites.push(act); }
        } else {
          act = { id: J.nextActId(), ...data };
          target.activites.push(act);
        }
        const files = form.elements.photos.files;
        if (files && files.length) await J.photos.add(act.id, files);
        J.commit(info ? `✏️ ${nom} modifiée` : `✅ ${nom} ajoutée !`);
        return true;
      },
    });
  };

  /* ---------- Jour : titre, logement de la nuit, suppression ---------- */
  E.day = (id) => {
    const day = J.day(id);
    if (!day) return;
    const i = J.dayIndex(id);
    const hotels = [{ value: '', label: '— Aucun (nuit en transport) —' }, ...J.data.hebergements.map((h) => ({ value: h.id, label: `${J.city(h.ville).nom} — ${h.nom}` }))];
    const dlg = J.openModal({
      title: `Jour ${i + 1}`,
      kanji: '日',
      body: `<div class="form-grid">
          <label class="field"><span>Titre du jour</span><input class="input" name="titre" value="${esc(day.titre)}" placeholder="Titre du jour…"></label>
          <label class="field"><span>Logement de la nuit</span><select class="select" name="nuit">${options(hotels, day.nuit || '')}</select></label>
          <p class="muted" style="font-size:.85rem">Date calculée à partir de la date de départ : ${esc(J.fmt.full(J.dayDate(i)))}.</p>
          ${J.data.jours.length > 1 ? `<div><button class="btn btn-sm btn-danger" type="button" data-del-day>${J.icon('trash')} Supprimer ce jour</button></div>` : ''}
        </div>`,
      onSubmit: (form) => {
        day.titre = form.elements.titre.value.trim();
        day.nuit = form.elements.nuit.value || null;
        J.commit('Jour mis à jour');
        return true;
      },
    });
    J.$('[data-del-day]', dlg)?.addEventListener('click', async () => {
      dlg.close();
      if (!(await J.confirm('Supprimer ce jour et toutes ses activités ?', { title: `Supprimer le jour ${i + 1}`, ok: 'Supprimer' }))) return;
      J.data.jours = J.data.jours.filter((d) => d.id !== id);
      J.data.trajets = J.data.trajets.filter((r) => r.jour !== id);
      J.commit('🗑️ Jour supprimé');
      if (J.route.parts[0] === 'jour') location.hash = '#/itineraire';
    });
  };

  E.addDay = () => {
    const id = J.nextDayId();
    J.data.jours.push({ id, titre: '', nuit: null, notes: '', activites: [] });
    J.commit(`📅 Jour ${J.data.jours.length} ajouté !`);
    location.hash = `#/jour/${id}`;
  };

  /* ---------- Logement ---------- */
  E.hotel = (id) => {
    const h = J.idx.hotel.get(id);
    if (!h) return;
    J.openModal({
      title: `Logement — ${J.city(h.ville).nom}`,
      kanji: '宿',
      body: `<div class="form-grid">
          <label class="field"><span>Nom</span><input class="input" name="nom" value="${esc(h.nom)}"></label>
          <label class="field"><span>Adresse</span><textarea class="textarea" name="adresse" rows="2">${esc(h.adresse)}</textarea></label>
          <p class="muted" style="font-size:.85rem">Si l’adresse change, la position sur la carte est recherchée automatiquement (OpenStreetMap).</p>
        </div>`,
      onSubmit: async (form) => {
        const nom = form.elements.nom.value.trim();
        const adresse = form.elements.adresse.value.trim();
        if (!nom) return invalid(form, 'nom', 'Le nom ne peut pas être vide');
        if (adresse !== h.adresse) {
          const hit = await J.geocode(adresse);
          h.lat = hit ? hit.lat : null; h.lon = hit ? hit.lon : null;
          if (!hit) J.toast('Adresse introuvable sur la carte : position à préciser', 'error');
        }
        h.nom = nom; h.adresse = adresse;
        J.commit('Logement mis à jour');
        return true;
      },
    });
  };

  /* ---------- Paramètres du voyage (anciens champs : date de départ, destination, nom) ---------- */
  E.voyage = () => {
    const v = J.data.voyage;
    J.openModal({
      title: 'Paramètres du voyage',
      kanji: '旅',
      body: `<div class="form-grid">
          <label class="field"><span>Date de départ</span><input class="input" type="date" name="dateDepart" value="${esc(v.dateDepart)}"></label>
          <label class="field"><span>Destination principale</span><input class="input" name="destination" value="${esc(v.destination)}" placeholder="Tokyo, Kyoto, Osaka…"></label>
          <label class="field"><span>Nom du voyage</span><input class="input" name="nom" value="${esc(v.nom)}" placeholder="Mon Voyage au Japon"></label>
          <p class="muted" style="font-size:.85rem">Les dates des 16 jours et le compte à rebours suivent la date de départ.</p>
        </div>`,
      onSubmit: (form) => {
        const date = form.elements.dateDepart.value;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return invalid(form, 'dateDepart', 'Choisis une date de départ');
        if (date !== v.dateDepart && v.depart?.dateHeure) v.depart.dateHeure = date + v.depart.dateHeure.slice(10);
        v.dateDepart = date;
        v.destination = form.elements.destination.value.trim();
        v.nom = form.elements.nom.value.trim();
        J.commit('Paramètres enregistrés');
        return true;
      },
    });
  };

  /* ---------- Géocodage OpenStreetMap (Nominatim), pour les adresses ajoutées dans le site ---------- */
  J.geocode = async (q, limit = 1) => {
    if (!q) return limit === 1 ? null : [];
    try {
      const url = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({ format: 'jsonv2', limit, countrycodes: 'jp', q });
      const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } });
      if (!res.ok) throw new Error(res.status);
      const items = (await res.json()).map((it) => ({ lat: +(+it.lat).toFixed(6), lon: +(+it.lon).toFixed(6), label: it.display_name, name: it.name }));
      return limit === 1 ? items[0] || null : items;
    } catch { return limit === 1 ? null : []; }
  };
})();
