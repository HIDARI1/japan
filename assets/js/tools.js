/* Japon 2026 — outils pratiques : checklist, budget, logements, données (sauvegarde / import / export) */
'use strict';
(function () {
  const J = window.J;
  const { esc } = J;
  const TABS = [
    { id: 'checklist', label: 'Checklist' },
    { id: 'budget', label: 'Budget' },
    { id: 'logements', label: 'Logements' },
    { id: 'donnees', label: 'Données' },
  ];

  /* ================= Checklist ================= */
  J.checklistState = () => {
    const s = J.store.get('checklist', null) || {};
    return { done: s.done || {}, perso: Array.isArray(s.perso) ? s.perso : [] };
  };
  const saveCL = (s) => J.store.set('checklist', s);
  J.checklistStats = () => {
    const st = J.checklistState();
    const ids = J.data.checklist.flatMap((g) => g.items.map((i) => i.id));
    const done = ids.filter((id) => st.done[id]).length + st.perso.filter((p) => p.done).length;
    return { done, total: ids.length + st.perso.length };
  };

  function checklistHTML() {
    const st = J.checklistState();
    const { done, total } = J.checklistStats();
    const src = (s) => {
      const day = J.day(s.jour);
      if (!day) return '';
      const a = s.activite != null ? J.idx.act.get(s.activite)?.act : null;
      return `<a href="#/jour/${day.id}${a ? `?a=${a.id}` : ''}">J${J.dayIndex(day.id) + 1}${a ? ' · ' + esc(a.nom) : ' · ' + esc(J.dayLabel(day))}</a>`;
    };
    const item = (id, text, checked, sources, perso) => `<li class="cl-item${checked ? ' is-done' : ''}">
        <span class="check"><input type="checkbox" id="cl-${esc(id)}" data-cl="${esc(id)}" ${perso ? 'data-perso="1"' : ''} ${checked ? 'checked' : ''}><span class="check-box"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span></span>
        <div><label for="cl-${esc(id)}">${esc(text)}</label>${sources ? `<div class="cl-src">${sources}</div>` : ''}</div>
        ${perso ? `<button class="cl-del" type="button" data-cl-del="${esc(id)}" aria-label="Supprimer « ${esc(text)} »">✕</button>` : '<span></span>'}
      </li>`;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return `<div class="card tool-card">
      <h2>À vérifier & réserver</h2>
      <p class="sub">Chaque élément vient d’une note du programme (lien vers le jour concerné). Tes coches restent sur cet appareil.</p>
      <div class="big-progress"><div class="progress"><span style="width:${pct}%"></span></div><b>${done}/${total}</b></div>
      ${J.data.checklist.map((g) => {
        const n = g.items.filter((i) => st.done[i.id]).length;
        return `<div class="cl-group"><div class="cl-group-head"><h3>${esc(g.titre)}</h3><span class="count">${n}/${g.items.length}</span></div>
          <ul class="cl-list">${g.items.map((i) => item(i.id, i.texte, !!st.done[i.id], (i.sources || []).map(src).join(''), false)).join('')}</ul></div>`;
      }).join('')}
      <div class="cl-group"><div class="cl-group-head"><h3>Mes ajouts</h3><span class="count">${st.perso.filter((p) => p.done).length}/${st.perso.length}</span></div>
        ${st.perso.length ? `<ul class="cl-list">${st.perso.map((p) => item(p.id, p.texte, p.done, '', true)).join('')}</ul>` : '<p class="muted" style="font-size:.9rem">Ajoute ici tes propres choses à faire.</p>'}
        <form class="cl-add" id="clAdd"><label class="sr-only" for="clNew">Nouvel élément</label><input class="input" id="clNew" placeholder="Ex. : acheter un adaptateur…" autocomplete="off"><button class="btn btn-primary" type="submit">${J.icon('plus')} Ajouter</button></form>
      </div>
    </div>`;
  }

  /* ================= Budget ================= */
  const budget = () => { const b = J.store.get('budget', null) || {}; return { taux: +b.taux || null, depenses: Array.isArray(b.depenses) ? b.depenses : [] }; };
  const saveBudget = (b) => J.store.set('budget', b);
  const toEur = (e, taux) => (e.devise === 'JPY' ? (taux ? e.montant / taux : null) : e.montant);

  function bars(rows, total) {
    const max = Math.max(1, ...rows.map((r) => r.v));
    return `<div class="bars">${rows.map((r) => `<div class="bar-row ${r.cls || ''}"><span>${r.label}</span><span class="track"><span style="width:${Math.round((r.v / max) * 100)}%"></span></span><span class="v">${esc(J.eur(r.v))}</span></div>`).join('')}</div>`;
  }

  function budgetHTML() {
    const b = budget();
    const acts = J.data.jours.flatMap((day) => day.activites.map((a) => ({ a, day })));
    const est = acts.reduce((s, { a }) => s + (+a.cout || 0), 0);
    const spentEur = b.depenses.reduce((s, e) => s + (toEur(e, b.taux) || 0), 0);
    const yen = b.depenses.filter((e) => e.devise === 'JPY').reduce((s, e) => s + e.montant, 0);
    const missingRate = !b.taux && b.depenses.some((e) => e.devise === 'JPY');
    const byCity = J.data.villes.map((v) => ({ label: J.cityChip(v.id), v: acts.filter(({ a }) => a.ville === v.id).reduce((s, { a }) => s + (+a.cout || 0), 0) })).filter((r) => r.v > 0);
    const byCat = J.data.categories.map((c) => ({ label: `${c.emoji} ${esc(c.label)}`, v: acts.filter(({ a }) => a.categorie === c.id).reduce((s, { a }) => s + (+a.cout || 0), 0) })).filter((r) => r.v > 0);
    const paid = acts.filter(({ a }) => +a.cout > 0);
    const today = J.todayDay();
    const cats = J.data.categories;
    const sorted = [...b.depenses].sort((x, y) => (y.date || '').localeCompare(x.date || '') || y.id - x.id);
    return `
      <div class="card tool-card">
        <h2>Budget</h2>
        <p class="sub">Estimation tirée des coûts indiqués dans le programme, et tes dépenses réelles sur place.</p>
        <div class="budget-kpis">
          <div class="kpi"><div class="v" data-count="${est}" data-format="eur">${esc(J.eur(est))}</div><div class="l">Budget estimé</div></div>
          <div class="kpi"><div class="v">${esc(J.eur(Math.round(spentEur)))}</div><div class="l">Dépensé${missingRate ? ' (hors ¥)' : ''}</div></div>
          <div class="kpi"><div class="v">${esc(J.eur(Math.round(est - spentEur)))}</div><div class="l">Reste / estimé</div></div>
          <div class="kpi"><div class="v">${esc(J.yen(yen))}</div><div class="l">Dépensé en yens</div></div>
        </div>
        ${missingRate ? '<p class="muted" style="margin-top:10px;font-size:.88rem">Renseigne le taux du jour ci-dessous pour convertir tes dépenses en yens.</p>' : ''}
      </div>

      <div class="card tool-card">
        <h2>Convertisseur € ↔ ¥</h2>
        <p class="sub">Indique le taux du jour (vu sur ton appli bancaire ou au bureau de change) ; il est mémorisé.</p>
        <div class="converter">
          <label class="field"><span>1 € = … ¥</span><input class="input" type="number" min="0" step="0.01" inputmode="decimal" id="rate" value="${b.taux || ''}" placeholder="Taux du jour"></label>
          <div class="pair">
            <label class="field"><span>Euros</span><input class="input" type="number" min="0" step="0.01" inputmode="decimal" id="convEur" placeholder="€"></label>
            <span class="eq">⇄</span>
            <label class="field"><span>Yens</span><input class="input" type="number" min="0" step="1" inputmode="numeric" id="convYen" placeholder="¥"></label>
          </div>
        </div>
      </div>

      <div class="card tool-card">
        <h2>Mes dépenses</h2>
        <p class="sub">Note ce que tu dépenses sur place (enregistré sur cet appareil).</p>
        <form class="form-grid cols-2" id="expForm">
          <label class="field span-2"><span>Libellé</span><input class="input" name="libelle" placeholder="Ex. : ramen, billets de métro…" autocomplete="off"></label>
          <label class="field"><span>Montant</span><input class="input" type="number" name="montant" min="0" step="0.01" inputmode="decimal" placeholder="0"></label>
          <label class="field"><span>Devise</span><select class="select" name="devise"><option value="JPY">¥ Yen</option><option value="EUR">€ Euro</option></select></label>
          <label class="field"><span>Catégorie</span><select class="select" name="categorie">${cats.map((c) => `<option value="${esc(c.id)}"${c.id === 'autre' ? ' selected' : ''}>${c.emoji} ${esc(c.label)}</option>`).join('')}</select></label>
          <label class="field"><span>Jour</span><select class="select" name="jour"><option value="">—</option>${J.data.jours.map((d, i) => `<option value="${d.id}"${today && today.id === d.id ? ' selected' : ''}>J${i + 1} · ${esc(J.fmt.short(J.dayDate(i)))}</option>`).join('')}</select></label>
          <div class="span-2"><button class="btn btn-primary" type="submit">${J.icon('plus')} Ajouter la dépense</button></div>
        </form>
        ${sorted.length ? `<ul class="exp-list">${sorted.map((e) => {
          const c = J.cat(e.categorie); const d = e.jour ? J.day(e.jour) : null; const eur = toEur(e, b.taux);
          return `<li class="exp-item"><div><div class="nm">${c.emoji} ${esc(e.libelle || c.label)}</div><div class="mt">${d ? `J${J.dayIndex(d.id) + 1} · ${esc(J.fmt.short(J.dayDate(d)))}` : ''}</div></div>
            <div class="am">${e.devise === 'JPY' ? esc(J.yen(e.montant)) : esc(J.eur(e.montant))}${e.devise === 'JPY' && eur != null ? `<small>≈ ${esc(J.eur(Math.round(eur * 100) / 100))}</small>` : ''}</div>
            <button class="cl-del" type="button" data-exp-del="${e.id}" aria-label="Supprimer la dépense">✕</button></li>`;
        }).join('')}</ul>` : ''}
      </div>

      <div class="card tool-card">
        <h2>Budget estimé par ville</h2>
        ${bars(byCity)}
        <h2 style="margin-top:22px">Par catégorie</h2>
        ${bars(byCat)}
      </div>

      <div class="card tool-card">
        <h2>Activités avec un coût</h2>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Jour</th><th>Activité</th><th class="num">Coût estimé</th></tr></thead>
          <tbody>${paid.map(({ a, day }) => `<tr><td><a href="#/jour/${day.id}?a=${a.id}">J${J.dayIndex(day.id) + 1}</a></td><td>${esc(a.nom)}</td><td class="num">${esc(J.eur(a.cout))}</td></tr>`).join('')}</tbody>
          <tfoot><tr><td></td><td><b>Total</b></td><td class="num"><b>${esc(J.eur(est))}</b></td></tr></tfoot>
        </table></div>
      </div>

      <div class="card tool-card">
        <h2>Récap du voyage</h2>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Jour</th><th>Titre</th><th>Date</th><th>Avancement</th><th class="num">Budget</th></tr></thead>
          <tbody>${J.data.jours.map((d, i) => {
            const n = d.activites.length, dn = J.dayDone(d);
            return `<tr><td><a href="#/jour/${d.id}">J${i + 1}</a></td><td>${esc(d.titre || 'Sans titre')}</td><td class="nowrap">${esc(J.fmt.mid(J.dayDate(i)))}</td>
              <td class="nowrap">${dn}/${n} <span class="progress" style="display:inline-block;width:60px;vertical-align:middle"><span style="width:${n ? Math.round((dn / n) * 100) : 0}%"></span></span></td><td class="num">${esc(J.eur(J.dayCost(d)))}</td></tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>`;
  }

  /* ================= Logements ================= */
  function lodgingHTML() {
    return `<div class="card tool-card"><h2>Logements</h2><p class="sub">Adresses à montrer au taxi ou à copier dans une appli de navigation.</p>
      <div class="lodging">${J.data.hebergements.map((h) => {
        const nights = J.data.jours.map((d, i) => ({ d, i })).filter(({ d }) => d.nuit === h.id);
        const when = nights.length ? `${J.fmt.mid(J.dayDate(nights[0].i))} → ${J.fmt.mid(J.dayDate(nights[nights.length - 1].i + 1))} · ${J.plural(nights.length, 'nuit', 'nuits')}` : 'Aucune nuit associée';
        return `<div class="lodge hover-line c-${esc(h.ville)}">
          <span class="when">${esc(J.city(h.ville).nom)} · ${esc(when)}</span>
          <h3>${esc(h.nom)}</h3>
          <p class="addr">${esc(h.adresse)}</p>
          <div class="btn-row">
            <button class="btn btn-xs" type="button" data-copy="${esc(h.adresse)}">${J.icon('copy')} Copier</button>
            <a class="btn btn-xs" href="${esc(J.gmapsTo(h))}" target="_blank" rel="noopener">${J.icon('route')} Y aller</a>
            ${J.hasCoords(h) ? `<a class="btn btn-xs" href="#/carte">${J.icon('map')} Carte</a>` : ''}
            <button class="btn btn-xs" type="button" data-hotel-edit="${esc(h.id)}">${J.icon('edit')} Modifier</button>
          </div>
        </div>`;
      }).join('')}</div></div>`;
  }

  /* ================= Données ================= */
  function dataHTML() {
    const e = J.editsInfo();
    const edited = J.editedFiles();
    const v = J.data.voyage;
    const theme = document.documentElement.dataset.theme || '';
    return `
      <div class="card tool-card">
        <h2>Paramètres du voyage</h2>
        <p class="sub">Date de départ : <b>${esc(J.fmt.year(J.parseISODate(v.dateDepart)))}</b> · Destination : <b>${esc(v.destination)}</b><br>Nom : <b>${esc(v.nom)}</b></p>
        <button class="btn btn-sm" type="button" data-voyage-edit>${J.icon('edit')} Modifier</button>
      </div>

      <div class="card tool-card">
        <h2>Thème</h2>
        <div class="tabs" role="group" aria-label="Thème" style="max-width:420px">
          ${[['', 'Automatique'], ['light', 'Clair'], ['dark', 'Sombre']].map(([k, l]) => `<a href="#/outils?t=donnees" role="button" data-theme-set="${k}" ${theme === k ? 'aria-current="page"' : ''}>${l}</a>`).join('')}
        </div>
      </div>

      <div class="card tool-card">
        <h2>Tes modifications</h2>
        <div class="data-status${e ? ' is-dirty' : ''}"><span class="led" aria-hidden="true"></span>
          <span>${e ? `Modifié dans le site le ${esc(new Date(e.savedAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }))} — enregistré sur cet appareil.` : 'Le site affiche exactement le contenu des fichiers du dossier <code>data/</code>.'}</span></div>
        ${edited.length ? `<p class="sub" style="margin-top:12px">Pour rendre tes modifications permanentes, télécharge ces fichiers et remplace-les dans le dossier <code>data/</code> :</p>
          <div class="file-list">${edited.map((f) => `<div class="file-row"><code>data/${f}.json</code><button class="btn btn-xs" type="button" data-dl-file="${f}">${J.icon('down')} Télécharger</button></div>`).join('')}</div>` : ''}
        ${e ? `<div class="btn-row" style="margin-top:12px"><button class="btn btn-sm btn-danger" type="button" data-discard>Revenir au contenu des fichiers</button></div>` : ''}
      </div>

      <div class="card tool-card">
        <h2>Sauvegarde complète</h2>
        <p class="sub">Un seul fichier avec tout : programme, cases cochées, checklist, dépenses et photos. Pratique pour passer sur un autre téléphone. L’import accepte aussi l’export de l’ancien site.</p>
        <div class="btn-row">
          <button class="btn btn-primary" type="button" data-export>${J.icon('down')} Exporter JSON</button>
          <label class="btn" tabindex="0">${J.icon('up')} Importer JSON<input class="sr-only" type="file" accept=".json,application/json" data-import></label>
        </div>
      </div>

      <div class="card tool-card">
        <h2>Réinitialiser</h2>
        <p class="sub">Efface ce qui est enregistré sur cet appareil : modifications, cases cochées, checklist, dépenses et photos. Les fichiers du dossier <code>data/</code> ne sont pas touchés.</p>
        <button class="btn btn-sm btn-danger" type="button" data-reset-all>Réinitialiser</button>
      </div>`;
  }

  /* ---------- Sauvegarde / import ---------- */
  async function backup() {
    const fichiers = {};
    J.EDITABLE.forEach((f) => (fichiers[f] = J.data[f]));
    const data = {
      format: 'japon-2026-sauvegarde', version: 2, date: new Date().toISOString(),
      fichiers, perso: { fait: J.done.all(), checklist: J.checklistState(), budget: budget() },
      photos: await J.photos.all(),
    };
    J.download(`programme-japon-${J.todayISO()}.json`, JSON.stringify(data, null, 2));
    return true;
  }

  /* Export de l'ancien site ({ state, config, photos }) → format actuel, sans perdre les positions déjà connues */
  function fromOld(d) {
    const st = d.state || {}, cfg = d.config || {};
    const fait = {};
    const jours = (st.days || []).map((day) => {
      const cur = J.day(day.id);
      return {
        id: day.id, titre: day.title || '', nuit: cur ? cur.nuit : null, notes: day.notes || '',
        activites: (day.activities || []).map((a) => {
          if (a.done) fait[a.id] = true;
          const old = J.idx.act.get(a.id)?.act;
          const act = { id: a.id, heure: a.time || '', nom: a.name || '', categorie: a.cat || 'autre', ville: old ? old.ville : (cur ? J.dayColorCity(cur) : 'trajet'), cout: +a.cost || 0, notes: a.notes || '', description: a.description || '' };
          if (old && old.etape != null) act.etape = old.etape;
          return act;
        }),
      };
    });
    const trajets = Object.entries(st.routes || {}).map(([k, r]) => ({
      jour: +k, hebergement: r.hotel || '', adresseHebergement: r.hotelAddress || '',
      etapes: (r.steps || []).map((s) => {
        const cur = J.idx.step.get(s.id)?.step;
        const keep = cur && cur.adresse === s.address && J.hasCoords(cur);
        return { id: s.id, type: s.type, nom: s.name, adresse: s.address, lat: s.lat ?? (keep ? cur.lat : null), lon: s.lon ?? (keep ? cur.lon : null), mode: s.mode || 'walking' };
      }),
    }));
    const voyage = { ...J.data.voyage, dateDepart: cfg.startDate || J.data.voyage.dateDepart, destination: cfg.dest || J.data.voyage.destination, nom: cfg.name || J.data.voyage.nom };
    const photos = {};
    Object.entries(d.photos || {}).forEach(([key, list]) => { const actId = String(key).split('_').pop(); photos[actId] = list; });
    return { fichiers: { voyage, jours, trajets }, perso: { fait }, photos };
  }

  async function importFile(file) {
    let d;
    try { d = JSON.parse(await file.text()); } catch { J.toast('Fichier invalide', 'error'); return; }
    let pack;
    if (d && d.format === 'japon-2026-sauvegarde') pack = d;
    else if (d && d.state && Array.isArray(d.state.days)) pack = fromOld(d);
    else { J.toast('Ce fichier n’est pas une sauvegarde du programme', 'error'); return; }
    if (!(await J.confirm('Le contenu actuel du site sur cet appareil sera remplacé par celui du fichier.', { title: 'Importer la sauvegarde', ok: 'Importer' }))) return;
    J.EDITABLE.forEach((f) => { if (pack.fichiers && pack.fichiers[f]) J.data[f] = pack.fichiers[f]; });
    if (pack.perso) {
      if (pack.perso.fait) J.store.set('fait', pack.perso.fait);
      if (pack.perso.checklist) J.store.set('checklist', pack.perso.checklist);
      if (pack.perso.budget) J.store.set('budget', pack.perso.budget);
    }
    if (pack.photos) for (const [id, list] of Object.entries(pack.photos)) if (Array.isArray(list) && list.length) await J.photos.put(id, list);
    J.commit('📤 Importé !');
  }

  /* ================= Vue ================= */
  J.views.outils = {
    title: () => 'Outils pratiques',
    render(route) {
      const el = J.$('[data-view="outils"]');
      const t = TABS.some((x) => x.id === route.query.get('t')) ? route.query.get('t') : 'checklist';
      const body = { checklist: checklistHTML, budget: budgetHTML, logements: lodgingHTML, donnees: dataHTML }[t]();
      el.innerHTML = `
        <div class="wrap page-head">
          <p class="section-label">Outils pratiques</p>
          <h1 class="page-title">Tout sous la main, <em>même hors ligne</em></h1>
        </div>
        <div class="wrap">
          <nav class="tabs" aria-label="Outils">${TABS.map((x) => `<a href="#/outils?t=${x.id}" ${x.id === t ? 'aria-current="page"' : ''}>${x.label}</a>`).join('')}</nav>
          <div class="tool-panel fx-blurin" data-tool="${t}">${body}</div>
        </div>`;
      J.fx.all(el);
      this.bind(el, t);
    },
    update(route) { const y = window.scrollY; this.render(route); window.scrollTo(0, y); },
    bind(el, t) {
      const panel = J.$('.tool-panel', el);
      const rerender = () => this.update(J.route);
      if (t === 'checklist') {
        panel.addEventListener('change', (e) => {
          const cb = e.target.closest('[data-cl]');
          if (!cb) return;
          const s = J.checklistState();
          if (cb.dataset.perso) { const p = s.perso.find((x) => x.id === cb.dataset.cl); if (p) p.done = cb.checked; }
          else if (cb.checked) s.done[cb.dataset.cl] = true; else delete s.done[cb.dataset.cl];
          saveCL(s);
          cb.closest('.cl-item').classList.toggle('is-done', cb.checked);
          const { done, total } = J.checklistStats();
          J.$('.big-progress b', panel).textContent = `${done}/${total}`;
          J.$('.big-progress .progress span', panel).style.width = `${total ? Math.round((done / total) * 100) : 0}%`;
          J.$$('.cl-group', panel).forEach((g) => { const boxes = J.$$('[data-cl]', g); J.$('.count', g).textContent = `${boxes.filter((b) => b.checked).length}/${boxes.length}`; });
        });
        panel.addEventListener('click', (e) => {
          const del = e.target.closest('[data-cl-del]');
          if (!del) return;
          const s = J.checklistState();
          s.perso = s.perso.filter((p) => p.id !== del.dataset.clDel);
          saveCL(s); rerender();
        });
        J.$('#clAdd', panel).addEventListener('submit', async (e) => {
          e.preventDefault();
          const input = J.$('#clNew', panel);
          const texte = input.value.trim();
          if (!texte) { input.focus(); return; }
          await J.fx.flow(e.submitter || J.$('#clAdd button', panel), async () => {
            const s = J.checklistState();
            s.perso.push({ id: 'p' + Date.now().toString(36), texte, done: false });
            saveCL(s);
          }, { done: 'Ajouté', hold: 500 });
          rerender();
          J.$('#clNew')?.focus();
        });
      }
      if (t === 'budget') {
        const rate = J.$('#rate', panel), eur = J.$('#convEur', panel), yen = J.$('#convYen', panel);
        const conv = (from) => {
          const r = +rate.value;
          if (!r) return;
          if (from === 'eur' && eur.value !== '') yen.value = Math.round(+eur.value * r);
          if (from === 'yen' && yen.value !== '') eur.value = (Math.round((+yen.value / r) * 100) / 100).toFixed(2);
        };
        rate.addEventListener('change', () => { const b = budget(); b.taux = +rate.value || null; saveBudget(b); rerender(); });
        rate.addEventListener('input', () => conv('eur'));
        eur.addEventListener('input', () => conv('eur'));
        yen.addEventListener('input', () => conv('yen'));
        J.$('#expForm', panel).addEventListener('submit', async (e) => {
          e.preventDefault();
          const f = e.target;
          const montant = parseFloat(f.elements.montant.value);
          if (!(montant > 0)) { f.elements.montant.focus(); J.toast('Indique un montant', 'error'); return; }
          await J.fx.flow(e.submitter || J.$('button[type=submit]', f), async () => {
            const b = budget();
            const jour = f.elements.jour.value ? +f.elements.jour.value : null;
            b.depenses.push({ id: Date.now(), date: jour ? J.dayISO(J.day(jour)) : J.todayISO(), jour, libelle: f.elements.libelle.value.trim(), montant, devise: f.elements.devise.value, categorie: f.elements.categorie.value });
            saveBudget(b);
          }, { done: 'Ajoutée', hold: 500 });
          rerender();
        });
        panel.addEventListener('click', (e) => {
          const d = e.target.closest('[data-exp-del]');
          if (!d) return;
          const b = budget();
          b.depenses = b.depenses.filter((x) => x.id !== +d.dataset.expDel);
          saveBudget(b); rerender();
        });
      }
      if (t === 'logements') {
        panel.addEventListener('click', (e) => { const b = e.target.closest('[data-hotel-edit]'); if (b) J.editor.hotel(b.dataset.hotelEdit); });
      }
      if (t === 'donnees') {
        panel.addEventListener('click', async (e) => {
          const b = e.target.closest('button, [data-theme-set]');
          if (!b) return;
          if (b.hasAttribute('data-theme-set')) { e.preventDefault(); J.setTheme(b.dataset.themeSet || null); rerender(); }
          else if (b.hasAttribute('data-voyage-edit')) J.editor.voyage();
          else if (b.dataset.dlFile) J.download(`${b.dataset.dlFile}.json`, J.fileJSON(b.dataset.dlFile));
          else if (b.hasAttribute('data-export')) { await J.fx.flow(b, backup, { done: 'Exporté !' }); }
          else if (b.hasAttribute('data-discard')) {
            if (!(await J.confirm('Tes modifications faites dans le site seront perdues ; le contenu des fichiers JSON sera réaffiché.', { ok: 'Revenir aux fichiers' }))) return;
            J.discardEdits(); J.toast('Contenu rechargé depuis les fichiers');
          } else if (b.hasAttribute('data-reset-all')) {
            if (!(await J.confirm('Réinitialiser toutes les données enregistrées sur cet appareil ?', { title: 'Réinitialiser', ok: 'Réinitialiser' }))) return;
            ['fait', 'checklist', 'budget'].forEach((k) => J.store.remove(k));
            await J.photos.clear();
            J.discardEdits(); J.toast('🔄 Réinitialisé');
          }
        });
        J.$('[data-import]', panel).addEventListener('change', async (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) await importFile(f); });
      }
    },
  };
})();
