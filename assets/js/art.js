/* Japon 2026 — illustrations SVG (hero, villes, motif seigaiha). Tout est vectoriel et suit le thème via les variables CSS. */
'use strict';
(function () {
  const J = window.J;
  const A = (J.art = {});

  /* ---------- Motif seigaiha (vagues en écailles) ---------- */
  A.seigaihaPattern = (id, stroke = 'var(--c)', fill = 'var(--surface)') => {
    const centers = [[20, -10], [0, 0], [40, 0], [20, 10], [0, 20], [40, 20], [20, 30]];
    const scale = ([x, y]) => `<circle cx="${x}" cy="${y}" r="19" style="fill:${fill};stroke:${stroke}"/>` +
      [14, 9, 4].map((r) => `<circle cx="${x}" cy="${y}" r="${r}" style="fill:none;stroke:${stroke}"/>`).join('');
    return `<pattern id="${id}" width="40" height="20" patternUnits="userSpaceOnUse"><g stroke-width="1.2">${centers.map(scale).join('')}</g></pattern>`;
  };

  /* ---------- Hero : soleil (lune la nuit), Fuji, brumes ---------- */
  A.heroMountain = () => `
    <svg class="hero-mount" viewBox="0 0 1000 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="heroSun" cx="40%" cy="36%" r="70%">
          <stop offset="0" style="stop-color:var(--sun-hi)"/>
          <stop offset=".62" style="stop-color:var(--sun)"/>
          <stop offset="1" style="stop-color:var(--sun-lo)"/>
        </radialGradient>
        <radialGradient id="heroGlow">
          <stop offset=".5" style="stop-color:var(--sun-glow)"/>
          <stop offset="1" style="stop-color:var(--sun-glow);stop-opacity:0"/>
        </radialGradient>
      </defs>
      <circle cx="600" cy="168" r="170" fill="url(#heroGlow)"/>
      <circle cx="600" cy="168" r="108" fill="url(#heroSun)"/>
      <path d="M0 338 C90 312 170 300 250 318 C320 334 360 322 420 330 C560 350 700 302 820 312 C900 320 950 306 1000 298 L1000 420 L0 420 Z" style="fill:var(--mount-far)"/>
      <path d="M140 420 C330 396 430 236 466 158 L482 152 L496 160 L512 149 L528 158 L544 151 L560 158 C596 236 696 396 890 420 Z" style="fill:var(--mount)"/>
      <path d="M466 158 L482 152 L496 160 L512 149 L528 158 L544 151 L560 158 C569 177 578 197 589 220 L576 212 L564 234 L550 219 L537 243 L523 222 L509 240 L496 218 L483 233 L472 213 L458 226 L448 208 C455 191 461 174 466 158 Z" style="fill:var(--snow)"/>
      <g style="fill:var(--mist)">
        <rect x="380" y="250" width="230" height="8" rx="4"/>
        <rect x="590" y="214" width="170" height="6" rx="3"/>
        <rect x="260" y="296" width="150" height="6" rx="3"/>
      </g>
    </svg>`;

  /* ---------- Hero : vagues procédurales (technique adaptée du pen « Tidal », licence MIT) ----------
     Somme de sinus à nombre entier de périodes sur la largeur → boucle sans couture,
     amplitudes et phases aléatoires → crêtes toutes différentes. */
  A.buildWaves = (host) => {
    if (!host) return;
    const NS = 'http://www.w3.org/2000/svg';
    const W = 1440, H = 120;
    const rand = (a, b) => a + Math.random() * (b - a);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    if (!document.getElementById('wave-kf')) {
      const st = document.createElement('style');
      st.id = 'wave-kf';
      st.textContent = `@keyframes waveScroll{from{transform:translateX(0)}to{transform:translateX(-${W}px)}}`;
      document.head.append(st);
    }
    const wave = (baseY, oct) => {
      const comps = oct.map((o) => ({ k: o.k, amp: o.amp * rand(0.75, 1.2), ph: rand(0, Math.PI * 2) }));
      return (x) => comps.reduce((y, c) => y - c.amp * Math.sin((2 * Math.PI * c.k * x) / W + c.ph), baseY);
    };
    const line = (fn) => { let d = `M0 ${fn(0).toFixed(1)}`; for (let x = 6; x <= 2 * W; x += 6) d += ` L${x} ${fn(x).toFixed(1)}`; return d; };
    const layers = [
      { y: 40, oct: [{ k: 1, amp: 14 }, { k: 2, amp: 7 }, { k: 3, amp: 4 }], fill: 'var(--wave-1)', dur: 46, rev: false, foam: 1.4 },
      { y: 60, oct: [{ k: 1, amp: 12 }, { k: 2, amp: 8 }, { k: 4, amp: 4 }], fill: 'var(--wave-2)', dur: 34, rev: true, foam: 1.8 },
      { y: 80, oct: [{ k: 2, amp: 9 }, { k: 3, amp: 6 }, { k: 5, amp: 3 }], fill: 'var(--wave-3)', dur: 26, rev: false, foam: 2 },
      { y: 104, oct: [{ k: 2, amp: 6 }, { k: 4, amp: 4 }, { k: 6, amp: 2.5 }], fill: 'var(--bg)', dur: 20, rev: true, foam: 0 },
    ];
    layers.forEach((L) => {
      const fn = wave(L.y, L.oct);
      const d = line(fn);
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'hwave');
      if (!reduce) g.style.animation = `waveScroll ${L.dur}s linear infinite${L.rev ? ' reverse' : ''}`;
      const body = document.createElementNS(NS, 'path');
      body.setAttribute('d', `${d} L${2 * W} ${H} L0 ${H} Z`);
      body.style.fill = L.fill;
      g.append(body);
      if (L.foam) {
        const crest = document.createElementNS(NS, 'path');
        crest.setAttribute('d', d);
        crest.setAttribute('fill', 'none');
        crest.style.stroke = 'var(--foam)';
        crest.setAttribute('stroke-width', L.foam);
        crest.setAttribute('stroke-linecap', 'round');
        g.append(crest);
      }
      svg.append(g);
    });
    host.replaceChildren(svg);
  };

  /* ---------- Illustrations des villes (viewBox 200×140) ---------- */
  const ground = (id) => `<rect x="0" y="112" width="200" height="28" fill="url(#${id})" opacity=".55"/>`;
  const roof = (cx, eave, top, half, topHalf) =>
    `<path d="M${cx - half} ${eave - 5} Q${cx - half + 8} ${eave} ${cx - half + 20} ${eave} L${cx + half - 20} ${eave} Q${cx + half - 8} ${eave} ${cx + half} ${eave - 5} L${cx + topHalf} ${top} L${cx - topHalf} ${top} Z"/>`;

  const torii = (cx, by, s) => `
    <g transform="translate(${cx} ${by}) scale(${s})">
      <path d="M-37 -64 Q0 -57 37 -64 L35 -57 Q0 -51 -35 -57 Z" style="fill:var(--art-ink)"/>
      <rect x="-31" y="-56" width="62" height="5" style="fill:var(--c)"/>
      <rect x="-29" y="-42" width="58" height="4.5" style="fill:var(--c)"/>
      <rect x="-2.2" y="-51" width="4.4" height="9" style="fill:var(--c)"/>
      <rect x="-25" y="-56" width="6.5" height="56" style="fill:var(--c)"/>
      <rect x="18.5" y="-56" width="6.5" height="56" style="fill:var(--c)"/>
      <rect x="-25.5" y="-7" width="7.5" height="7" style="fill:var(--art-ink)"/>
      <rect x="18" y="-7" width="7.5" height="7" style="fill:var(--art-ink)"/>
    </g>`;

  const pagoda = (cx, by, s) => {
    let g = '';
    for (let i = 0; i < 5; i++) {
      const y = -10 - i * 15, w = 30 - i * 3.6;
      g += `<rect x="${-w * 0.36}" y="${y - 8}" width="${w * 0.72}" height="9" style="fill:var(--c);opacity:.95"/>`;
      g += `<path d="M${-w} ${y - 6} Q${-w + 6} ${y - 2} ${-w + 12} ${y - 3} L${w - 12} ${y - 3} Q${w - 6} ${y - 2} ${w} ${y - 6} L${w * 0.55} ${y - 12} L${-w * 0.55} ${y - 12} Z" style="fill:var(--art-ink)"/>`;
    }
    g += '<rect x="-1" y="-104" width="2" height="22" style="fill:var(--art-ink)"/>';
    [-100, -95, -90].forEach((y) => (g += `<rect x="-4" y="${y}" width="8" height="1.6" style="fill:var(--art-ink)"/>`));
    return `<g transform="translate(${cx} ${by}) scale(${s})"><rect x="-12" y="-4" width="24" height="4" style="fill:var(--art-ink)"/>${g}</g>`;
  };

  const scenes = {
    osaka: (id) => `
      <circle cx="146" cy="44" r="24" style="fill:var(--c);opacity:.9"/>
      ${ground(id)}
      <path d="M44 140 L56 110 H144 L156 140 Z" style="fill:var(--art-ink);opacity:.82"/>
      <g style="fill:var(--art-paper);stroke:var(--art-ink);stroke-width:1.2">
        <rect x="64" y="96" width="72" height="14"/><rect x="73" y="76" width="54" height="12"/>
        <rect x="81" y="58" width="38" height="11"/><rect x="88" y="43" width="24" height="9"/>
      </g>
      <g style="fill:var(--art-ink)">
        ${roof(100, 99, 89, 54, 32)}${roof(100, 79, 70, 42, 22)}${roof(100, 61, 53, 32, 14)}${roof(100, 45, 36, 22, 5)}
        <circle cx="94" cy="34" r="2.4"/><circle cx="106" cy="34" r="2.4"/>
      </g>
      <g style="fill:var(--art-ink);opacity:.55"><rect x="70" y="101" width="5" height="5"/><rect x="88" y="101" width="5" height="5"/><rect x="107" y="101" width="5" height="5"/><rect x="125" y="101" width="5" height="5"/></g>`,
    kyoto: (id) => `
      <circle cx="54" cy="40" r="22" style="fill:var(--c);opacity:.3"/>
      ${ground(id)}
      ${torii(48, 118, 0.42)}${torii(76, 124, 0.6)}${torii(112, 131, 0.82)}${torii(160, 141, 1.12)}`,
    nara: (id) => `
      <circle cx="50" cy="42" r="20" style="fill:var(--c);opacity:.45"/>
      ${ground(id)}
      <g style="fill:var(--art-ink)">
        <rect x="74" y="130" width="52" height="10" rx="1"/><rect x="83" y="124" width="34" height="7"/>
        <rect x="93" y="90" width="14" height="35"/>
        <path d="M78 92 H122 L115 83 H85 Z"/>
        <rect x="86" y="60" width="28" height="24"/>
        <path d="M66 63 L76 57 L100 43 L124 57 L134 63 Q100 57 66 63 Z"/>
        <circle cx="100" cy="38" r="5"/><rect x="98.5" y="30" width="3" height="5"/>
      </g>
      <rect x="93" y="65" width="14" height="13" style="fill:var(--c)"/>
      <g style="fill:var(--art-ink);opacity:.82">
        <ellipse cx="152" cy="113" rx="17" ry="8"/>
        <path d="M161 110 L171 95 L177 97 L168 114 Z"/>
        <ellipse cx="177" cy="94" rx="7" ry="4.2" transform="rotate(-14 177 94)"/>
        <path d="M171 91 L167 85 L174 89 Z"/>
        <rect x="139" y="117" width="2.6" height="22"/><rect x="144" y="118" width="2.6" height="21"/>
        <rect x="158" y="118" width="2.6" height="21"/><rect x="163" y="117" width="2.6" height="22"/>
      </g>
      <path d="M175 90 L177 80 M176.5 84 L182 79 M176 86 L171 80" style="fill:none;stroke:var(--art-ink);stroke-width:1.6;stroke-linecap:round;opacity:.82"/>`,
    fuji: (id) => `
      <circle cx="132" cy="36" r="16" style="fill:var(--shu)"/>
      <path d="M-4 140 C40 132 72 96 88 56 L96 52 L104 56 C120 96 152 132 196 140 Z" style="fill:var(--c)"/>
      <path d="M88 56 L96 52 L104 56 C107 64 110 71 114 79 L107 75 L101 83 L95 76 L88 84 L82 75 L76 79 C80 71 84 64 88 56 Z" style="fill:var(--snow)"/>
      ${ground(id)}
      ${pagoda(166, 140, 0.92)}`,
    tokyo: (id) => `
      <circle cx="152" cy="42" r="20" style="fill:var(--c);opacity:.32"/>
      ${ground(id)}
      <g style="fill:none;stroke:var(--c);stroke-width:2.6;stroke-linecap:round">
        <path d="M80 140 Q93 92 99 34 M120 140 Q107 92 101 34"/>
        <path d="M86 118 L114 118 M83 130 L117 130 M89 104 L111 104 M93 76 L107 76"/>
        <path d="M86 116 L112 106 M114 116 L88 106 M89 102 L109 80 M111 102 L91 80"/>
        <path d="M100 34 V8"/>
      </g>
      <rect x="86" y="86" width="28" height="7" rx="1" style="fill:var(--c)"/>
      <rect x="93" y="56" width="14" height="6" rx="1" style="fill:var(--c)"/>
      <g style="fill:var(--art-ink);opacity:.85">
        <rect x="6" y="104" width="22" height="36"/><rect x="30" y="92" width="18" height="48"/><rect x="50" y="114" width="24" height="26"/>
        <rect x="126" y="108" width="20" height="32"/><rect x="148" y="88" width="16" height="52"/><rect x="166" y="100" width="28" height="40"/>
      </g>
      <g style="fill:var(--sun);opacity:.8"><rect x="34" y="98" width="3" height="4"/><rect x="40" y="108" width="3" height="4"/><rect x="152" y="96" width="3" height="4"/><rect x="157" y="112" width="3" height="4"/><rect x="172" y="108" width="3" height="4"/></g>`,
    trajet: (id) => `
      <path d="M30 70 C52 60 62 44 70 34 L74 32 L78 34 C86 44 96 60 118 70 Z" style="fill:var(--c);opacity:.35"/>
      ${ground(id)}
      <path d="M8 104 L120 104 C158 104 182 99 195 88 C178 75 152 70 122 70 L8 70 Z" style="fill:var(--art-paper);stroke:var(--art-ink);stroke-width:2"/>
      <path d="M12 78 H118 C140 78 156 80 168 84 L164 88 H12 Z" style="fill:var(--art-ink);opacity:.85"/>
      <rect x="8" y="94" width="150" height="4" style="fill:var(--ai)"/>
      <path d="M2 112 H198" style="stroke:var(--art-ink);stroke-width:2"/>
      <g style="stroke:var(--art-ink);stroke-width:1.5;opacity:.5"><path d="M10 116 v6 M30 116 v6 M50 116 v6 M70 116 v6 M90 116 v6 M110 116 v6 M130 116 v6 M150 116 v6 M170 116 v6 M190 116 v6"/></g>
      <g style="stroke:var(--muted);stroke-width:2;stroke-linecap:round"><path d="M-4 80 H-20 M-2 90 H-26"/></g>`,
  };

  /* ---------- Tidal : séparateurs de section en vague ---------- */
  const DIVIDERS = [
    'M0,80 L0,30 C200,70 400,10 600,40 C800,70 1000,10 1200,35 C1340,52 1400,42 1440,38 L1440,80 Z',
    'M0,0 C300,60 600,80 900,40 C1100,15 1300,60 1440,50 L1440,80 L0,80 Z',
    'M0,80 L0,45 C180,20 360,70 540,45 C720,20 900,65 1080,40 C1220,22 1360,55 1440,42 L1440,80 Z',
    'M0,0 C240,80 480,40 720,60 C960,80 1200,20 1440,50 L1440,80 L0,80 Z',
  ];
  A.divider = (from, to, v = 0) => `<div class="wave-divider" aria-hidden="true"><svg viewBox="0 0 1440 80" preserveAspectRatio="none" style="background:var(${from})"><path d="${DIVIDERS[v % 4]}" style="fill:var(${to})"/></svg></div>`;

  /* ---------- Tidal : mini-vague des cartes « prévisions » (amplitude = nombre d'activités) ---------- */
  A.miniWave = (ratio) => {
    const amp = Math.max(1.5, ratio * 9), y = 12;
    return `<svg viewBox="0 0 80 24" aria-hidden="true" focusable="false"><path d="M0,${y} C10,${y - amp} 20,${y - amp * 1.2} 30,${y} C40,${y + amp * 0.5} 50,${y + amp * 0.3} 60,${y} C70,${y - amp * 0.8} 76,${y - amp * 0.4} 80,${y}" fill="none" style="stroke:var(--c)" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  };

  /* ---------- Tidal : courbe « marée » = rythme du voyage (activités par jour) ---------- */
  A.rhythmChart = (width) => {
    const days = J.data.jours;
    const W = Math.max(300, Math.round(width)), H = W < 560 ? 230 : 270;
    const L = 34, R = W - 14, T = 34, B = H - 46;
    const vals = days.map((d) => d.activites.length);
    const max = Math.max(4, ...vals);
    const x = (i) => L + (i * (R - L)) / Math.max(1, days.length - 1);
    const y = (v) => B - (v / max) * (B - T);
    const pts = vals.map((v, i) => [x(i), y(v)]);
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    const grid = [0, Math.round(max / 2), max].map((v) => `<line x1="${L}" y1="${y(v)}" x2="${R}" y2="${y(v)}" class="rc-grid"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="rc-axis">${v}</text>`).join('');
    const small = W < 560;
    const labels = days.map((day, i) => (small && i % 2 && i !== days.length - 1) ? '' : `<text x="${x(i)}" y="${B + 20}" text-anchor="middle" class="rc-axis">J${i + 1}</text>`).join('');
    const hi = vals.indexOf(Math.max(...vals));
    const today = J.todayDay();
    const ti = today ? J.dayIndex(today.id) : -1;
    const dots = days.map((day, i) => `<a href="#/jour/${day.id}" aria-label="J${i + 1} : ${J.plural(vals[i], 'activité', 'activités')}"><circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="${small ? 4.5 : 5.5}" class="rc-dot c-${J.dayColorCity(day)}"/></a>`).join('');
    return `<svg class="rhythm fx-draw" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Nombre d'activités par jour, du J1 au J${days.length}">
      <defs><linearGradient id="rcFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--shu);stop-opacity:.22"/><stop offset="1" style="stop-color:var(--shu);stop-opacity:0"/></linearGradient></defs>
      ${grid}${labels}
      <path d="${d} L${R},${B} L${L},${B} Z" fill="url(#rcFill)" class="rc-area"/>
      <path d="${d}" pathLength="1000" class="rc-line draw-path"/>
      <text x="${pts[hi][0]}" y="${pts[hi][1] - 14}" text-anchor="middle" class="rc-peak">${vals[hi]} act.</text>
      ${ti > -1 ? `<g class="rc-now"><line x1="${x(ti)}" y1="${T - 10}" x2="${x(ti)}" y2="${B}"/><rect x="${x(ti) - 44}" y="${T - 30}" width="88" height="18" rx="3"/><text x="${x(ti)}" y="${T - 17}" text-anchor="middle">AUJOURD’HUI</text></g>` : ''}
      ${dots}
    </svg>`;
  };

  A.city = (cityId) => {
    const id = `sg-${cityId}`;
    const scene = scenes[cityId] || scenes.trajet;
    return `<svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>${A.seigaihaPattern(id)}</defs>${scene(id)}</svg>`;
  };
})();
