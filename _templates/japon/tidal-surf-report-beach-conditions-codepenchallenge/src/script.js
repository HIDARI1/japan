// ── FORECAST DATA ─────────────────────────────────────────────────
const FORECAST = [
	{
		day: "Mon",
		date: "Jun 2",
		icon: "🌊",
		height: 4.2,
		wind: "12kn NW",
		rating: 4,
		condition: "good"
	},
	{
		day: "Tue",
		date: "Jun 3",
		icon: "🌊",
		height: 5.1,
		wind: "8kn NW",
		rating: 5,
		condition: "epic"
	},
	{
		day: "Wed",
		date: "Jun 4",
		icon: "⛅",
		height: 4.8,
		wind: "10kn W",
		rating: 4,
		condition: "good"
	},
	{
		day: "Thu",
		date: "Jun 5",
		icon: "🌤",
		height: 3.2,
		wind: "15kn SW",
		rating: 3,
		condition: "fair"
	},
	{
		day: "Fri",
		date: "Jun 6",
		icon: "☀️",
		height: 2.8,
		wind: "18kn S",
		rating: 2,
		condition: "poor"
	},
	{
		day: "Sat",
		date: "Jun 7",
		icon: "🌊",
		height: 3.9,
		wind: "11kn NW",
		rating: 4,
		condition: "good"
	},
	{
		day: "Sun",
		date: "Jun 8",
		icon: "🌊",
		height: 4.5,
		wind: "9kn NW",
		rating: 4,
		condition: "good"
	}
];

const COND_COLORS = {
	epic: "#00B4C6",
	good: "#4CE0A0",
	fair: "#E8D5A3",
	poor: "rgba(240,244,247,.3)"
};

function miniWaveSVG(height, color) {
	const amp = (height / 6) * 12;
	const y = 12;
	return `<svg viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,${y} C10,${y - amp} 20,${y - amp * 1.2} 30,${y} C40,${
		y + amp * 0.5
	} 50,${y + amp * 0.3} 60,${y} C70,${y - amp * 0.8} 76,${
		y - amp * 0.4
	} 80,${y}" 
          fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}

function renderForecast() {
	const grid = document.getElementById("forecast-grid");
	grid.innerHTML = FORECAST.map((d, i) => {
		const isToday = i === 0;
		const stars = Array(5)
			.fill(0)
			.map(
				(_, s) => `<span class="fc-star${s >= d.rating ? " dim" : ""}">★</span>`
			)
			.join("");
		const color = COND_COLORS[d.condition];
		return `
<div class="forecast-card reveal${
			isToday ? " today" : ""
		}" style="transition-delay:${i * 0.06}s">
  <div class="fc-day">${d.day}<br>${d.date}</div>
  <div class="fc-icon">${d.icon}</div>
  <div class="fc-height">${d.height}<small>ft</small></div>
  <div class="fc-wind">${d.wind}</div>
  <div class="fc-wave-bar">${miniWaveSVG(d.height, color)}</div>
  <div class="fc-rating">${stars}</div>
</div>`;
	}).join("");
}
renderForecast();

// ── PROCEDURAL HERO WAVES (randomized, seamless loop) ─────────────
(function buildHeroWaves() {
	const svg = document.getElementById("hero-wave-svg");
	if (!svg) return;
	const NS = "http://www.w3.org/2000/svg";
	const W = 1440,
		H = 240;
	const rand = (a, b) => a + Math.random() * (b - a);
	const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	// seamless scroll keyframes (one tile = W user units)
	if (!document.getElementById("hero-wave-kf")) {
		const st = document.createElement("style");
		st.id = "hero-wave-kf";
		st.textContent =
			"@keyframes heroWaveScroll{from{transform:translateX(0)}to{transform:translateX(-" +
			W +
			"px)}}" +
			".hwave{will-change:transform}";
		document.head.appendChild(st);
	}

	// periodic wave: sum of sines with INTEGER cycles over W → loops seamlessly,
	// but random amplitudes + phases make every crest unique (non-uniform).
	function makeWave(baseY, octaves) {
		const comps = octaves.map((o) => ({
			k: o.k,
			amp: o.amp * rand(0.7, 1.25),
			ph: rand(0, Math.PI * 2)
		}));
		return (x) => {
			let y = baseY;
			for (const c of comps)
				y -= c.amp * Math.sin((2 * Math.PI * c.k * x) / W + c.ph);
			return y;
		};
	}

	// sample two tiles wide so the loop has no gap / cut-off edge
	function topLine(fn) {
		const step = 6;
		let d = "M 0 " + fn(0).toFixed(1);
		for (let x = step; x <= 2 * W; x += step)
			d += " L " + x + " " + fn(x).toFixed(1);
		return d;
	}

	// local minima of y = wave crests, within one tile
	function crests(fn) {
		const step = 4,
			pts = [];
		let prev = fn(-step),
			cur = fn(0);
		for (let x = 0; x < W; x += step) {
			const nxt = fn(x + step);
			if (cur < prev && cur < nxt) pts.push({ x, y: cur });
			prev = cur;
			cur = nxt;
		}
		return pts;
	}

	const layers = [
		{
			baseY: 108,
			oct: [
				{ k: 1, amp: 32 },
				{ k: 2, amp: 15 },
				{ k: 3, amp: 8 }
			],
			fill: "url(#wg1)",
			dur: 27,
			rev: false,
			foam: "rgba(150,205,235,0.10)",
			fw: 1.5,
			dots: 0
		},
		{
			baseY: 130,
			oct: [
				{ k: 1, amp: 28 },
				{ k: 2, amp: 17 },
				{ k: 4, amp: 9 }
			],
			fill: "url(#wg2)",
			dur: 21,
			rev: true,
			foam: "rgba(190,225,250,0.16)",
			fw: 2,
			dots: 3
		},
		{
			baseY: 156,
			oct: [
				{ k: 2, amp: 20 },
				{ k: 3, amp: 13 },
				{ k: 5, amp: 7 }
			],
			fill: "url(#wg3)",
			dur: 15,
			rev: false,
			foam: "rgba(215,238,255,0.20)",
			fw: 2.4,
			dots: 4
		},
		{
			baseY: 188,
			oct: [
				{ k: 2, amp: 14 },
				{ k: 4, amp: 9 },
				{ k: 6, amp: 6 }
			],
			fill: "#03111E",
			dur: 11,
			rev: true,
			foam: "rgba(240,248,255,0.22)",
			fw: 2,
			dots: 5
		}
	];

	layers.forEach((L) => {
		const fn = makeWave(L.baseY, L.oct);
		const line = topLine(fn);
		const g = document.createElementNS(NS, "g");
		g.setAttribute("class", "hwave");
		if (!reduce)
			g.style.animation =
				"heroWaveScroll " + L.dur + "s linear infinite" + (L.rev ? " reverse" : "");

		const body = document.createElementNS(NS, "path");
		body.setAttribute("d", line + " L " + 2 * W + " " + H + " L 0 " + H + " Z");
		body.setAttribute("fill", L.fill);
		g.appendChild(body);

		const crest = document.createElementNS(NS, "path");
		crest.setAttribute("d", line);
		crest.setAttribute("fill", "none");
		crest.setAttribute("stroke", L.foam);
		crest.setAttribute("stroke-width", L.fw);
		crest.setAttribute("stroke-linecap", "round");
		g.appendChild(crest);

		if (L.dots) {
			const cs = crests(fn);
			for (let i = cs.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[cs[i], cs[j]] = [cs[j], cs[i]];
			}
			cs.slice(0, L.dots).forEach((p) => {
				[0, W].forEach((off) => {
					// duplicate into 2nd tile so foam scrolls seamlessly
					const c = document.createElementNS(NS, "circle");
					c.setAttribute("cx", (p.x + off).toFixed(1));
					c.setAttribute("cy", p.y.toFixed(1));
					c.setAttribute("r", rand(1.5, 3).toFixed(1));
					c.setAttribute(
						"fill",
						"rgba(220,240,255," + rand(0.15, 0.3).toFixed(2) + ")"
					);
					g.appendChild(c);
				});
			});
		}
		svg.appendChild(g);
	});
})();

// ── GSAP HERO ANIMATIONS ──────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// Hero entrance
const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
tl
	.to("#hero-badge", { opacity: 1, y: 0, duration: 0.7, delay: 0.2 })
	.to("#hero-h1", { opacity: 1, y: 0, duration: 0.8 }, "-=.4")
	.to("#hero-sub", { opacity: 1, y: 0, duration: 0.7 }, "-=.5")
	.to("#hero-chips", { opacity: 1, y: 0, duration: 0.7 }, "-=.4");

// Chip counter animations
function animateCounter(el, target, suffix, decimals = 1) {
	const obj = { val: 0 };
	gsap.to(obj, {
		val: target,
		duration: 1.8,
		delay: 1.2,
		ease: "power2.out",
		onUpdate() {
			el.innerHTML = obj.val.toFixed(decimals) + `<span>${suffix}</span>`;
		}
	});
}
animateCounter(document.getElementById("chip-wave"), 4.2, "ft");
animateCounter(document.getElementById("chip-wind"), 12, "kn", 0);
animateCounter(document.getElementById("chip-period"), 11, "s", 0);

// ── SCROLL REVEALS ────────────────────────────────────────────────
ScrollTrigger.batch(".reveal, .reveal-left, .reveal-scale", {
	onEnter: (els) => {
		gsap.to(els, {
			opacity: 1,
			y: 0,
			x: 0,
			scale: 1,
			duration: 0.7,
			stagger: 0.08,
			ease: "power2.out"
		});
	},
	start: "top 88%",
	once: true
});

// ── TIDE CHART DRAW-IN ────────────────────────────────────────────
ScrollTrigger.create({
	trigger: "#tide-svg",
	start: "top 80%",
	once: true,
	onEnter() {
		document.getElementById("tide-path").classList.add("drawn");
	}
});

// ── NAV SOLID ON SCROLL ───────────────────────────────────────────
const nav = document.getElementById("nav");
ScrollTrigger.create({
	start: "top -60",
	onUpdate(self) {
		nav.classList.toggle("solid", self.scroll() > 60);
	}
});

// ── MOBILE NAV ───────────────────────────────────────────────────
const ham = document.getElementById("hamburger");
const mob = document.getElementById("mob-nav");
let mobOpen = false;
ham.addEventListener("click", () => {
	mobOpen = !mobOpen;
	ham.classList.toggle("open", mobOpen);
	mob.classList.toggle("open", mobOpen);
	document.body.style.overflow = mobOpen ? "hidden" : "";
});
function closeMob() {
	mobOpen = false;
	ham.classList.remove("open");
	mob.classList.remove("open");
	document.body.style.overflow = "";
}

// ── NEWSLETTER FORM ───────────────────────────────────────────────
function handleSignup(e) {
	e.preventDefault();
	document.querySelector(".cta-form").style.display = "none";
	document.getElementById("signup-success").style.display = "block";
}

// ── LIVE DATA TICKER ──────────────────────────────────────────────
// Simulate slight fluctuations in wave height
setInterval(() => {
	const delta = (Math.random() - 0.5) * 0.1;
	const current = parseFloat(document.getElementById("chip-wave").textContent);
	const next = Math.max(3.5, Math.min(5.0, current + delta));
	document.getElementById("chip-wave").innerHTML =
		next.toFixed(1) + "<span>ft</span>";
}, 4000);
