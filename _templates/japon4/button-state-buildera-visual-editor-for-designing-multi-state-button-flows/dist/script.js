// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════
function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function buildGradientCSS(g) {
  const stops = g.stops.map((s) => `${s.color} ${s.pos}%`).join(", ");
  if (g.type === "radial") return `radial-gradient(circle, ${stops})`;
  if (g.type === "conic") return `conic-gradient(from ${g.angle}deg, ${stops})`;
  return `linear-gradient(${g.angle}deg, ${stops})`;
}
function isLight(hex) {
  if (!hex || !hex.startsWith("#")) return false;
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
}

// ═══════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════
const ICONS = {
  bolt:
    '<path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM11 20v-5.5H9L13 9v5.5h2L11 20z"/>',
  star:
    '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
  heart:
    '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
  send: '<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>',
  arrow:
    '<path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>',
  check: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>',
  lock:
    '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>',
  plus: '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>',
  search:
    '<path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>',
  download: '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>',
  upload: '<path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>',
  refresh:
    '<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>',
  settings:
    '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>',
  bell:
    '<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>',
  user:
    '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
  magic:
    '<path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29a.9959.9959 0 00-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05a.9959.9959 0 000-1.41l-2.33-2.35zm-1.03 5.49l-2.12-2.12 2.44-2.44 2.12 2.12-2.44 2.44z"/>',
  flame:
    '<path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>',
  sparkle: '<path d="M12 1L9 9H1l6.5 5-2.5 8L12 18l7 4-2.5-8L23 9h-8z"/>',
  eye:
    '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>',
  rocket:
    '<path d="M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 14l3 3-.97 3.43L7.03 19 10 22l1.77-3.62c.31-.13 3.58-1.53 5.87-3.57l-8.45-8.46zM21.26 4c.1-.47-.04-.96-.38-1.3-.34-.34-.83-.48-1.3-.38l-4.3.93c-.56.12-1.53.59-2.17 1.23l1.75 1.75 4.26-1.02-1.02 4.26 1.75 1.75c.64-.64 1.11-1.61 1.23-2.17L21.26 4z"/>',
  game:
    '<path d="M15 7.5V2H9v5.5l3 3 3-3zM7.5 9H2v6h5.5l3-3-3-3zM9 16.5V22h6v-5.5l-3-3-3 3zM16.5 9l-3 3 3 3H22V9h-5.5z"/>',
  warning: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>',
  trash:
    '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>',
  shield:
    '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>'
};

const GRAD_SPEEDS = { slow: "3s", normal: "1.8s", fast: "0.9s" };
const SB_EASINGS = {
  spring: "cubic-bezier(0.34,1.56,0.64,1)",
  ease: "cubic-bezier(0.4,0,0.2,1)",
  snap: "cubic-bezier(0.9,0,1,1)",
  bounce: "cubic-bezier(0.68,-0.55,0.27,1.55)",
  gentle: "cubic-bezier(0.25,0.46,0.45,0.94)",
  linear: "linear"
};
const TRANS_SPEED = {
  quick: { bg: 200, out: 90, in: 130 },
  normal: { bg: 360, out: 150, in: 210 },
  slow: { bg: 560, out: 230, in: 310 }
};
const WIDTH_MAP = { full: "100%", pill: "160px", circle: "48px", auto: "auto" };
const EASINGS = {
  spring: {
    label: "Spring",
    curve: "M2,22 C8,22 10,2 34,2",
    css: "cubic-bezier(0.34,1.56,0.64,1)"
  },
  ease: {
    label: "Ease",
    curve: "M2,22 C14,22 20,2 34,2",
    css: "cubic-bezier(0.4,0,0.2,1)"
  },
  linear: { label: "Linear", curve: "M2,22 L34,2", css: "linear" },
  bounce: {
    label: "Bounce",
    curve: "M2,22 C6,22 8,-4 14,14 C18,28 26,-2 34,2",
    css: "cubic-bezier(0.68,-0.55,0.27,1.55)"
  },
  snap: {
    label: "Snap",
    curve: "M2,22 L28,22 L34,2",
    css: "cubic-bezier(0.9,0,1,1)"
  },
  gentle: {
    label: "Gentle",
    curve: "M2,22 C10,22 24,6 34,2",
    css: "cubic-bezier(0.25,0.46,0.45,0.94)"
  }
};
const RADII = [
  { label: "Pill", val: 999, css: "50%" },
  { label: "Lg", val: 16, css: "16px" },
  { label: "Sm", val: 8, css: "8px" },
  { label: "Sq", val: 0, css: "0px" }
];
const SHADOWS = [
  { id: "none", label: "—", val: "" },
  { id: "sm", label: "SM", val: "0 2px 8px rgba(0,0,0,0.18)" },
  { id: "md", label: "MD", val: "0 6px 20px rgba(0,0,0,0.22)" },
  { id: "lg", label: "LG", val: "0 12px 40px rgba(0,0,0,0.28)" },
  { id: "glow", label: "GLW", val: "__glow" }
];
const BORDER_COLORS = [
  "#ffffff",
  "#000000",
  "#BFFF00",
  "#09C12A",
  "#2979FF",
  "#E0307A",
  "#7C3AED"
];
const PRESET_DEFAULTS = {
  transEasing: "spring",
  transSpeed: "normal",
  fontSize: 15,
  fontWeight: 500,
  letterSpacing: 0,
  textColor: "auto",
  radius: 999,
  shadow: "none",
  border: "none",
  borderColor: "#ffffff",
  iconAnim: "none",
  iconAnimSpeed: "normal",
  iconAnimTrigger: "always"
};
const D = (s) => ({
  ...PRESET_DEFAULTS,
  ...s,
  grad: s.grad
    ? { ...s.grad, stops: s.grad.stops.map((t) => ({ ...t })) }
    : {
        type: "linear",
        angle: 90,
        stops: [
          { color: s.bg || "#111", pos: 0 },
          { color: s.bg || "#333", pos: 100 }
        ],
        animate: false,
        speed: "normal"
      }
});

const ALL_PRESETS = {
  checkout: [
    D({
      id: "pay",
      label: "Pay",
      bgType: "solid",
      bg: "#111111",
      width: "full",
      content: "icon",
      text: "Pay $129",
      anim: "shimmer",
      hover: "scale",
      icon: "lock",
      iconPos: "left",
      iconSize: 18,
      iconColor: "#BFFF00",
      iconAnim: "none",
      duration: 1800,
      next: "confirm",
      transEasing: "snap",
      transSpeed: "quick",
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: 1,
      radius: 12,
      shadow: "md",
      border: "none"
    }),
    D({
      id: "confirm",
      label: "Confirm",
      bgType: "solid",
      bg: "#1a1a2e",
      width: "full",
      content: "icon",
      text: "Confirming…",
      anim: "none",
      hover: "none",
      icon: "lock",
      iconPos: "left",
      iconSize: 18,
      iconColor: "#BFFF00",
      iconAnim: "pulse",
      iconAnimSpeed: "slow",
      duration: 1400,
      next: "auth",
      transEasing: "ease",
      transSpeed: "quick",
      fontSize: 14,
      fontWeight: 500,
      letterSpacing: 0.5,
      radius: 12,
      shadow: "none",
      border: "outline",
      borderColor: "#BFFF00"
    }),
    D({
      id: "auth",
      label: "Auth",
      bgType: "gradient",
      bg: "#7C3AED",
      grad: {
        type: "linear",
        angle: 90,
        stops: [
          { color: "#4C1D95", pos: 0 },
          { color: "#7C3AED", pos: 50 },
          { color: "#4C1D95", pos: 100 }
        ],
        animate: true,
        speed: "fast"
      },
      width: "pill",
      content: "spinner",
      text: "",
      anim: "none",
      hover: "none",
      icon: "lock",
      iconPos: "left",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "none",
      duration: 1800,
      next: "charging",
      transEasing: "ease",
      transSpeed: "quick"
    }),
    D({
      id: "charging",
      label: "Charging",
      bgType: "solid",
      bg: "#1a1a1a",
      width: "full",
      content: "icon",
      text: "Charging card…",
      anim: "none",
      hover: "none",
      icon: "bolt",
      iconPos: "left",
      iconSize: 18,
      iconColor: "#FF6C2F",
      iconAnim: "pulse",
      iconAnimSpeed: "fast",
      duration: 2000,
      next: "success",
      transEasing: "ease",
      transSpeed: "normal",
      fontSize: 14,
      fontWeight: 500,
      radius: 12,
      shadow: "none",
      border: "outline",
      borderColor: "#333"
    }),
    D({
      id: "success",
      label: "Success",
      bgType: "solid",
      bg: "#09C12A",
      width: "circle",
      content: "check",
      text: "",
      anim: "none",
      hover: "none",
      icon: "check",
      iconPos: "left",
      iconSize: 20,
      iconColor: "white",
      iconAnim: "none",
      duration: 1600,
      next: "receipt",
      transEasing: "spring",
      transSpeed: "quick",
      radius: 999,
      shadow: "glow"
    }),
    D({
      id: "receipt",
      label: "Receipt",
      bgType: "solid",
      bg: "#0A2E14",
      width: "full",
      content: "icon",
      text: "View receipt",
      anim: "none",
      hover: "lift",
      icon: "arrow",
      iconPos: "right",
      iconSize: 18,
      iconColor: "#09C12A",
      iconAnim: "float",
      iconAnimSpeed: "slow",
      duration: 2200,
      next: "pay",
      transEasing: "spring",
      transSpeed: "normal",
      fontSize: 14,
      fontWeight: 500,
      radius: 12,
      shadow: "none",
      border: "outline",
      borderColor: "#09C12A"
    })
  ],
  ai: [
    D({
      id: "idle",
      label: "Idle",
      bgType: "solid",
      bg: "#111111",
      width: "full",
      content: "icon",
      text: "Generate",
      anim: "shimmer",
      hover: "scale",
      icon: "sparkle",
      iconPos: "right",
      iconSize: 18,
      iconColor: "#BFFF00",
      iconAnim: "wiggle",
      iconAnimSpeed: "slow",
      duration: 1600,
      next: "thinking",
      transEasing: "spring",
      transSpeed: "normal",
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: 0.5,
      radius: 999,
      shadow: "md"
    }),
    D({
      id: "thinking",
      label: "Thinking",
      bgType: "solid",
      bg: "#0D0D1F",
      width: "pill",
      content: "dots",
      text: "",
      anim: "none",
      hover: "none",
      icon: "magic",
      iconPos: "left",
      iconSize: 18,
      iconColor: "#7C3AED",
      iconAnim: "pulse",
      iconAnimSpeed: "slow",
      duration: 1800,
      next: "writing",
      transEasing: "ease",
      transSpeed: "normal",
      radius: 999,
      border: "outline",
      borderColor: "#7C3AED"
    }),
    D({
      id: "writing",
      label: "Writing",
      bgType: "gradient",
      bg: "#7C3AED",
      grad: {
        type: "linear",
        angle: 135,
        stops: [
          { color: "#4C1D95", pos: 0 },
          { color: "#7C3AED", pos: 40 },
          { color: "#2979FF", pos: 100 }
        ],
        animate: true,
        speed: "normal"
      },
      width: "full",
      content: "icon",
      text: "Writing…",
      anim: "none",
      hover: "none",
      icon: "eye",
      iconPos: "left",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "pulse",
      iconAnimSpeed: "fast",
      duration: 2400,
      next: "reviewing",
      transEasing: "ease",
      transSpeed: "normal",
      radius: 999,
      shadow: "glow"
    }),
    D({
      id: "reviewing",
      label: "Reviewing",
      bgType: "solid",
      bg: "#FF6C2F",
      width: "full",
      content: "icon",
      text: "Reviewing…",
      anim: "none",
      hover: "none",
      icon: "eye",
      iconPos: "left",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "pulse",
      iconAnimSpeed: "normal",
      duration: 1500,
      next: "done",
      transEasing: "ease",
      transSpeed: "quick",
      fontSize: 14,
      fontWeight: 500,
      radius: 999
    }),
    D({
      id: "done",
      label: "Done",
      bgType: "solid",
      bg: "#BFFF00",
      width: "full",
      content: "icon",
      text: "Ready — View",
      anim: "none",
      hover: "lift",
      icon: "arrow",
      iconPos: "right",
      iconSize: 18,
      iconColor: "#111",
      iconAnim: "float",
      iconAnimSpeed: "slow",
      duration: 2200,
      next: "idle",
      transEasing: "spring",
      transSpeed: "quick",
      fontSize: 15,
      fontWeight: 700,
      radius: 999,
      shadow: "glow"
    })
  ],
  deployci: [
    D({
      id: "push",
      label: "Push",
      bgType: "solid",
      bg: "#2979FF",
      width: "full",
      content: "icon",
      text: "Push to Deploy",
      anim: "shimmer",
      hover: "lift",
      icon: "upload",
      iconPos: "left",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "float",
      iconAnimSpeed: "slow",
      duration: 1600,
      next: "queue",
      transEasing: "spring",
      transSpeed: "normal",
      fontSize: 15,
      fontWeight: 500,
      radius: 10,
      shadow: "sm"
    }),
    D({
      id: "queue",
      label: "Queue",
      bgType: "solid",
      bg: "#1a1a1a",
      width: "pill",
      content: "dots",
      text: "",
      anim: "none",
      hover: "none",
      icon: "bolt",
      iconPos: "left",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "none",
      duration: 1200,
      next: "build",
      transEasing: "ease",
      transSpeed: "quick",
      radius: 999,
      border: "outline",
      borderColor: "#333"
    }),
    D({
      id: "build",
      label: "Build",
      bgType: "gradient",
      bg: "#7C3AED",
      grad: {
        type: "linear",
        angle: 90,
        stops: [
          { color: "#4C1D95", pos: 0 },
          { color: "#7C3AED", pos: 55 },
          { color: "#4C1D95", pos: 100 }
        ],
        animate: true,
        speed: "normal"
      },
      width: "full",
      content: "icon",
      text: "Building…",
      anim: "none",
      hover: "none",
      icon: "settings",
      iconPos: "left",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "spin",
      iconAnimSpeed: "normal",
      duration: 2200,
      next: "test",
      transEasing: "ease",
      transSpeed: "normal",
      radius: 10
    }),
    D({
      id: "test",
      label: "Test",
      bgType: "solid",
      bg: "#FF6C2F",
      width: "full",
      content: "icon",
      text: "Running tests",
      anim: "none",
      hover: "none",
      icon: "bolt",
      iconPos: "left",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "pulse",
      iconAnimSpeed: "fast",
      duration: 1800,
      next: "ship",
      transEasing: "ease",
      transSpeed: "quick",
      fontSize: 14,
      fontWeight: 500,
      radius: 10
    }),
    D({
      id: "ship",
      label: "Ship",
      bgType: "solid",
      bg: "#E0307A",
      width: "full",
      content: "icon",
      text: "Shipping…",
      anim: "none",
      hover: "none",
      icon: "rocket",
      iconPos: "left",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "bounce",
      iconAnimSpeed: "fast",
      duration: 1600,
      next: "health",
      transEasing: "spring",
      transSpeed: "normal",
      fontSize: 14,
      fontWeight: 500,
      radius: 10
    }),
    D({
      id: "health",
      label: "Health",
      bgType: "gradient",
      bg: "#2979FF",
      grad: {
        type: "linear",
        angle: 90,
        stops: [
          { color: "#1565C0", pos: 0 },
          { color: "#42A5F5", pos: 55 },
          { color: "#1565C0", pos: 100 }
        ],
        animate: true,
        speed: "fast"
      },
      width: "pill",
      content: "spinner",
      text: "",
      anim: "none",
      hover: "none",
      icon: "shield",
      iconPos: "left",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "none",
      duration: 1400,
      next: "live",
      transEasing: "ease",
      transSpeed: "quick",
      radius: 999
    }),
    D({
      id: "live",
      label: "Live",
      bgType: "solid",
      bg: "#09C12A",
      width: "full",
      content: "icon",
      text: "✦ Live",
      anim: "glow",
      hover: "bright",
      icon: "bolt",
      iconPos: "right",
      iconSize: 18,
      iconColor: "#BFFF00",
      iconAnim: "pulse",
      iconAnimSpeed: "fast",
      duration: 2800,
      next: "push",
      transEasing: "spring",
      transSpeed: "quick",
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: 1,
      radius: 10,
      shadow: "glow"
    })
  ],
  delete: [
    D({
      id: "idle",
      label: "Idle",
      bgType: "solid",
      bg: "#1a0a0a",
      width: "full",
      content: "icon",
      text: "Delete Account",
      anim: "none",
      hover: "none",
      icon: "trash",
      iconPos: "left",
      iconSize: 18,
      iconColor: "#FF4444",
      iconAnim: "none",
      duration: 1800,
      next: "warn",
      transEasing: "ease",
      transSpeed: "normal",
      fontSize: 15,
      fontWeight: 500,
      radius: 8,
      border: "outline",
      borderColor: "#3a1a1a"
    }),
    D({
      id: "warn",
      label: "Warn",
      bgType: "solid",
      bg: "#FF6C2F",
      width: "full",
      content: "icon",
      text: "This is permanent",
      anim: "none",
      hover: "none",
      icon: "warning",
      iconPos: "left",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "shake",
      iconAnimSpeed: "slow",
      duration: 1600,
      next: "confirm",
      transEasing: "spring",
      transSpeed: "normal",
      fontSize: 14,
      fontWeight: 600,
      radius: 8
    }),
    D({
      id: "confirm",
      label: "Confirm",
      bgType: "solid",
      bg: "#CC0000",
      width: "full",
      content: "icon",
      text: "Hold to confirm",
      anim: "none",
      hover: "none",
      icon: "warning",
      iconPos: "left",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "pulse",
      iconAnimSpeed: "fast",
      duration: 1800,
      next: "deleting",
      transEasing: "snap",
      transSpeed: "quick",
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: 0.5,
      radius: 8,
      shadow: "md",
      border: "ring",
      borderColor: "rgba(255,80,80,0.5)"
    }),
    D({
      id: "deleting",
      label: "Deleting",
      bgType: "gradient",
      bg: "#990000",
      grad: {
        type: "linear",
        angle: 90,
        stops: [
          { color: "#660000", pos: 0 },
          { color: "#CC0000", pos: 50 },
          { color: "#660000", pos: 100 }
        ],
        animate: true,
        speed: "fast"
      },
      width: "pill",
      content: "spinner",
      text: "",
      anim: "none",
      hover: "none",
      icon: "trash",
      iconPos: "left",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "none",
      duration: 2200,
      next: "deleted",
      transEasing: "ease",
      transSpeed: "quick",
      radius: 999
    }),
    D({
      id: "deleted",
      label: "Deleted",
      bgType: "solid",
      bg: "#1a1a1a",
      width: "full",
      content: "icon",
      text: "Account deleted",
      anim: "none",
      hover: "none",
      icon: "check",
      iconPos: "left",
      iconSize: 18,
      iconColor: "#555",
      iconAnim: "none",
      duration: 2400,
      next: "idle",
      transEasing: "gentle",
      transSpeed: "slow",
      fontSize: 14,
      fontWeight: 400,
      radius: 8
    })
  ],
  match: [
    D({
      id: "idle",
      label: "Idle",
      bgType: "gradient",
      bg: "#1565C0",
      grad: {
        type: "linear",
        angle: 135,
        stops: [
          { color: "#0D47A1", pos: 0 },
          { color: "#1976D2", pos: 100 }
        ],
        animate: false,
        speed: "normal"
      },
      width: "full",
      content: "icon",
      text: "Find Match",
      anim: "shimmer",
      hover: "scale",
      icon: "game",
      iconPos: "left",
      iconSize: 18,
      iconColor: "#BFFF00",
      iconAnim: "none",
      duration: 1600,
      next: "search",
      transEasing: "spring",
      transSpeed: "normal",
      fontSize: 15,
      fontWeight: 600,
      radius: 6,
      shadow: "md"
    }),
    D({
      id: "search",
      label: "Search",
      bgType: "solid",
      bg: "#0D1B2A",
      width: "pill",
      content: "dots",
      text: "",
      anim: "none",
      hover: "none",
      icon: "search",
      iconPos: "left",
      iconSize: 18,
      iconColor: "#2979FF",
      iconAnim: "none",
      duration: 2400,
      next: "found",
      transEasing: "ease",
      transSpeed: "normal",
      radius: 999,
      border: "outline",
      borderColor: "#1565C0"
    }),
    D({
      id: "found",
      label: "Found!",
      bgType: "solid",
      bg: "#09C12A",
      width: "full",
      content: "icon",
      text: "Match found!",
      anim: "none",
      hover: "none",
      icon: "star",
      iconPos: "right",
      iconSize: 18,
      iconColor: "#BFFF00",
      iconAnim: "bounce",
      iconAnimSpeed: "fast",
      duration: 1200,
      next: "loading",
      transEasing: "spring",
      transSpeed: "quick",
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: 0.5,
      radius: 6,
      shadow: "glow"
    }),
    D({
      id: "loading",
      label: "Loading",
      bgType: "gradient",
      bg: "#1565C0",
      grad: {
        type: "linear",
        angle: 90,
        stops: [
          { color: "#0D47A1", pos: 0 },
          { color: "#42A5F5", pos: 50 },
          { color: "#0D47A1", pos: 100 }
        ],
        animate: true,
        speed: "normal"
      },
      width: "full",
      content: "icon",
      text: "Loading map…",
      anim: "none",
      hover: "none",
      icon: "refresh",
      iconPos: "left",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "spin",
      iconAnimSpeed: "normal",
      duration: 2000,
      next: "ready",
      transEasing: "ease",
      transSpeed: "normal",
      fontSize: 14,
      fontWeight: 500,
      radius: 6
    }),
    D({
      id: "ready",
      label: "Ready?",
      bgType: "solid",
      bg: "#FF6C2F",
      width: "full",
      content: "icon",
      text: "Ready in 3…",
      anim: "none",
      hover: "none",
      icon: "bolt",
      iconPos: "right",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "pulse",
      iconAnimSpeed: "fast",
      duration: 1400,
      next: "ingame",
      transEasing: "snap",
      transSpeed: "quick",
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: 1,
      radius: 6,
      shadow: "sm"
    }),
    D({
      id: "ingame",
      label: "In Game",
      bgType: "gradient",
      bg: "#E0307A",
      grad: {
        type: "linear",
        angle: 90,
        stops: [
          { color: "#C62A6E", pos: 0 },
          { color: "#E0307A", pos: 50 },
          { color: "#FF69B4", pos: 100 }
        ],
        animate: true,
        speed: "slow"
      },
      width: "full",
      content: "icon",
      text: "● In Game",
      anim: "none",
      hover: "none",
      icon: "game",
      iconPos: "left",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "pulse",
      iconAnimSpeed: "slow",
      duration: 3000,
      next: "idle",
      transEasing: "spring",
      transSpeed: "normal",
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: 0.5,
      radius: 6,
      shadow: "glow"
    })
  ],
  subscribe: [
    D({
      id: "idle",
      label: "Idle",
      bgType: "solid",
      bg: "#E0307A",
      width: "full",
      content: "icon",
      text: "Subscribe",
      anim: "shimmer",
      hover: "lift",
      icon: "send",
      iconPos: "right",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "float",
      iconAnimSpeed: "slow",
      duration: 1600,
      next: "check",
      transEasing: "spring",
      transSpeed: "normal",
      fontSize: 15,
      fontWeight: 600,
      radius: 999,
      shadow: "md"
    }),
    D({
      id: "check",
      label: "Check",
      bgType: "solid",
      bg: "#1a0a0f",
      width: "full",
      content: "icon",
      text: "Checking email…",
      anim: "none",
      hover: "none",
      icon: "search",
      iconPos: "left",
      iconSize: 18,
      iconColor: "#E0307A",
      iconAnim: "pulse",
      iconAnimSpeed: "normal",
      duration: 1600,
      next: "sending",
      transEasing: "ease",
      transSpeed: "normal",
      fontSize: 14,
      fontWeight: 500,
      radius: 999,
      border: "outline",
      borderColor: "#E0307A"
    }),
    D({
      id: "sending",
      label: "Sending",
      bgType: "gradient",
      bg: "#E0307A",
      grad: {
        type: "linear",
        angle: 135,
        stops: [
          { color: "#8B0057", pos: 0 },
          { color: "#E0307A", pos: 50 },
          { color: "#FF69B4", pos: 100 }
        ],
        animate: true,
        speed: "normal"
      },
      width: "pill",
      content: "spinner",
      text: "",
      anim: "none",
      hover: "none",
      icon: "send",
      iconPos: "right",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "none",
      duration: 1800,
      next: "welcome",
      transEasing: "ease",
      transSpeed: "quick",
      radius: 999
    }),
    D({
      id: "welcome",
      label: "Welcome",
      bgType: "solid",
      bg: "#09C12A",
      width: "full",
      content: "icon",
      text: "You're in! 🎉",
      anim: "none",
      hover: "none",
      icon: "heart",
      iconPos: "right",
      iconSize: 18,
      iconColor: "white",
      iconAnim: "bounce",
      iconAnimSpeed: "normal",
      duration: 2000,
      next: "member",
      transEasing: "spring",
      transSpeed: "quick",
      fontSize: 15,
      fontWeight: 700,
      radius: 999,
      shadow: "glow"
    }),
    D({
      id: "member",
      label: "Member",
      bgType: "solid",
      bg: "#0a1a0a",
      width: "full",
      content: "icon",
      text: "Manage prefs",
      anim: "none",
      hover: "lift",
      icon: "arrow",
      iconPos: "right",
      iconSize: 18,
      iconColor: "#09C12A",
      iconAnim: "float",
      iconAnimSpeed: "normal",
      duration: 2400,
      next: "idle",
      transEasing: "gentle",
      transSpeed: "normal",
      fontSize: 14,
      fontWeight: 500,
      radius: 999,
      border: "outline",
      borderColor: "#09C12A"
    })
  ],
  auth: [
    D({
      id: "idle",
      label: "Idle",
      bgType: "solid",
      bg: "#111111",
      width: "full",
      content: "icon",
      text: "Sign In",
      anim: "shimmer",
      hover: "scale",
      icon: "user",
      iconPos: "left",
      iconSize: 20,
      iconColor: "white",
      iconAnim: "none",
      iconAnimTrigger: "hover",
      duration: 0,
      next: "validating",
      transEasing: "snap",
      transSpeed: "quick",
      fontSize: 16,
      fontWeight: 600,
      letterSpacing: 0.5,
      radius: 10,
      shadow: "md"
    }),
    D({
      id: "validating",
      label: "Validating",
      bgType: "solid",
      bg: "#1a1a2e",
      width: "full",
      content: "icon",
      text: "Checking…",
      anim: "none",
      hover: "none",
      icon: "search",
      iconPos: "left",
      iconSize: 18,
      iconColor: "#BFFF00",
      iconAnim: "pulse",
      iconAnimSpeed: "normal",
      duration: 1400,
      next: "twofa",
      transEasing: "ease",
      transSpeed: "normal",
      fontSize: 14,
      fontWeight: 500,
      letterSpacing: 0.5,
      radius: 10,
      border: "outline",
      borderColor: "#BFFF00"
    }),
    D({
      id: "twofa",
      label: "2FA",
      bgType: "solid",
      bg: "#7C3AED",
      width: "full",
      content: "icon",
      text: "Verify 2FA",
      anim: "none",
      hover: "none",
      icon: "lock",
      iconPos: "left",
      iconSize: 18,
      iconColor: "#BFFF00",
      iconAnim: "wiggle",
      iconAnimSpeed: "slow",
      duration: 2000,
      next: "verifying",
      transEasing: "spring",
      transSpeed: "normal",
      fontSize: 14,
      fontWeight: 500,
      radius: 10,
      border: "ring",
      borderColor: "rgba(191,255,0,0.5)"
    }),
    D({
      id: "verifying",
      label: "Verifying",
      bgType: "gradient",
      bg: "#7C3AED",
      grad: {
        type: "linear",
        angle: 90,
        stops: [
          { color: "#4C1D95", pos: 0 },
          { color: "#9B5DE5", pos: 50 },
          { color: "#4C1D95", pos: 100 }
        ],
        animate: true,
        speed: "fast"
      },
      width: "pill",
      content: "spinner",
      text: "",
      anim: "none",
      hover: "none",
      icon: "lock",
      iconPos: "left",
      iconSize: 20,
      iconColor: "inherit",
      iconAnim: "none",
      duration: 1800,
      next: "welcome",
      transEasing: "ease",
      transSpeed: "quick",
      radius: 999
    }),
    D({
      id: "welcome",
      label: "Welcome!",
      bgType: "gradient",
      bg: "#09C12A",
      grad: {
        type: "linear",
        angle: 135,
        stops: [
          { color: "#09C12A", pos: 0 },
          { color: "#00BCD4", pos: 100 }
        ],
        animate: false,
        speed: "normal"
      },
      width: "full",
      content: "icon",
      text: "Welcome back!",
      anim: "glow",
      hover: "none",
      icon: "star",
      iconPos: "right",
      iconSize: 20,
      iconColor: "#BFFF00",
      iconAnim: "spin",
      iconAnimSpeed: "slow",
      duration: 2000,
      next: "ready",
      transEasing: "spring",
      transSpeed: "normal",
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: 1,
      radius: 10,
      shadow: "glow"
    }),
    D({
      id: "ready",
      label: "Ready",
      bgType: "solid",
      bg: "#09C12A",
      width: "full",
      content: "icon",
      text: "Go to dashboard",
      anim: "shimmer",
      hover: "lift",
      icon: "arrow",
      iconPos: "right",
      iconSize: 20,
      iconColor: "inherit",
      iconAnim: "float",
      iconAnimSpeed: "normal",
      duration: 0,
      next: "idle",
      transEasing: "gentle",
      transSpeed: "slow",
      fontSize: 15,
      fontWeight: 600,
      radius: 10,
      shadow: "sm"
    })
  ],
  download: [
    D({
      id: "ready",
      label: "Ready",
      bgType: "solid",
      bg: "#2979FF",
      width: "full",
      content: "icon",
      text: "Download",
      anim: "shimmer",
      hover: "lift",
      icon: "download",
      iconPos: "left",
      iconSize: 20,
      iconColor: "inherit",
      iconAnim: "bounce",
      iconAnimSpeed: "slow",
      duration: 0,
      next: "starting",
      transEasing: "spring",
      transSpeed: "normal",
      fontSize: 16,
      fontWeight: 500,
      shadow: "sm"
    }),
    D({
      id: "starting",
      label: "Starting",
      bgType: "solid",
      bg: "#1565C0",
      width: "full",
      content: "icon",
      text: "Starting…",
      anim: "none",
      hover: "none",
      icon: "download",
      iconPos: "left",
      iconSize: 20,
      iconColor: "inherit",
      iconAnim: "pulse",
      iconAnimSpeed: "fast",
      duration: 900,
      next: "progress",
      transEasing: "ease",
      transSpeed: "quick",
      fontSize: 14,
      fontWeight: 500
    }),
    D({
      id: "progress",
      label: "Progress",
      bgType: "gradient",
      bg: "#1565C0",
      grad: {
        type: "linear",
        angle: 90,
        stops: [
          { color: "#0D47A1", pos: 0 },
          { color: "#42A5F5", pos: 55 },
          { color: "#0D47A1", pos: 100 }
        ],
        animate: true,
        speed: "slow"
      },
      width: "full",
      content: "dots",
      text: "",
      anim: "none",
      hover: "none",
      icon: "download",
      iconPos: "left",
      iconSize: 20,
      iconColor: "inherit",
      iconAnim: "none",
      duration: 3000,
      next: "verify",
      transEasing: "ease",
      transSpeed: "normal"
    }),
    D({
      id: "verify",
      label: "Verifying",
      bgType: "solid",
      bg: "#FF6C2F",
      width: "pill",
      content: "spinner",
      text: "",
      anim: "none",
      hover: "none",
      icon: "check",
      iconPos: "left",
      iconSize: 20,
      iconColor: "inherit",
      iconAnim: "none",
      duration: 1400,
      next: "done",
      transEasing: "ease",
      transSpeed: "quick",
      radius: 999
    }),
    D({
      id: "done",
      label: "Complete",
      bgType: "solid",
      bg: "#09C12A",
      width: "full",
      content: "icon",
      text: "Complete!",
      anim: "none",
      hover: "none",
      icon: "check",
      iconPos: "left",
      iconSize: 20,
      iconColor: "inherit",
      iconAnim: "none",
      duration: 2800,
      next: "ready",
      transEasing: "spring",
      transSpeed: "quick",
      fontSize: 16,
      fontWeight: 600,
      shadow: "glow"
    })
  ],
  deploy: [
    D({
      id: "queue",
      label: "Queue",
      bgType: "solid",
      bg: "#455A64",
      width: "full",
      content: "icon",
      text: "Deploy",
      anim: "shimmer",
      hover: "lift",
      icon: "rocket",
      iconPos: "right",
      iconSize: 20,
      iconColor: "inherit",
      iconAnim: "none",
      iconAnimTrigger: "hover",
      duration: 0,
      next: "build",
      transEasing: "spring",
      transSpeed: "normal",
      fontSize: 16,
      fontWeight: 600,
      letterSpacing: 1,
      radius: 8,
      shadow: "sm"
    }),
    D({
      id: "build",
      label: "Building",
      bgType: "gradient",
      bg: "#FF6C2F",
      grad: {
        type: "linear",
        angle: 90,
        stops: [
          { color: "#E65100", pos: 0 },
          { color: "#FF6C2F", pos: 50 },
          { color: "#E65100", pos: 100 }
        ],
        animate: true,
        speed: "normal"
      },
      width: "full",
      content: "icon",
      text: "Building…",
      anim: "none",
      hover: "none",
      icon: "settings",
      iconPos: "left",
      iconSize: 18,
      iconColor: "inherit",
      iconAnim: "spin",
      iconAnimSpeed: "normal",
      duration: 2200,
      next: "test",
      transEasing: "ease",
      transSpeed: "normal",
      fontSize: 15,
      fontWeight: 500,
      letterSpacing: 0.5,
      radius: 8
    }),
    D({
      id: "test",
      label: "Testing",
      bgType: "solid",
      bg: "#F57C00",
      width: "full",
      content: "dots",
      text: "",
      anim: "none",
      hover: "none",
      icon: "check",
      iconPos: "left",
      iconSize: 20,
      iconColor: "inherit",
      iconAnim: "none",
      duration: 2000,
      next: "ship",
      transEasing: "ease",
      transSpeed: "quick",
      radius: 8
    }),
    D({
      id: "ship",
      label: "Shipping",
      bgType: "gradient",
      bg: "#7C3AED",
      grad: {
        type: "linear",
        angle: 45,
        stops: [
          { color: "#4C1D95", pos: 0 },
          { color: "#7C3AED", pos: 50 },
          { color: "#2979FF", pos: 100 }
        ],
        animate: true,
        speed: "fast"
      },
      width: "pill",
      content: "icon",
      text: "",
      anim: "none",
      hover: "none",
      icon: "rocket",
      iconPos: "only",
      iconSize: 24,
      iconColor: "inherit",
      iconAnim: "float",
      iconAnimSpeed: "fast",
      duration: 1800,
      next: "live",
      transEasing: "spring",
      transSpeed: "quick",
      radius: 999
    }),
    D({
      id: "live",
      label: "Live!",
      bgType: "solid",
      bg: "#09C12A",
      width: "full",
      content: "icon",
      text: "Live!",
      anim: "glow",
      hover: "bright",
      icon: "bolt",
      iconPos: "right",
      iconSize: 20,
      iconColor: "#BFFF00",
      iconAnim: "pulse",
      iconAnimSpeed: "fast",
      duration: 3000,
      next: "queue",
      transEasing: "spring",
      transSpeed: "quick",
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: 1,
      radius: 8,
      shadow: "glow"
    })
  ],
  like: [
    D({
      id: "idle",
      label: "Idle",
      bgType: "solid",
      bg: "#F0F0F0",
      width: "auto",
      content: "icon",
      text: "Like",
      anim: "none",
      hover: "scale",
      icon: "heart",
      iconPos: "left",
      iconSize: 20,
      iconColor: "#999",
      iconAnim: "none",
      iconAnimTrigger: "hover",
      duration: 0,
      next: "press",
      transEasing: "spring",
      transSpeed: "quick",
      fontSize: 14,
      fontWeight: 500,
      radius: 999,
      border: "outline",
      borderColor: "#ddd"
    }),
    D({
      id: "press",
      label: "Press",
      bgType: "solid",
      bg: "#FCE4EC",
      width: "auto",
      content: "icon",
      text: "Like",
      anim: "ripple",
      hover: "none",
      icon: "heart",
      iconPos: "left",
      iconSize: 22,
      iconColor: "#E0307A",
      iconAnim: "pulse",
      iconAnimSpeed: "fast",
      duration: 400,
      next: "liked",
      transEasing: "spring",
      transSpeed: "quick",
      fontSize: 14,
      fontWeight: 500,
      radius: 999,
      border: "outline",
      borderColor: "#F48FB1"
    }),
    D({
      id: "liked",
      label: "Liked",
      bgType: "solid",
      bg: "#E0307A",
      width: "auto",
      content: "icon",
      text: "Liked!",
      anim: "none",
      hover: "bright",
      icon: "heart",
      iconPos: "left",
      iconSize: 20,
      iconColor: "white",
      iconAnim: "bounce",
      iconAnimSpeed: "normal",
      duration: 2200,
      next: "reset",
      transEasing: "spring",
      transSpeed: "quick",
      fontSize: 14,
      fontWeight: 600,
      radius: 999,
      shadow: "sm"
    }),
    D({
      id: "reset",
      label: "Reset",
      bgType: "solid",
      bg: "#F0F0F0",
      width: "auto",
      content: "icon",
      text: "Like",
      anim: "none",
      hover: "scale",
      icon: "heart",
      iconPos: "left",
      iconSize: 20,
      iconColor: "#ccc",
      iconAnim: "none",
      duration: 0,
      next: "idle",
      transEasing: "gentle",
      transSpeed: "slow",
      fontSize: 14,
      fontWeight: 500,
      radius: 999,
      border: "outline",
      borderColor: "#ddd"
    })
  ]
};

const EXAMPLE_CARDS = [
  {
    id: "checkout",
    preset: "checkout",
    cat: "6 states · Payment",
    title: "Checkout Flow",
    desc: "Idle → Confirm → Auth → Charging → Success → Receipt",
    color: "#111111"
  },
  {
    id: "ai",
    preset: "ai",
    cat: "5 states · AI",
    title: "AI Generation",
    desc: "Idle → Thinking → Writing → Reviewing → Done",
    color: "#7C3AED"
  },
  {
    id: "deployci",
    preset: "deployci",
    cat: "7 states · DevOps",
    title: "Deploy Pipeline",
    desc: "Push → Queue → Build → Test → Ship → Health → Live",
    color: "#2979FF"
  },
  {
    id: "delete",
    preset: "delete",
    cat: "5 states · Destructive",
    title: "Delete Account",
    desc: "Idle → Warn → Confirm → Deleting → Deleted",
    color: "#CC0000"
  },
  {
    id: "match",
    preset: "match",
    cat: "6 states · Gaming",
    title: "Matchmaking",
    desc: "Idle → Searching → Found → Loading → Countdown → In Game",
    color: "#1565C0"
  },
  {
    id: "subscribe",
    preset: "subscribe",
    cat: "5 states · Subscription",
    title: "Newsletter Signup",
    desc: "Idle → Checking → Sending → Welcome → Member",
    color: "#E0307A"
  },
  {
    id: "auth",
    preset: "auth",
    cat: "6 states · Security",
    title: "Auth Flow",
    desc: "Idle → Validating → 2FA → Verifying → Welcome → Ready",
    color: "#111111"
  },
  {
    id: "download",
    preset: "download",
    cat: "5 states · Files",
    title: "Download Flow",
    desc: "Ready → Starting → Progress → Verifying → Complete",
    color: "#2979FF"
  },
  {
    id: "deploy",
    preset: "deploy",
    cat: "5 states · DevOps",
    title: "CI/CD Deploy",
    desc: "Queue → Building → Testing → Shipping → Live!",
    color: "#455A64"
  },
  {
    id: "like",
    preset: "like",
    cat: "4 states · Social",
    title: "Like Button",
    desc: "Idle → Press → Liked → Reset",
    color: "#E0307A"
  }
];

const PRESET_META = [
  {
    group: "New Examples",
    items: [
      {
        key: "checkout",
        label: "Checkout Flow",
        color: "#111111",
        states: "6 states"
      },
      {
        key: "ai",
        label: "AI Generation",
        color: "#7C3AED",
        states: "5 states"
      },
      {
        key: "deployci",
        label: "Deploy Pipeline",
        color: "#2979FF",
        states: "7 states"
      },
      {
        key: "delete",
        label: "Delete Account",
        color: "#CC0000",
        states: "5 states"
      },
      {
        key: "match",
        label: "Matchmaking",
        color: "#1565C0",
        states: "6 states"
      },
      {
        key: "subscribe",
        label: "Newsletter Signup",
        color: "#E0307A",
        states: "5 states"
      }
    ]
  },
  {
    group: "Classic Presets",
    items: [
      { key: "auth", label: "Auth Flow", color: "#111111", states: "6 states" },
      {
        key: "download",
        label: "Download",
        color: "#2979FF",
        states: "5 states"
      },
      {
        key: "deploy",
        label: "CI/CD Deploy",
        color: "#455A64",
        states: "5 states"
      },
      {
        key: "like",
        label: "Like Button",
        color: "#E0307A",
        states: "4 states"
      }
    ]
  }
];

// ═══════════════════════════════════════════════════════
//  STATE STORE
// ═══════════════════════════════════════════════════════
class StateStore {
  constructor() {
    this.states = [
      {
        id: "idle",
        label: "Idle",
        bgType: "solid",
        bg: "#B8AEE8",
        grad: {
          type: "linear",
          angle: 90,
          stops: [
            { color: "#2D0E6E", pos: 0 },
            { color: "#8B1FAF", pos: 100 }
          ],
          animate: false,
          speed: "normal"
        },
        width: "full",
        content: "text",
        text: "Continue",
        anim: "shimmer",
        hover: "scale",
        icon: "arrow",
        iconPos: "right",
        iconSize: 20,
        iconColor: "inherit",
        iconAnim: "none",
        iconAnimSpeed: "normal",
        iconAnimTrigger: "always",
        duration: 0,
        next: "idle",
        transEasing: "spring",
        transSpeed: "normal",
        fontSize: 16,
        fontWeight: 500,
        letterSpacing: 0,
        textColor: "auto",
        radius: 999,
        shadow: "none",
        border: "none",
        borderColor: "#ffffff"
      }
    ];
    this.activeId = "idle";
    this._counter = 10;
  }
  get active() {
    return this.states.find((s) => s.id === this.activeId) || this.states[0];
  }
  getById(id) {
    return this.states.find((s) => s.id === id);
  }
  update(patch) {
    Object.assign(this.active, patch);
  }

  add() {
    this._counter++;
    const newId = "state_" + this._counter;
    const prev = this.states[this.states.length - 1];
    this.states.push({
      id: newId,
      label: "New State",
      bgType: "solid",
      bg: "#7C3AED",
      grad: {
        type: "linear",
        angle: 90,
        stops: [
          { color: "#7C3AED", pos: 0 },
          { color: "#2979FF", pos: 100 }
        ],
        animate: false,
        speed: "normal"
      },
      width: "full",
      content: "text",
      text: "State",
      anim: "none",
      hover: "none",
      icon: "bolt",
      iconPos: "left",
      iconSize: 20,
      iconColor: "inherit",
      iconAnim: "none",
      iconAnimSpeed: "normal",
      iconAnimTrigger: "always",
      duration: 1500,
      next: newId,
      transEasing: "spring",
      transSpeed: "normal",
      fontSize: 16,
      fontWeight: 500,
      letterSpacing: 0,
      textColor: "auto",
      radius: 999,
      shadow: "none",
      border: "none",
      borderColor: "#ffffff"
    });
    if (prev) prev.next = newId;
    return newId;
  }

  delete(id) {
    if (this.states.length <= 1) return null;
    this.states = this.states.filter((s) => s.id !== id);
    this.states.forEach((s) => {
      if (s.next === id) s.next = this.states[0].id;
    });
    return this.activeId === id ? this.states[0].id : this.activeId;
  }

  duplicate(id) {
    const src = this.getById(id);
    if (!src) return null;
    this._counter++;
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = "state_" + this._counter;
    copy.label = src.label + " Copy";
    const idx = this.states.findIndex((s) => s.id === id);
    this.states.splice(idx + 1, 0, copy);
    return copy.id;
  }

  reorder(fromId, toId) {
    const fi = this.states.findIndex((x) => x.id === fromId);
    const ti = this.states.findIndex((x) => x.id === toId);
    if (fi === -1 || ti === -1) return;
    const [moved] = this.states.splice(fi, 1);
    this.states.splice(ti, 0, moved);
  }

  rename(id, label) {
    const s = this.getById(id);
    if (s) s.label = label.trim() || s.label;
  }

  loadPreset(name) {
    const preset = ALL_PRESETS[name];
    if (!preset) return false;
    this.states = preset.map((s) => ({
      ...PRESET_DEFAULTS,
      ...s,
      grad: s.grad
        ? { ...s.grad, stops: s.grad.stops.map((t) => ({ ...t })) }
        : {
            type: "linear",
            angle: 90,
            stops: [
              { color: s.bg || "#111", pos: 0 },
              { color: s.bg || "#333", pos: 100 }
            ],
            animate: false,
            speed: "normal"
          }
    }));
    this.activeId = this.states[0].id;
    return true;
  }

  saveCustom() {
    if (!this.states.length) return;
    ALL_PRESETS.custom = this.states.map((s) => ({
      ...s,
      grad: s.grad
        ? { ...s.grad, stops: s.grad.stops.map((t) => ({ ...t })) }
        : undefined
    }));
    const desc = this.states.map((s) => s.label).join(" → ");
    const existing = EXAMPLE_CARDS.find((c) => c.id === "custom");
    if (existing) {
      Object.assign(existing, {
        preset: "custom",
        cat: `${this.states.length} states · Your Build`,
        title: "Custom Button",
        desc
      });
    } else {
      EXAMPLE_CARDS.unshift({
        id: "custom",
        preset: "custom",
        cat: `${this.states.length} states · Your Build`,
        title: "Custom Button",
        desc,
        color: this.states[0].bgType === "solid" ? this.states[0].bg : "#7C3AED"
      });
    }
  }
}

// ═══════════════════════════════════════════════════════
//  BUTTON RENDERER
// ═══════════════════════════════════════════════════════
class ButtonRenderer {
  constructor(app) {
    this.app = app;
    this.previewBtn = document.getElementById("preview-btn");
  }

  applyToEl(s, rootEl) {
    if (!s || !rootEl) return;
    const inner = rootEl.querySelector(".btn-inner");
    const iconWrap = rootEl.querySelector(".btn-icon-wrap");
    const iconSvg = rootEl.querySelector("svg");
    const labelEl = rootEl.querySelector(".btn-label");
    const dotsEl = rootEl.querySelector(".btn-dots");
    const checkEl = rootEl.querySelector(".btn-check");
    const spinEl = rootEl.querySelector(".btn-spinner");

    if (s.bgType === "gradient") {
      rootEl.style.background = buildGradientCSS(s.grad);
      if (s.grad.animate) {
        rootEl.style.backgroundSize = "300% 100%";
        rootEl.style.animation = `grad-anim ${
          GRAD_SPEEDS[s.grad.speed]
        } ease infinite`;
      } else {
        rootEl.style.backgroundSize = "";
        rootEl.style.animation = "";
      }
    } else {
      rootEl.style.background = s.bg;
      rootEl.style.backgroundSize = "";
      rootEl.style.animation = "";
    }
    rootEl.style.color =
      s.textColor && s.textColor !== "auto"
        ? s.textColor
        : s.bgType === "gradient" || !isLight(s.bg)
        ? "white"
        : "#111";
    rootEl.style.width =
      { full: "100%", pill: "160px", circle: "48px", auto: "auto" }[s.width] ||
      "100%";
    rootEl.style.margin = s.width !== "full" ? "0 auto" : "";
    rootEl.style.borderRadius =
      (s.radius ?? 999) >= 999 ? "999px" : (s.radius ?? 999) + "px";
    const bgC = s.bgType === "solid" ? s.bg : "#9B8ADE";
    rootEl.style.boxShadow =
      s.shadow === "sm"
        ? "0 2px 8px rgba(0,0,0,0.18)"
        : s.shadow === "md"
        ? "0 6px 20px rgba(0,0,0,0.22)"
        : s.shadow === "lg"
        ? "0 12px 40px rgba(0,0,0,0.28)"
        : s.shadow === "glow"
        ? `0 0 24px ${bgC}aa, 0 0 48px ${bgC}44`
        : "";
    const bc = s.borderColor || "#fff";
    rootEl.style.border =
      s.border === "ring"
        ? `3px solid ${bc}`
        : s.border === "outline"
        ? `2px solid ${bc}`
        : "none";
    const keepClasses = Array.from(rootEl.classList).filter(
      (c) => c === "proto-btn" || c === "active-step" || c === "editing-state"
    );
    rootEl.className = keepClasses.join(" ");
    if (s.hover && s.hover !== "none") rootEl.classList.add("hover-" + s.hover);
    if (s.iconPos === "right") rootEl.classList.add("icon-right");
    if (s.iconPos === "above") rootEl.classList.add("icon-above");
    rootEl.style.fontSize = (s.fontSize || 16) + "px";
    rootEl.style.fontWeight = s.fontWeight || 500;
    rootEl.style.letterSpacing = (s.letterSpacing || 0) + "px";
    if (inner) inner.style.display = "none";
    if (dotsEl) dotsEl.style.display = "none";
    if (checkEl) checkEl.style.display = "none";
    if (spinEl) spinEl.style.display = "none";
    if (s.content === "dots") {
      if (dotsEl) dotsEl.style.display = "flex";
    } else if (s.content === "spinner") {
      if (spinEl) spinEl.style.display = "block";
    } else if (s.content === "check") {
      if (checkEl) checkEl.style.display = "flex";
      rootEl.classList.remove("check-drawn");
      setTimeout(() => rootEl.classList.add("check-drawn"), 60);
    } else if (s.content !== "none") {
      if (inner) inner.style.display = "flex";
      if (labelEl) {
        labelEl.style.display =
          s.content === "icon" && s.iconPos === "only" ? "none" : "";
        labelEl.textContent = s.text || "";
      }
      if (s.content === "icon" && s.icon && ICONS[s.icon] && iconSvg) {
        if (iconWrap) iconWrap.style.display = "flex";
        iconSvg.innerHTML = ICONS[s.icon];
        const sz = s.iconSize || 20;
        iconSvg.setAttribute("width", sz);
        iconSvg.setAttribute("height", sz);
        iconSvg.setAttribute("viewBox", "0 0 24 24");
        const icol =
          s.iconColor === "inherit"
            ? s.bgType === "solid" && isLight(s.bg)
              ? "#111"
              : "white"
            : s.iconColor || "white";
        iconSvg.style.fill = icol;
        if (iconWrap) {
          iconWrap.className = "btn-icon-wrap";
          if (rootEl._cleanupIconAnimListeners) {
            rootEl._cleanupIconAnimListeners();
            rootEl._cleanupIconAnimListeners = null;
          }
          if (s.iconAnim && s.iconAnim !== "none") {
            const suf =
              s.iconAnimSpeed === "slow"
                ? "-slow"
                : s.iconAnimSpeed === "fast"
                ? "-fast"
                : "";
            const animClass = `icon-anim-${s.iconAnim}${suf}`;
            const trigger = s.iconAnimTrigger || "always";
            if (trigger === "always") {
              iconWrap.classList.add(animClass);
            } else if (trigger === "hover") {
              const onEnter = () => iconWrap.classList.add(animClass);
              const onLeave = () => iconWrap.classList.remove(animClass);
              rootEl.addEventListener("mouseenter", onEnter);
              rootEl.addEventListener("mouseleave", onLeave);
              rootEl._cleanupIconAnimListeners = () => {
                rootEl.removeEventListener("mouseenter", onEnter);
                rootEl.removeEventListener("mouseleave", onLeave);
              };
            } else if (trigger === "click") {
              const onClick = () => {
                iconWrap.classList.remove(animClass);
                void iconWrap.offsetWidth;
                iconWrap.classList.add(animClass);
              };
              rootEl.addEventListener("click", onClick);
              rootEl._cleanupIconAnimListeners = () =>
                rootEl.removeEventListener("click", onClick);
            }
          }
        }
      } else if (iconWrap) {
        iconWrap.style.display = "none";
      }
    }
  }

  applyAll(id) {
    const s = this.app.store.getById(id);
    if (!s) return;
    this.applyToEl(s, this.previewBtn);
    const gEl = document.getElementById(`gallery-btn-${id}`);
    if (gEl) this.applyToEl(s, gEl);
    document
      .querySelectorAll("#gallery-grid .gallery-cell")
      .forEach((c) => c.classList.remove("active-step"));
    if (gEl) {
      const cell = gEl.closest(".gallery-cell");
      if (cell) cell.classList.add("active-step");
    }
    this.app.gallery.syncSelection();
  }

  handleClick(e) {
    const s = this.app.store.active;
    const btn = this.previewBtn;
    if (s.anim === "shimmer") {
      btn.classList.remove("shimmer");
      void btn.offsetWidth;
      btn.classList.add("shimmer");
    } else if (s.anim === "ripple") {
      const r = document.createElement("div");
      r.className = "ripple";
      const rect = btn.getBoundingClientRect();
      r.style.left = e.clientX - rect.left - 5 + "px";
      r.style.top = e.clientY - rect.top - 5 + "px";
      btn.appendChild(r);
      setTimeout(() => r.remove(), 600);
    } else if (s.anim === "bounce") {
      btn.style.animation = "btn-bounce 0.5s var(--spring) forwards";
      setTimeout(() => (btn.style.animation = ""), 600);
    } else if (s.anim === "scale") {
      btn.style.transform = "scale(0.93)";
      setTimeout(() => (btn.style.transform = ""), 200);
    } else if (s.anim === "glow") {
      const g = btn.style.boxShadow;
      btn.style.boxShadow = `0 0 0 6px ${s.bg}55, 0 0 40px ${s.bg}88`;
      setTimeout(() => (btn.style.boxShadow = g), 500);
    }
  }
}

// ═══════════════════════════════════════════════════════
//  CODE GENERATOR
// ═══════════════════════════════════════════════════════
class CodeGenerator {
  constructor(app) {
    this.app = app;
  }

  shadowCss(s) {
    const bg = s.bgType === "solid" ? s.bg : "#9B8ADE";
    return s.shadow === "sm"
      ? "0 2px 8px rgba(0,0,0,0.18)"
      : s.shadow === "md"
      ? "0 6px 20px rgba(0,0,0,0.22)"
      : s.shadow === "lg"
      ? "0 12px 40px rgba(0,0,0,0.28)"
      : s.shadow === "glow"
      ? `0 0 24px ${bg}aa, 0 0 48px ${bg}44`
      : "";
  }
  transDur(s) {
    return { quick: "0.2s", normal: "0.36s", slow: "0.56s" }[
      s.transSpeed || "normal"
    ];
  }
  easingCss(s) {
    return (
      EASINGS[s.transEasing || "spring"]?.css ||
      "cubic-bezier(0.34,1.56,0.64,1)"
    );
  }

  generate() {
    const { states } = this.app.store;
    const lines = [];
    lines.push(
      `<span class="cm">/* Button States: ${states
        .map((s) => s.label)
        .join(" → ")} */</span>`
    );
    lines.push(`.btn {`);
    lines.push(
      `  <span class="prop">height</span>: <span class="val">52px</span>; <span class="prop">border-radius</span>: <span class="val">999px</span>;`
    );
    lines.push(
      `  <span class="prop">transition</span>: <span class="str">width 0.52s cubic-bezier(0.34,1.56,0.64,1), background 0.36s ease</span>;`
    );
    lines.push(`}`);
    lines.push("");
    states.forEach((s) => {
      const bgCSS = s.bgType === "gradient" ? buildGradientCSS(s.grad) : s.bg;
      const w = { full: "100%", pill: "160px", circle: "52px", auto: "auto" }[
        s.width
      ];
      const r = (s.radius ?? 999) >= 999 ? "999px" : (s.radius ?? 999) + "px";
      const bc = s.border !== "none" ? s.borderColor || "#fff" : null;
      lines.push(`<span class="cm">/* ${s.label} */</span>`);
      lines.push(`.btn--${s.id} {`);
      lines.push(
        `  <span class="prop">background</span>: <span class="str">${bgCSS}</span>;`
      );
      if (s.bgType === "gradient" && s.grad.animate) {
        const spd = { slow: "3s", normal: "1.8s", fast: "0.9s" }[s.grad.speed];
        lines.push(
          `  <span class="prop">background-size</span>: <span class="val">300% 100%</span>; <span class="prop">animation</span>: <span class="str">grad-anim ${spd} ease infinite</span>;`
        );
      }
      lines.push(
        `  <span class="prop">width</span>: <span class="val">${w}</span>; <span class="prop">border-radius</span>: <span class="val">${r}</span>;`
      );
      lines.push(
        `  <span class="prop">font-size</span>: <span class="val">${
          s.fontSize || 16
        }px</span>; <span class="prop">font-weight</span>: <span class="val">${
          s.fontWeight || 500
        }</span>;`
      );
      if (s.textColor && s.textColor !== "auto")
        lines.push(
          `  <span class="prop">color</span>: <span class="str">${s.textColor}</span>;`
        );
      if (s.shadow && s.shadow !== "none")
        lines.push(
          `  <span class="prop">box-shadow</span>: <span class="str">${this.shadowCss(
            s
          )}</span>;`
        );
      if (bc)
        lines.push(
          `  <span class="prop">border</span>: <span class="str">${
            s.border === "ring" ? "3" : "2"
          }px solid ${bc}</span>;`
        );
      lines.push(`}`);
      lines.push("");
    });
    lines.push(`<span class="cm">/* JS: cycle states on click */</span>`);
    lines.push(
      `<span class="kw">const</span> STATES = [<span class="str">'${states
        .map((s) => s.id)
        .join("','")}'</span>];`
    );
    lines.push(`<span class="kw">let</span> idx = <span class="val">0</span>;`);
    lines.push(
      `btn.onclick = () => { btn.className = <span class="str">'btn btn--'</span> + STATES[idx = (idx+<span class="val">1</span>)%STATES.length]; };`
    );
    document.getElementById("code-output").innerHTML = lines.join("\n");
    const infoPanel = document.getElementById("state-info-panel");
    if (infoPanel && infoPanel.classList.contains("open")) {
      this.app.infoPanel.show(this.app.store.activeId);
    }
  }

  copyCode() {
    const out = document.getElementById("code-output").textContent;
    navigator.clipboard.writeText(out).then(() => {
      const b = document.getElementById("copy-btn");
      b.textContent = "✓ Copied";
      b.classList.add("copied");
      setTimeout(() => {
        b.textContent = "⎘ Copy";
        b.classList.remove("copied");
      }, 1800);
    });
  }

  exportToKit() {
    const s = this.app.store.active;
    const snip = `<!-- ${s.label} -->\n<button class="btn btn--${s.id}">${
      s.text || ""
    }</button>`;
    navigator.clipboard.writeText(snip).then(() => {
      event.target.textContent = "✓ Copied!";
      setTimeout(
        () => (event.target.textContent = "↗ Copy as UI Kit snippet"),
        1800
      );
    });
  }
}

// ═══════════════════════════════════════════════════════
//  EDITOR UI
// ═══════════════════════════════════════════════════════
class EditorUI {
  constructor(app) {
    this.app = app;
  }

  _refresh() {
    this.app.renderer.applyAll(this.app.store.activeId);
    this.app.codeGen.generate();
  }

  buildIconGrid() {
    const grid = document.getElementById("icon-grid");
    grid.innerHTML = "";
    Object.entries(ICONS).forEach(([key, path]) => {
      const b = document.createElement("button");
      b.className = "icon-pick";
      b.dataset.icon = key;
      b.title = key;
      b.innerHTML = `<svg viewBox="0 0 24 24">${path}</svg>`;
      b.onclick = () => this.selectIcon(key);
      grid.appendChild(b);
    });
  }

  buildCurveGrid() {
    const grid = document.getElementById("curve-grid");
    grid.innerHTML = "";
    Object.entries(EASINGS).forEach(([key, e]) => {
      const b = document.createElement("button");
      b.className = "curve-btn";
      b.dataset.easing = key;
      b.innerHTML = `<svg viewBox="0 0 36 24"><path d="${e.curve}"/></svg><span>${e.label}</span>`;
      b.onclick = () => this.setTransEasing(key);
      grid.appendChild(b);
    });
  }

  buildRadiusRow() {
    const row = document.getElementById("radius-row");
    row.innerHTML = "";
    RADII.forEach((r) => {
      const b = document.createElement("button");
      b.className = "radius-btn";
      b.dataset.radius = r.val;
      const br = r.val >= 999 ? "999px" : r.val + "px";
      b.innerHTML = `<div class="rp" style="border-radius:${br}"></div>`;
      b.style.borderRadius = "7px";
      b.title = r.label;
      b.onclick = () => this.setRadius(r.val);
      row.appendChild(b);
    });
  }

  buildShadowRow() {
    const row = document.getElementById("shadow-row");
    row.innerHTML = "";
    SHADOWS.forEach((sh) => {
      const b = document.createElement("button");
      b.className = "shadow-swatch" + (sh.id === "none" ? " active" : "");
      b.dataset.shadow = sh.id;
      b.textContent = sh.label;
      b.onclick = () => this.setShadow(sh.id);
      row.appendChild(b);
    });
  }

  buildBorderColorSwatches() {
    const row = document.getElementById("border-color-swatches");
    row.innerHTML = "";
    BORDER_COLORS.forEach((c) => {
      const sw = document.createElement("div");
      sw.className = "swatch";
      sw.dataset.bc = c;
      sw.style.background = c;
      sw.style.border =
        c === "#ffffff" ? "2px solid #ccc" : "2px solid transparent";
      sw.onclick = () => this.setBorderColor(c);
      row.appendChild(sw);
    });
  }

  buildBgSwatches() {
    const row = document.getElementById("bg-swatches");
    row.innerHTML = "";
    [
      "#111111",
      "#BFFF00",
      "#09C12A",
      "#FF6C2F",
      "#2979FF",
      "#E0307A",
      "#7C3AED",
      "#FFFFFF"
    ].forEach((c) => {
      const sw = document.createElement("div");
      sw.className = "swatch";
      sw.dataset.color = c;
      sw.style.background = c;
      sw.style.border =
        c === "#FFFFFF" ? "2px solid #ccc" : "2px solid transparent";
      sw.onclick = () => {
        this.app.store.update({ bgType: "solid", bg: c });
        this.syncSolidColorUI(c);
        this.showGradBuilder(false);
        this._refresh();
      };
      row.appendChild(sw);
    });
    const gradSw = document.createElement("div");
    gradSw.className = "swatch";
    gradSw.dataset.color = "gradient";
    gradSw.style.background = "linear-gradient(135deg,#7C3AED,#2979FF,#09C12A)";
    gradSw.title = "Gradient";
    gradSw.onclick = () => {
      this.app.store.update({ bgType: "gradient" });
      this.showGradBuilder(true);
      this.renderGradStops();
      this._refresh();
    };
    row.appendChild(gradSw);
  }

  buildPresetList() {
    const list = document.getElementById("preset-list");
    list.innerHTML = "";
    PRESET_META.forEach((group) => {
      const label = document.createElement("div");
      label.className = "preset-group-label";
      label.textContent = group.group;
      list.appendChild(label);
      const row = document.createElement("div");
      row.className = "preset-grid";
      list.appendChild(row);
      group.items.forEach((item) => {
        const b = document.createElement("button");
        b.className = "preset-card";
        b.style.setProperty("--pc", item.color);
        b.innerHTML = `<span class="preset-swatch" style="background:${item.color}"></span><span class="preset-card-text"><span class="preset-card-label">${item.label}</span><span class="preset-card-states">${item.states}</span></span>`;
        b.onclick = () => loadPreset(item.key);
        row.appendChild(b);
      });
    });
  }

  syncSolidColorUI(hex) {
    document.getElementById("custom-solid-color").value = hex || "#2979FF";
    document.getElementById("custom-solid-hex").value = hex || "#2979FF";
  }
  showGradBuilder(show) {
    document.getElementById("grad-builder-wrap").style.display = show
      ? ""
      : "none";
  }
  updateGradPreview() {
    const s = this.app.store.active;
    document.getElementById("grad-preview").style.background = buildGradientCSS(
      s.grad
    );
  }

  renderGradStops() {
    const s = this.app.store.active;
    const container = document.getElementById("grad-stops");
    container.innerHTML = "";
    s.grad.stops.forEach((stop, i) => {
      const row = document.createElement("div");
      row.className = "grad-stop-row";
      row.innerHTML = `<input type="color" value="${
        stop.color
      }" oninput="updateGradStop(${i},'color',this.value)"><input type="range" min="0" max="100" value="${
        stop.pos
      }" oninput="updateGradStop(${i},'pos',parseInt(this.value))"><span class="grad-stop-pos">${
        stop.pos
      }%</span>${
        s.grad.stops.length > 2
          ? `<button class="grad-stop-del" onclick="removeGradStop(${i})">×</button>`
          : ""
      }`;
      container.appendChild(row);
    });
    this.updateGradPreview();
  }

  renderFlow() {
    const { states, activeId } = this.app.store;
    const flow = document.getElementById("state-flow");
    flow.innerHTML = "";
    states.forEach((s, i) => {
      const node = document.createElement("div");
      node.className = "state-node";
      const pill = document.createElement("button");
      pill.className = "state-pill" + (s.id === activeId ? " active" : "");
      const inputEl = document.createElement("input");
      inputEl.className = "state-pill-label";
      inputEl.value = s.label;
      inputEl.type = "text";
      const dot = document.createElement("div");
      dot.className = "pill-dot";
      dot.style.background =
        s.bgType === "gradient" ? buildGradientCSS(s.grad) : s.bg;
      pill.appendChild(dot);
      pill.appendChild(inputEl);
      if (states.length > 1) {
        const del = document.createElement("button");
        del.className = "delete-state-btn";
        del.textContent = "×";
        del.onclick = (e) => {
          e.stopPropagation();
          const newActive = this.app.store.delete(s.id);
          this.renderFlow();
          this.app.selectState(newActive);
          if (this.app.editorOpen) this.app.gallery.render();
        };
        pill.appendChild(del);
      }
      pill.style.background =
        s.bgType === "gradient" ? buildGradientCSS(s.grad) : s.bg;
      pill.style.color =
        isLight(s.bg) && s.bgType !== "gradient" ? "#111" : "white";
      pill.onclick = () => this.app.selectState(s.id);
      this._makeRenameable(inputEl, s.id);
      node.appendChild(pill);
      if (i < states.length - 1) {
        const arr = document.createElement("div");
        arr.className = "state-arrow";
        arr.innerHTML = "<span>→</span>";
        node.appendChild(arr);
      }
      flow.appendChild(node);
    });
    const addBtn = document.createElement("button");
    addBtn.className = "add-state-btn";
    addBtn.innerHTML = "+ Add";
    addBtn.onclick = () => {
      const newId = this.app.store.add();
      this.renderFlow();
      this.app.selectState(newId);
      if (this.app.editorOpen) this.app.gallery.render();
    };
    flow.appendChild(addBtn);
  }

  _makeRenameable(inputEl, stateId) {
    inputEl.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      inputEl.focus();
    });
    inputEl.addEventListener("blur", () => {
      this.app.store.rename(stateId, inputEl.value);
      this.updateNextSelect();
      this.app.codeGen.generate();
      if (this.app.editorOpen) this.app.gallery.render();
    });
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") inputEl.blur();
      e.stopPropagation();
    });
    inputEl.addEventListener("click", (e) => e.stopPropagation());
  }

  populate(s) {
    this.syncSolidColorUI(s.bg);
    const isGrad = s.bgType === "gradient";
    this.showGradBuilder(isGrad);
    if (isGrad) this.renderGradStops();
    document
      .querySelectorAll("[data-width]")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.width === s.width)
      );
    document
      .querySelectorAll("[data-content]")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.content === s.content)
      );
    document.getElementById("text-field").style.display = [
      "text",
      "icon"
    ].includes(s.content)
      ? ""
      : "none";
    document.getElementById("icon-section").style.display =
      s.content === "icon" ? "" : "none";
    document.getElementById("btn-text-input").value = s.text || "";
    document
      .querySelectorAll(".icon-pick")
      .forEach((b) => b.classList.toggle("active", b.dataset.icon === s.icon));
    document
      .querySelectorAll("[data-ipos]")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.ipos === s.iconPos)
      );
    const iconSlider = document.getElementById("icon-size-slider");
    iconSlider.value = s.iconSize || 20;
    document.getElementById("icon-size-val").textContent =
      (s.iconSize || 20) + "px";
    document
      .querySelectorAll("[data-icolor]")
      .forEach((sw) =>
        sw.classList.toggle("active", sw.dataset.icolor === s.iconColor)
      );
    document
      .querySelectorAll("[data-ianim]")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.ianim === (s.iconAnim || "none"))
      );
    document.getElementById("icon-anim-speed-field").style.display =
      s.iconAnim && s.iconAnim !== "none" ? "" : "none";
    document
      .querySelectorAll("[data-iaspd]")
      .forEach((b) =>
        b.classList.toggle(
          "active",
          b.dataset.iaspd === (s.iconAnimSpeed || "normal")
        )
      );
    document
      .querySelectorAll("[data-iatrig]")
      .forEach((b) =>
        b.classList.toggle(
          "active",
          b.dataset.iatrig === (s.iconAnimTrigger || "always")
        )
      );
    document
      .querySelectorAll("[data-anim]")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.anim === (s.anim || "none"))
      );
    document
      .querySelectorAll("[data-hover]")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.hover === (s.hover || "none"))
      );
    const dur = s.duration || 0;
    document.getElementById("duration-slider").value = dur;
    document.getElementById("dur-val").textContent =
      dur === 0 ? "∞" : dur + "ms";
    this.updateNextSelect();
    document
      .querySelectorAll(".curve-btn")
      .forEach((b) =>
        b.classList.toggle(
          "active",
          b.dataset.easing === (s.transEasing || "spring")
        )
      );
    document
      .querySelectorAll("[data-tspd]")
      .forEach((b) =>
        b.classList.toggle(
          "active",
          b.dataset.tspd === (s.transSpeed || "normal")
        )
      );
    const fsSlider = document.getElementById("font-size-slider");
    fsSlider.value = s.fontSize || 16;
    document.getElementById("font-size-val").textContent =
      (s.fontSize || 16) + "px";
    document
      .querySelectorAll("[data-fw]")
      .forEach((b) =>
        b.classList.toggle(
          "active",
          parseInt(b.dataset.fw) === (s.fontWeight || 500)
        )
      );
    const lsSlider = document.getElementById("ls-slider");
    lsSlider.value = s.letterSpacing || 0;
    document.getElementById("ls-val").textContent =
      (s.letterSpacing || 0) + "px";
    const tc = s.textColor || "auto";
    document
      .querySelectorAll("[data-tc]")
      .forEach((sw) => sw.classList.toggle("active", sw.dataset.tc === tc));
    const tcPick = document.getElementById("text-color-pick");
    if (tcPick && tc !== "auto" && /^#[0-9A-Fa-f]{6}$/.test(tc))
      tcPick.value = tc;
    document
      .querySelectorAll(".radius-btn")
      .forEach((b) =>
        b.classList.toggle(
          "active",
          parseInt(b.dataset.radius) === (s.radius ?? 999)
        )
      );
    document
      .querySelectorAll("[data-shadow]")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.shadow === (s.shadow || "none"))
      );
    document
      .querySelectorAll("[data-border]")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.border === (s.border || "none"))
      );
    document.getElementById("border-color-wrap").style.display =
      s.border && s.border !== "none" ? "" : "none";
    this.app.codeGen.generate();
  }

  updateNextSelect() {
    const s = this.app.store.active;
    const { states } = this.app.store;
    const container = document.getElementById("next-state-select");
    container.innerHTML = "";
    states.forEach((st) => {
      const b = document.createElement("button");
      b.className = "sel-btn" + (s.next === st.id ? " active" : "");
      b.textContent = st.label;
      b.onclick = () => {
        s.next = st.id;
        this.updateNextSelect();
        this.app.codeGen.generate();
      };
      container.appendChild(b);
    });
  }

  // ── Setters ──
  setWidth(val) {
    this.app.store.update({ width: val });
    document
      .querySelectorAll("[data-width]")
      .forEach((b) => b.classList.toggle("active", b.dataset.width === val));
    this._refresh();
  }
  setContent(val) {
    this.app.store.update({ content: val });
    document
      .querySelectorAll("[data-content]")
      .forEach((b) => b.classList.toggle("active", b.dataset.content === val));
    document.getElementById("text-field").style.display = [
      "text",
      "icon"
    ].includes(val)
      ? ""
      : "none";
    document.getElementById("icon-section").style.display =
      val === "icon" ? "" : "none";
    this._refresh();
  }
  updateTextLabel(val) {
    this.app.store.update({ text: val });
    this._refresh();
  }
  setAnim(val) {
    this.app.store.update({ anim: val });
    document
      .querySelectorAll("[data-anim]")
      .forEach((b) => b.classList.toggle("active", b.dataset.anim === val));
  }
  setHover(val) {
    this.app.store.update({ hover: val });
    document
      .querySelectorAll("[data-hover]")
      .forEach((b) => b.classList.toggle("active", b.dataset.hover === val));
    this._refresh();
  }
  selectIcon(key) {
    document
      .querySelectorAll(".icon-pick")
      .forEach((b) => b.classList.remove("active"));
    const a = document.querySelector(`.icon-pick[data-icon="${key}"]`);
    if (a) a.classList.add("active");
    this.app.store.update({ icon: key });
    this._refresh();
  }
  setIconPos(val) {
    this.app.store.update({ iconPos: val });
    document
      .querySelectorAll("[data-ipos]")
      .forEach((b) => b.classList.toggle("active", b.dataset.ipos === val));
    this._refresh();
  }
  updateIconSize(val) {
    this.app.store.update({ iconSize: parseInt(val) });
    document.getElementById("icon-size-val").textContent = val + "px";
    this._refresh();
  }
  setIconColor(val) {
    this.app.store.update({ iconColor: val });
    document
      .querySelectorAll("[data-icolor]")
      .forEach((sw) =>
        sw.classList.toggle("active", sw.dataset.icolor === val)
      );
    this._refresh();
  }
  setIconAnim(val) {
    this.app.store.update({ iconAnim: val });
    document
      .querySelectorAll("[data-ianim]")
      .forEach((b) => b.classList.toggle("active", b.dataset.ianim === val));
    document.getElementById("icon-anim-speed-field").style.display =
      val !== "none" ? "" : "none";
    this._refresh();
  }
  setIconAnimSpeed(val) {
    this.app.store.update({ iconAnimSpeed: val });
    document
      .querySelectorAll("[data-iaspd]")
      .forEach((b) => b.classList.toggle("active", b.dataset.iaspd === val));
    this._refresh();
  }
  setIconAnimTrigger(val) {
    this.app.store.update({ iconAnimTrigger: val });
    document
      .querySelectorAll("[data-iatrig]")
      .forEach((b) => b.classList.toggle("active", b.dataset.iatrig === val));
    this._refresh();
  }
  updateDuration(val) {
    this.app.store.update({ duration: parseInt(val) });
    document.getElementById("dur-val").textContent =
      val === "0" ? "∞" : val + "ms";
    this.app.codeGen.generate();
  }
  setTransEasing(val) {
    this.app.store.update({ transEasing: val });
    document
      .querySelectorAll(".curve-btn")
      .forEach((b) => b.classList.toggle("active", b.dataset.easing === val));
    this.app.codeGen.generate();
  }
  setTransSpeed(val) {
    this.app.store.update({ transSpeed: val });
    document
      .querySelectorAll("[data-tspd]")
      .forEach((b) => b.classList.toggle("active", b.dataset.tspd === val));
    this.app.codeGen.generate();
  }
  updateFontSize(val) {
    this.app.store.update({ fontSize: parseInt(val) });
    document.getElementById("font-size-val").textContent = val + "px";
    this._refresh();
  }
  setFontWeight(val) {
    this.app.store.update({ fontWeight: val });
    document
      .querySelectorAll("[data-fw]")
      .forEach((b) =>
        b.classList.toggle("active", parseInt(b.dataset.fw) === val)
      );
    this._refresh();
  }
  updateLetterSpacing(val) {
    this.app.store.update({ letterSpacing: parseFloat(val) });
    document.getElementById("ls-val").textContent = val + "px";
    this._refresh();
  }
  setTextColor(val, el) {
    this.app.store.update({ textColor: val });
    document
      .querySelectorAll("[data-tc]")
      .forEach((sw) => sw.classList.toggle("active", sw.dataset.tc === val));
    if (val && val !== "auto") {
      const pick = document.getElementById("text-color-pick");
      if (pick && /^#[0-9A-Fa-f]{6}$/.test(val)) pick.value = val;
    }
    this._refresh();
  }
  setRadius(val) {
    this.app.store.update({ radius: val });
    document
      .querySelectorAll(".radius-btn")
      .forEach((b) =>
        b.classList.toggle("active", parseInt(b.dataset.radius) === val)
      );
    this._refresh();
  }
  setShadow(val) {
    this.app.store.update({ shadow: val });
    document
      .querySelectorAll("[data-shadow]")
      .forEach((b) => b.classList.toggle("active", b.dataset.shadow === val));
    this._refresh();
  }
  setBorder(val) {
    this.app.store.update({ border: val });
    document
      .querySelectorAll("[data-border]")
      .forEach((b) => b.classList.toggle("active", b.dataset.border === val));
    document.getElementById("border-color-wrap").style.display =
      val !== "none" ? "" : "none";
    this._refresh();
  }
  setBorderColor(val) {
    this.app.store.update({ borderColor: val });
    document
      .querySelectorAll("[data-bc]")
      .forEach((sw) => sw.classList.toggle("active", sw.dataset.bc === val));
    this._refresh();
  }
  setCustomSolid(hex) {
    this.app.store.update({ bgType: "solid", bg: hex });
    document.getElementById("custom-solid-hex").value = hex;
    this.showGradBuilder(false);
    this._refresh();
  }
  syncHexFromInput(val) {
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) this.setCustomSolid(val);
  }
  updateGradStop(i, prop, val) {
    const s = this.app.store.active;
    s.grad.stops[i][prop] = val;
    this.renderGradStops();
    this._refresh();
  }
  addGradStop() {
    const s = this.app.store.active;
    s.grad.stops.push({ color: "#ffffff", pos: 75 });
    this.renderGradStops();
    this._refresh();
  }
  removeGradStop(i) {
    const s = this.app.store.active;
    if (s.grad.stops.length > 2) {
      s.grad.stops.splice(i, 1);
      this.renderGradStops();
      this._refresh();
    }
  }
  setGradType(type) {
    const s = this.app.store.active;
    s.grad.type = type;
    document
      .querySelectorAll("[data-gt]")
      .forEach((b) => b.classList.toggle("active", b.dataset.gt === type));
    document.getElementById("grad-angle-wrap").style.display =
      type !== "radial" ? "" : "none";
    this.updateGradPreview();
    this._refresh();
  }
  updateGradAngle(val) {
    const s = this.app.store.active;
    s.grad.angle = parseInt(val);
    document.getElementById("grad-angle-val").textContent = val + "°";
    this.updateGradPreview();
    this._refresh();
  }
  toggleGradAnim() {
    const s = this.app.store.active;
    s.grad.animate = !s.grad.animate;
    document
      .getElementById("grad-anim-toggle")
      .classList.toggle("on", s.grad.animate);
    document.getElementById("grad-anim-speed-wrap").style.display = s.grad
      .animate
      ? ""
      : "none";
    this._refresh();
  }
  setGradAnimSpeed(val) {
    const s = this.app.store.active;
    s.grad.speed = val;
    document
      .querySelectorAll("[data-gas]")
      .forEach((b) => b.classList.toggle("active", b.dataset.gas === val));
    this._refresh();
  }
}

// ═══════════════════════════════════════════════════════
//  GALLERY UI
// ═══════════════════════════════════════════════════════
class GalleryUI {
  constructor(app) {
    this.app = app;
    this.isPlaying = false;
    this._playTimer = null;
  }

  syncSelection() {
    const { activeId } = this.app.store;
    document
      .querySelectorAll("#gallery-grid .gallery-cell")
      .forEach((c) =>
        c.classList.toggle("editing-state", c.dataset.stateId === activeId)
      );
  }

  render() {
    const { states, activeId } = this.app.store;
    const grid = document.getElementById("gallery-grid");
    if (!grid) return;
    this.stopPlay();
    grid.innerHTML = "";
    states.forEach((s) => {
      const cell = document.createElement("div");
      cell.className =
        "gallery-cell" + (s.id === activeId ? " editing-state" : "");
      cell.dataset.stateId = s.id;

      const dragHandle = document.createElement("div");
      dragHandle.className = "gallery-drag-handle";
      dragHandle.title = "Drag to reorder";
      for (let i = 0; i < 6; i++)
        dragHandle.appendChild(document.createElement("span"));
      cell.appendChild(dragHandle);

      const header = document.createElement("div");
      header.className = "gallery-cell-header";
      const labelEl = document.createElement("div");
      labelEl.className = "gallery-cell-label";
      labelEl.textContent = s.label;
      const badgeWrap = document.createElement("div");
      badgeWrap.style.cssText = "display:flex;align-items:center;gap:4px;";
      const editBadge = document.createElement("div");
      editBadge.className = "gallery-cell-edit-badge";
      editBadge.textContent = "editing";
      badgeWrap.appendChild(editBadge);
      const infoBtn = document.createElement("button");
      infoBtn.className = "gallery-info-btn";
      infoBtn.title = "State info & code";
      infoBtn.textContent = "ⓘ";
      infoBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.app.selectState(s.id);
        this.app.infoPanel.show(s.id);
      });
      badgeWrap.appendChild(infoBtn);
      const dupBtn = document.createElement("button");
      dupBtn.className = "gallery-del-btn gallery-dup-btn";
      dupBtn.title = "Duplicate state";
      dupBtn.textContent = "⎘";
      dupBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const copyId = this.app.store.duplicate(s.id);
        this.app.selectState(copyId);
        this.app.editor.renderFlow();
        this.render();
      });
      badgeWrap.appendChild(dupBtn);
      if (states.length > 1) {
        const delBtn = document.createElement("button");
        delBtn.className = "gallery-del-btn";
        delBtn.title = "Delete state";
        delBtn.textContent = "×";
        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const newActive = this.app.store.delete(s.id);
          this.app.editor.renderFlow();
          this.app.selectState(newActive);
          this.render();
        });
        badgeWrap.appendChild(delBtn);
      }
      header.appendChild(labelEl);
      header.appendChild(badgeWrap);
      cell.appendChild(header);

      const previewWrap = document.createElement("div");
      previewWrap.innerHTML = `<button class="proto-btn" id="gallery-btn-${s.id}" style="pointer-events:none;" tabindex="-1"><div class="btn-inner"><div class="btn-icon-wrap"><svg viewBox="0 0 24 24"></svg></div><span class="btn-label"></span></div><div class="btn-dots"><span></span><span></span><span></span></div><div class="btn-check"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 12l5 5L20 7"/></svg></div><div class="btn-spinner"></div></button>`;
      cell.appendChild(previewWrap.firstElementChild);

      cell.addEventListener("click", () => {
        this.stopPlay();
        this.app.selectState(s.id);
        this.app.infoPanel.show(s.id);
      });

      cell.draggable = true;
      cell.addEventListener("dragstart", (e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", s.id);
        cell.classList.add("gallery-dragging");
      });
      cell.addEventListener("dragend", () => {
        cell.classList.remove("gallery-dragging");
        document
          .querySelectorAll("#gallery-grid .gallery-cell")
          .forEach((c) => c.classList.remove("gallery-drag-over"));
      });
      cell.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        document
          .querySelectorAll("#gallery-grid .gallery-cell")
          .forEach((c) => c.classList.remove("gallery-drag-over"));
        cell.classList.add("gallery-drag-over");
      });
      cell.addEventListener("drop", (e) => {
        e.preventDefault();
        const fromId = e.dataTransfer.getData("text/plain");
        if (fromId === s.id) return;
        this.app.store.reorder(fromId, s.id);
        this.app.editor.renderFlow();
        this.render();
      });

      grid.appendChild(cell);
      this.app.renderer.applyToEl(
        s,
        document.getElementById(`gallery-btn-${s.id}`)
      );
    });

    const addCell = document.createElement("div");
    addCell.className = "gallery-add-cell";
    addCell.innerHTML =
      '<span style="font-size:22px;line-height:1">+</span><span>Add State</span>';
    addCell.addEventListener("click", () => {
      const newId = this.app.store.add();
      this.app.editor.renderFlow();
      this.app.selectState(newId);
      this.render();
    });
    grid.appendChild(addCell);
    this.app.renderer.applyAll(this.app.store.activeId);
  }

  playSequence() {
    if (this.isPlaying) {
      this.stopPlay();
      return;
    }
    const { states } = this.app.store;
    if (states.length < 2) return;
    this.isPlaying = true;
    const playBtn = document.getElementById("gallery-play-btn");
    if (playBtn) {
      playBtn.textContent = "■ Stop";
      playBtn.classList.add("playing");
    }
    let i = 0;
    const step = () => {
      const s = states[i];
      this.app.renderer.applyToEl(s, this.app.renderer.previewBtn);
      document
        .querySelectorAll("#gallery-grid .gallery-cell")
        .forEach((c) => c.classList.remove("active-step"));
      const gEl = document.getElementById(`gallery-btn-${s.id}`);
      if (gEl) {
        const cell = gEl.closest(".gallery-cell");
        if (cell) {
          cell.classList.add("active-step");
        }
      }
      const lbl = document.getElementById("gallery-current-label");
      if (lbl) lbl.textContent = `— ${s.label}`;
      const dur = s.duration > 0 ? s.duration : 1200;
      this._playTimer = setTimeout(() => {
        i = (i + 1) % states.length;
        step();
      }, dur);
    };
    step();
  }

  stopPlay() {
    this.isPlaying = false;
    if (this._playTimer) {
      clearTimeout(this._playTimer);
      this._playTimer = null;
    }
    const pb = document.getElementById("gallery-play-btn");
    if (pb) {
      pb.textContent = "▶ Play All";
      pb.classList.remove("playing");
    }
    const lbl = document.getElementById("gallery-current-label");
    if (lbl) lbl.textContent = "";
    this.app.renderer.applyAll(this.app.store.activeId);
  }
}

// ═══════════════════════════════════════════════════════
//  STATE INFO PANEL
// ═══════════════════════════════════════════════════════
class StateInfoPanel {
  constructor(app) {
    this.app = app;
  }

  show(id) {
    const s = this.app.store.getById(id);
    if (!s) return;
    document.getElementById("state-info-panel-name").textContent = s.label;
    const body = document.getElementById("state-info-modal-body");
    body.innerHTML = "";

    // Settings section
    const settingsSection = document.createElement("div");
    const settingsTitle = document.createElement("div");
    settingsTitle.className = "state-info-section-title";
    settingsTitle.textContent = "Settings";
    settingsSection.appendChild(settingsTitle);
    const chips = document.createElement("div");
    chips.className = "state-info-chips";
    const chip = (key, val, dotColor) => {
      const c = document.createElement("div");
      c.className = "state-info-chip";
      if (dotColor) {
        const dot = document.createElement("div");
        dot.className = "state-info-color-dot";
        dot.style.background = dotColor;
        c.appendChild(dot);
      }
      const k = document.createElement("span");
      k.className = "state-info-chip-key";
      k.textContent = key;
      const v = document.createElement("span");
      v.className = "state-info-chip-val";
      v.textContent = val;
      c.appendChild(k);
      c.appendChild(v);
      chips.appendChild(c);
    };
    if (s.bgType === "gradient") {
      chip("BG", `${s.grad.type} gradient`);
      if (s.grad.animate) chip("grad anim", s.grad.speed || "normal");
    } else chip("BG", s.bg, s.bg);
    chip("width", s.width);
    chip("content", s.content);
    if (s.content === "text" && s.text) chip("label", `"${s.text}"`);
    if (s.content === "icon" && s.icon) {
      chip("icon", s.icon);
      chip("icon pos", s.iconPos || "left");
      if (s.iconAnim && s.iconAnim !== "none") {
        chip("icon anim", `${s.iconAnim} / ${s.iconAnimSpeed}`);
        chip("trigger", s.iconAnimTrigger || "always");
      }
    }
    chip("click anim", s.anim || "none");
    chip("hover", s.hover || "none");
    chip("font", `${s.fontSize || 16}px / ${s.fontWeight || 500}`);
    if (s.letterSpacing) chip("letter-spacing", `${s.letterSpacing}px`);
    chip("radius", (s.radius ?? 999) >= 999 ? "pill" : `${s.radius}px`);
    if (s.shadow && s.shadow !== "none") chip("shadow", s.shadow);
    if (s.border && s.border !== "none")
      chip("border", s.border, s.borderColor || "#fff");
    chip(
      "transition",
      `${s.transEasing || "spring"} / ${s.transSpeed || "normal"}`
    );
    if (s.duration > 0) {
      const nextS = this.app.store.getById(s.next);
      chip("duration", `${s.duration}ms → ${nextS ? nextS.label : s.next}`);
    }
    settingsSection.appendChild(chips);
    body.appendChild(settingsSection);

    // CSS section
    body.appendChild(this._codeSection("CSS", "CSS", this._buildCSS(s)));

    // JS section
    body.appendChild(this._codeSection("JavaScript", "JS", this._buildJS(s)));

    // Tailwind section
    body.appendChild(
      this._codeSection("Tailwind", "Tailwind CSS", this._buildTW(s))
    );

    document.getElementById("state-info-panel").classList.add("open");
  }

  _codeSection(titleText, langText, rawHTML) {
    const section = document.createElement("div");
    const title = document.createElement("div");
    title.className = "state-info-section-title";
    title.textContent = titleText;
    section.appendChild(title);
    const hdr = document.createElement("div");
    hdr.className = "state-info-code-header";
    const lang = document.createElement("div");
    lang.className = "state-info-code-lang";
    lang.textContent = langText;
    const copyBtn = document.createElement("button");
    copyBtn.className = "state-info-copy-btn";
    copyBtn.textContent = "⎘ Copy";
    hdr.appendChild(lang);
    hdr.appendChild(copyBtn);
    section.appendChild(hdr);
    const block = document.createElement("div");
    block.className = "state-info-code-block";
    block.innerHTML = rawHTML;
    section.appendChild(block);
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(block.textContent).then(() => {
        copyBtn.textContent = "✓ Copied";
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.textContent = "⎘ Copy";
          copyBtn.classList.remove("copied");
        }, 1800);
      });
    });
    return section;
  }

  _buildCSS(s) {
    const bgCSS = s.bgType === "gradient" ? buildGradientCSS(s.grad) : s.bg;
    const w =
      { full: "100%", pill: "160px", circle: "52px", auto: "auto" }[s.width] ||
      "100%";
    const r = (s.radius ?? 999) >= 999 ? "999px" : (s.radius ?? 999) + "px";
    const bc = s.border !== "none" ? s.borderColor || "#fff" : null;
    const eId = escHtml(s.id),
      eLabel = escHtml(s.label),
      eBg = escHtml(bgCSS),
      eBc = bc ? escHtml(bc) : null,
      eHover = escHtml(s.hover);
    const cg = this.app.codeGen;
    const lines = [];
    lines.push(`<span class="si-cm">/* ${eLabel} state */</span>`);
    lines.push(`.<span class="si-prop">btn--${eId}</span> {`);
    lines.push(
      `  <span class="si-prop">background</span>: <span class="si-str">${eBg}</span>;`
    );
    if (s.bgType === "gradient" && s.grad && s.grad.animate) {
      const spd =
        { slow: "3s", normal: "1.8s", fast: "0.9s" }[s.grad.speed] || "1.8s";
      lines.push(
        `  <span class="si-prop">background-size</span>: <span class="si-val">300% 100%</span>;`
      );
      lines.push(
        `  <span class="si-prop">animation</span>: <span class="si-str">grad-anim ${escHtml(
          spd
        )} ease infinite</span>;`
      );
    }
    lines.push(
      `  <span class="si-prop">width</span>: <span class="si-val">${escHtml(
        w
      )}</span>;`
    );
    lines.push(
      `  <span class="si-prop">border-radius</span>: <span class="si-val">${escHtml(
        r
      )}</span>;`
    );
    lines.push(
      `  <span class="si-prop">font-size</span>: <span class="si-val">${escHtml(
        String(s.fontSize || 16)
      )}px</span>;`
    );
    lines.push(
      `  <span class="si-prop">font-weight</span>: <span class="si-val">${escHtml(
        String(s.fontWeight || 500)
      )}</span>;`
    );
    if (s.letterSpacing)
      lines.push(
        `  <span class="si-prop">letter-spacing</span>: <span class="si-val">${escHtml(
          String(s.letterSpacing)
        )}px</span>;`
      );
    if (s.textColor && s.textColor !== "auto")
      lines.push(
        `  <span class="si-prop">color</span>: <span class="si-str">${escHtml(
          s.textColor
        )}</span>;`
      );
    if (s.shadow && s.shadow !== "none")
      lines.push(
        `  <span class="si-prop">box-shadow</span>: <span class="si-str">${escHtml(
          cg.shadowCss(s)
        )}</span>;`
      );
    if (eBc)
      lines.push(
        `  <span class="si-prop">border</span>: <span class="si-str">${
          s.border === "ring" ? "3" : "2"
        }px solid ${eBc}</span>;`
      );
    lines.push(`}`);
    if (s.hover && s.hover !== "none") {
      const HOVER_PROPS = {
        scale: [{ p: "transform", v: "scale(1.05)" }],
        lift: [
          { p: "transform", v: "translateY(-3px)" },
          { p: "box-shadow", v: "0 8px 20px rgba(0,0,0,0.2)" }
        ],
        ring: [{ p: "box-shadow", v: "0 0 0 4px rgba(255,255,255,0.5)" }],
        bright: [{ p: "filter", v: "brightness(1.15)" }]
      };
      const hProps = HOVER_PROPS[s.hover];
      lines.push("");
      lines.push(`<span class="si-cm">/* hover */</span>`);
      lines.push(
        `.btn--${eId}.<span class="si-prop">hover-${eHover}</span>:hover {`
      );
      if (hProps)
        hProps.forEach((hp) =>
          lines.push(
            `  <span class="si-prop">${
              hp.p
            }</span>: <span class="si-val">${escHtml(hp.v)}</span>;`
          )
        );
      lines.push(`}`);
    }
    return lines.join("\n");
  }

  _buildJS(s) {
    const eId = escHtml(s.id),
      eLabel = escHtml(s.label),
      eHover = escHtml(s.hover);
    const jsFnName = escHtml(
      s.label.replace(/\s+/g, "").replace(/[^A-Za-z0-9_$]/g, "")
    );
    const lines = [];
    lines.push(
      `<span class="si-cm">/* Activate the &quot;${eLabel}&quot; state */</span>`
    );
    lines.push(
      `<span class="si-kw">function</span> <span class="si-prop">set${jsFnName}</span>() {`
    );
    lines.push(
      `  btn.className = <span class="si-str">'btn btn--${eId}'</span>;`
    );
    if (s.hover && s.hover !== "none")
      lines.push(
        `  btn.classList.add(<span class="si-str">'hover-${eHover}'</span>);`
      );
    if (s.duration > 0) {
      const nextS = this.app.store.getById(s.next);
      const nextFn = nextS
        ? escHtml(
            nextS.label.replace(/\s+/g, "").replace(/[^A-Za-z0-9_$]/g, "")
          )
        : escHtml(s.next);
      lines.push(
        `  <span class="si-cm">// auto-advance after ${escHtml(
          String(s.duration)
        )}ms</span>`
      );
      lines.push(
        `  setTimeout(() => set${nextFn}(), <span class="si-val">${escHtml(
          String(s.duration)
        )}</span>);`
      );
    }
    lines.push(`}`);
    return lines.join("\n");
  }

  _buildTW(s) {
    const twClasses = [];
    if (s.bgType === "gradient") {
      const g = s.grad;
      if (g.type === "linear") {
        const deg = g.angle || 90;
        const dirMap = {
          0: "to-t",
          45: "to-tr",
          90: "to-r",
          135: "to-br",
          180: "to-b",
          225: "to-bl",
          270: "to-l",
          315: "to-tl"
        };
        const closest = Object.keys(dirMap).reduce((a, b) =>
          Math.abs(b - deg) < Math.abs(a - deg) ? b : a
        );
        const dir = dirMap[closest] || "to-r";
        if (g.stops && g.stops.length >= 2) {
          twClasses.push(`bg-gradient-${dir}`, `from-[${g.stops[0].color}]`);
          if (g.stops.length > 2) twClasses.push(`via-[${g.stops[1].color}]`);
          twClasses.push(`to-[${g.stops[g.stops.length - 1].color}]`);
        } else twClasses.push(`bg-gradient-${dir}`);
      } else twClasses.push(`bg-[image:${escHtml(buildGradientCSS(g))}]`);
      if (g.animate)
        twClasses.push(
          "bg-[length:300%_100%]",
          "animate-[grad-anim_1.8s_ease_infinite]"
        );
    } else twClasses.push(`bg-[${s.bg}]`);
    twClasses.push(
      { full: "w-full", pill: "w-40", circle: "w-13 h-13", auto: "w-auto" }[
        s.width
      ] || "w-full"
    );
    const rv = s.radius ?? 999;
    twClasses.push(
      rv >= 999
        ? "rounded-full"
        : rv === 0
        ? "rounded-none"
        : rv <= 4
        ? "rounded"
        : rv <= 8
        ? "rounded-lg"
        : rv <= 12
        ? "rounded-xl"
        : `rounded-[${rv}px]`
    );
    const fs = s.fontSize || 16;
    twClasses.push(
      fs <= 12
        ? "text-xs"
        : fs <= 14
        ? "text-sm"
        : fs <= 16
        ? "text-base"
        : fs <= 18
        ? "text-lg"
        : fs <= 20
        ? "text-xl"
        : `text-[${fs}px]`
    );
    const fw = s.fontWeight || 500;
    twClasses.push(
      fw <= 300
        ? "font-light"
        : fw <= 400
        ? "font-normal"
        : fw <= 500
        ? "font-medium"
        : fw <= 600
        ? "font-semibold"
        : fw <= 700
        ? "font-bold"
        : "font-extrabold"
    );
    if (s.letterSpacing) twClasses.push(`tracking-[${s.letterSpacing}px]`);
    if (s.textColor && s.textColor !== "auto")
      twClasses.push(`text-[${s.textColor}]`);
    if (s.shadow && s.shadow !== "none")
      twClasses.push(
        { sm: "shadow-sm", md: "shadow-md", lg: "shadow-lg", xl: "shadow-xl" }[
          s.shadow
        ] || "shadow"
      );
    if (s.border && s.border !== "none") {
      twClasses.push(
        s.border === "ring" ? "border-[3px]" : "border-2",
        `border-[${s.borderColor || "#fff"}]`
      );
    }
    if (s.hover && s.hover !== "none")
      twClasses.push(
        {
          lift: "hover:-translate-y-0.5 hover:shadow-lg",
          glow: "hover:shadow-[0_0_20px_rgba(0,0,0,0.3)]",
          dim: "hover:opacity-80",
          grow: "hover:scale-105"
        }[s.hover] || `hover:data-[hover=${escHtml(s.hover)}]:...`
      );
    twClasses.push(
      "transition-all",
      { slow: "duration-500", normal: "duration-200", fast: "duration-100" }[
        s.transSpeed
      ] || "duration-200"
    );
    const twStr = twClasses.join(" ");
    const eLabel = escHtml(s.label);
    return [
      `<span class="si-cm">/* ${eLabel} state */</span>`,
      `<span class="si-str">"${escHtml(twStr)}"</span>`
    ].join("\n");
  }

  hide() {
    document.getElementById("state-info-panel").classList.remove("open");
  }
}

// ═══════════════════════════════════════════════════════
//  EXAMPLES VIEW
// ═══════════════════════════════════════════════════════
class ExamplesView {
  constructor(app) {
    this.app = app;
    this.engines = [];
  }

  createEngine(id, stateDefs) {
    const btn = document.getElementById(`btn-${id}`),
      bg = document.getElementById(`btn-${id}-bg`),
      cl = document.getElementById(`btn-${id}-cl`);
    const inner = document.getElementById(`btn-${id}-inner`),
      iw = document.getElementById(`btn-${id}-iw`),
      svg = document.getElementById(`btn-${id}-svg`);
    const lbl = document.getElementById(`btn-${id}-lbl`),
      dots = document.getElementById(`btn-${id}-dots`),
      chk = document.getElementById(`btn-${id}-chk`);
    const spin = document.getElementById(`btn-${id}-spin`),
      track = document.getElementById(`track-${id}`);
    let idx = 0,
      timer = null,
      transTimer = null;

    function buildTrack() {
      track.innerHTML = "";
      stateDefs.forEach((s, i) => {
        const node = document.createElement("div");
        node.className = "st-node";
        node.innerHTML = `<div class="st-pill" id="tp-${id}-${i}"><div class="st-dot"></div>${s.label}</div>`;
        if (i < stateDefs.length - 1) {
          const arr = document.createElement("div");
          arr.className = "st-arrow";
          arr.textContent = "›";
          node.appendChild(arr);
        }
        track.appendChild(node);
      });
    }
    function setTrackActive(i) {
      stateDefs.forEach((_, j) => {
        const pill = document.getElementById(`tp-${id}-${j}`);
        if (pill) pill.classList.toggle("active", j === i);
      });
    }
    function applyContent(s) {
      btn.className = btn.className
        .replace(/hover-\w+|icon-right|check-drawn/g, "")
        .trim();
      if (s.hover && s.hover !== "none") btn.classList.add("hover-" + s.hover);
      if (s.iconPos === "right") btn.classList.add("icon-right");
      btn.style.fontSize = (s.fontSize || 14) + "px";
      btn.style.fontWeight = s.fontWeight || 500;
      btn.style.letterSpacing = (s.letterSpacing || 0) + "px";
      const r = s.radius ?? 999;
      btn.style.borderRadius = r >= 999 ? "999px" : r + "px";
      const bgColor = s.bgType === "solid" ? s.bg : "#9B8ADE";
      btn.style.boxShadow =
        s.shadow === "sm"
          ? "0 2px 8px rgba(0,0,0,0.35)"
          : s.shadow === "md"
          ? "0 6px 20px rgba(0,0,0,0.45)"
          : s.shadow === "glow"
          ? `0 0 20px ${bgColor}aa, 0 0 40px ${bgColor}44`
          : "";
      const bc = s.borderColor || "#ffffff";
      btn.style.border =
        s.border === "ring"
          ? `3px solid ${bc}`
          : s.border === "outline"
          ? `2px solid ${bc}`
          : "none";
      inner.style.display = "none";
      dots.style.display = "none";
      chk.style.display = "none";
      spin.style.display = "none";
      if (s.content === "dots") {
        dots.style.display = "flex";
      } else if (s.content === "spinner") {
        spin.style.display = "block";
      } else if (s.content === "check") {
        chk.style.display = "flex";
        btn.classList.remove("check-drawn");
        setTimeout(() => btn.classList.add("check-drawn"), 60);
      } else {
        inner.style.display = "flex";
        lbl.style.display =
          s.content === "icon" && s.iconPos === "only" ? "none" : "";
        lbl.textContent = s.text || "";
        if (s.icon && ICONS[s.icon] && s.content === "icon") {
          iw.style.display = "flex";
          svg.innerHTML = ICONS[s.icon];
          const sz = s.iconSize || 18;
          svg.setAttribute("width", sz);
          svg.setAttribute("height", sz);
          svg.setAttribute("viewBox", "0 0 24 24");
          const col =
            s.iconColor === "inherit"
              ? s.bgType === "solid" && isLight(s.bg)
                ? "#111"
                : "white"
              : s.iconColor || "white";
          svg.style.fill = col;
          iw.className = "sb-icon-wrap";
          if (s.iconAnim && s.iconAnim !== "none") {
            const suf =
              s.iconAnimSpeed === "slow"
                ? "-slow"
                : s.iconAnimSpeed === "fast"
                ? "-fast"
                : "";
            iw.classList.add(`icon-anim-${s.iconAnim}${suf}`);
          }
        } else iw.style.display = "none";
      }
    }
    function transitionTo(i) {
      const s = stateDefs[i];
      if (!s) return;
      if (transTimer) {
        clearTimeout(transTimer);
        transTimer = null;
      }
      const easingCSS =
        SB_EASINGS[s.transEasing || "spring"] || SB_EASINGS.spring;
      const timing = TRANS_SPEED[s.transSpeed || "normal"];
      bg.style.transition = "none";
      bg.style.opacity = "0";
      bg.style.animation = "";
      bg.style.backgroundSize = "";
      if (s.bgType === "gradient") {
        bg.style.background = buildGradientCSS(s.grad);
        if (s.grad && s.grad.animate) {
          bg.style.backgroundSize = "300% 100%";
          bg.style.animation = `sgrad ${
            GRAD_SPEEDS[s.grad.speed] || "1.8s"
          } ease infinite`;
        }
      } else {
        bg.style.background = s.bg;
      }
      void bg.offsetWidth;
      bg.style.transition = `opacity ${timing.bg}ms ${easingCSS}`;
      btn.style.width = WIDTH_MAP[s.width] || "100%";
      btn.style.margin = s.width !== "full" ? "0 auto" : "";
      const newColor =
        s.bgType === "gradient" || !isLight(s.bg) ? "white" : "#111";
      cl.style.transition = `opacity ${timing.out}ms ease, transform ${timing.out}ms ease`;
      cl.classList.remove("in");
      cl.classList.add("out");
      transTimer = setTimeout(() => {
        btn.style.color = newColor;
        bg.style.opacity = "1";
        applyContent(s);
        cl.classList.remove("out");
        cl.classList.add("in");
        cl.style.transition = `opacity ${timing.in}ms ${easingCSS}, transform ${timing.in}ms ${easingCSS}`;
        void cl.offsetWidth;
        cl.style.opacity = "1";
        cl.style.transform = "scale(1)";
        transTimer = setTimeout(() => {
          btn.style.animation = "";
          btn.style.backgroundSize = "";
          if (s.bgType === "gradient") {
            btn.style.background = buildGradientCSS(s.grad);
            if (s.grad && s.grad.animate) {
              btn.style.backgroundSize = "300% 100%";
              btn.style.animation = `sgrad ${
                GRAD_SPEEDS[s.grad.speed]
              } ease infinite`;
            }
          } else {
            btn.style.background = s.bg;
          }
          bg.style.transition = "none";
          bg.style.opacity = "0";
          bg.style.background = "transparent";
          bg.style.animation = "";
        }, timing.bg);
      }, timing.out);
      setTrackActive(i);
    }
    function step() {
      transitionTo(idx);
      const s = stateDefs[idx];
      const dur = s.duration > 0 ? s.duration : 900;
      timer = setTimeout(() => {
        idx = (idx + 1) % stateDefs.length;
        step();
      }, dur);
    }
    function restart() {
      if (timer) clearTimeout(timer);
      if (transTimer) clearTimeout(transTimer);
      idx = 0;
      step();
    }
    buildTrack();
    const first = stateDefs[0];
    btn.style.background =
      first.bgType === "gradient" ? buildGradientCSS(first.grad) : first.bg;
    btn.style.color =
      !isLight(first.bg) || first.bgType === "gradient" ? "white" : "#111";
    btn.addEventListener("click", restart);
    return {
      start: (delay = 0) => setTimeout(step, delay),
      stop: () => {
        if (timer) clearTimeout(timer);
        if (transTimer) clearTimeout(transTimer);
        timer = null;
        transTimer = null;
      }
    };
  }

  renderExamples() {
    const grid = document.getElementById("ex-grid");
    grid.innerHTML = "";
    EXAMPLE_CARDS.forEach((card) => {
      const el = document.createElement("div");
      el.className = "ex-card";
      el.innerHTML = `<div class="ex-meta"><div class="ex-cat">${card.cat}</div><div class="ex-title">${card.title}</div><div class="ex-desc">${card.desc}</div></div><div class="ex-stage"><button class="sb" id="btn-${card.id}"><div class="sb-bg" id="btn-${card.id}-bg"></div><div class="sb-cl" id="btn-${card.id}-cl"><div class="sb-inner" id="btn-${card.id}-inner"><div class="sb-icon-wrap" id="btn-${card.id}-iw"><svg id="btn-${card.id}-svg" viewBox="0 0 24 24"></svg></div><span class="sb-label" id="btn-${card.id}-lbl">${card.title}</span></div><div class="sb-dots" id="btn-${card.id}-dots"><span></span><span></span><span></span></div><div class="sb-check" id="btn-${card.id}-chk"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 12l5 5L20 7"/></svg></div><div class="sb-spinner" id="btn-${card.id}-spin"></div></div></button></div><div class="state-track" id="track-${card.id}"></div><div class="ex-footer"><span style="font-size:9px;color:var(--muted);font-family:'DM Mono',monospace"></span><button class="ex-edit-btn" onclick="editPreset('${card.preset}')">Edit →</button></div>`;
      grid.appendChild(el);
    });
  }

  rewireEngines() {
    this.engines.forEach((e) => e.stop && e.stop());
    this.engines = [];
    let delay = 0;
    EXAMPLE_CARDS.forEach((card) => {
      const preset = ALL_PRESETS[card.preset];
      if (!preset) return;
      const engine = this.createEngine(card.id, preset);
      engine.start(delay);
      this.engines.push(engine);
      delay += 260;
    });
  }
}

// ═══════════════════════════════════════════════════════
//  APP — COORDINATOR
// ═══════════════════════════════════════════════════════
class App {
  constructor() {
    this.store = new StateStore();
    this.editorOpen = false;
    this.renderer = new ButtonRenderer(this);
    this.codeGen = new CodeGenerator(this);
    this.editor = new EditorUI(this);
    this.gallery = new GalleryUI(this);
    this.infoPanel = new StateInfoPanel(this);
    this.examples = new ExamplesView(this);
  }

  selectState(id) {
    this.store.activeId = id;
    const s = this.store.active;
    document.getElementById(
      "editing-label"
    ).textContent = `Editing: ${s.label}`;
    this.editor.renderFlow();
    this.editor.populate(s);
    this.renderer.applyAll(id);
    document.getElementById("editor-panel").scrollTop = 0;
    this.gallery.syncSelection();
    if (document.getElementById("state-info-panel").classList.contains("open"))
      this.infoPanel.show(id);
  }

  toggleEditor() {
    this.editorOpen = !this.editorOpen;
    document
      .getElementById("builder-panel")
      .classList.toggle("hidden", !this.editorOpen);
    const btn = document.getElementById("editor-toggle-btn");
    btn.classList.toggle("active", this.editorOpen);
    btn.textContent = this.editorOpen
      ? "✕ Close Builder"
      : "✨ New Button Builder";
    document
      .getElementById("examples-main")
      .classList.toggle("hidden", this.editorOpen);
    if (this.editorOpen) {
      this.gallery.render();
      this.infoPanel.show(this.store.activeId);
      document
        .getElementById("builder")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      this.gallery.stopPlay();
      this.store.saveCustom();
      this.examples.renderExamples();
      this.examples.rewireEngines();
      this.infoPanel.hide();
    }
  }

  openEditor() {
    if (!this.editorOpen) this.toggleEditor();
  }

  init() {
    this.examples.renderExamples();
    let delay = 0;
    EXAMPLE_CARDS.forEach((card) => {
      const preset = ALL_PRESETS[card.preset];
      if (!preset) return;
      const engine = this.examples.createEngine(card.id, preset);
      engine.start(delay);
      this.examples.engines.push(engine);
      delay += 260;
    });
    this.editor.buildIconGrid();
    this.editor.buildCurveGrid();
    this.editor.buildRadiusRow();
    this.editor.buildShadowRow();
    this.editor.buildBorderColorSwatches();
    this.editor.buildBgSwatches();
    this.editor.buildPresetList();
    this.editor.renderFlow();
    this.selectState("idle");
  }
}

const app = new App();

// ═══════════════════════════════════════════════════════
//  KEYBOARD NAVIGATION
// ═══════════════════════════════════════════════════════
document.addEventListener("keydown", (e) => {
  if (!app.editorOpen) return;
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    e.preventDefault();
    const { states, activeId } = app.store;
    const idx = states.findIndex((s) => s.id === activeId);
    const next =
      e.key === "ArrowRight"
        ? Math.min(idx + 1, states.length - 1)
        : Math.max(idx - 1, 0);
    if (next !== idx) app.selectState(states[next].id);
  }
});

// ═══════════════════════════════════════════════════════
//  GLOBAL BRIDGES FOR INLINE onclick HANDLERS
// ═══════════════════════════════════════════════════════
function toggleEditor() {
  app.toggleEditor();
}
function playSequence() {
  app.gallery.playSequence();
}
function handlePreviewClick(e) {
  app.renderer.handleClick(e);
}
function hideStateInfo() {
  app.infoPanel.hide();
}
function copyCode() {
  app.codeGen.copyCode();
}
function exportToKit() {
  app.codeGen.exportToKit();
}
function selectState(id) {
  app.selectState(id);
}
function setWidth(v) {
  app.editor.setWidth(v);
}
function setContent(v) {
  app.editor.setContent(v);
}
function updateTextLabel(v) {
  app.editor.updateTextLabel(v);
}
function setAnim(v) {
  app.editor.setAnim(v);
}
function setHover(v) {
  app.editor.setHover(v);
}
function setIconPos(v) {
  app.editor.setIconPos(v);
}
function updateIconSize(v) {
  app.editor.updateIconSize(v);
}
function setIconColor(v) {
  app.editor.setIconColor(v);
}
function setIconAnim(v) {
  app.editor.setIconAnim(v);
}
function setIconAnimSpeed(v) {
  app.editor.setIconAnimSpeed(v);
}
function setIconAnimTrigger(v) {
  app.editor.setIconAnimTrigger(v);
}
function updateDuration(v) {
  app.editor.updateDuration(v);
}
function setTransEasing(v) {
  app.editor.setTransEasing(v);
}
function setTransSpeed(v) {
  app.editor.setTransSpeed(v);
}
function updateFontSize(v) {
  app.editor.updateFontSize(v);
}
function setFontWeight(v) {
  app.editor.setFontWeight(v);
}
function updateLetterSpacing(v) {
  app.editor.updateLetterSpacing(v);
}
function setTextColor(v, el) {
  app.editor.setTextColor(v, el);
}
function setRadius(v) {
  app.editor.setRadius(v);
}
function setShadow(v) {
  app.editor.setShadow(v);
}
function setBorder(v) {
  app.editor.setBorder(v);
}
function setCustomSolid(v) {
  app.editor.setCustomSolid(v);
}
function syncHexFromInput(v) {
  app.editor.syncHexFromInput(v);
}
function updateGradStop(i, p, v) {
  app.editor.updateGradStop(i, p, v);
}
function addGradStop() {
  app.editor.addGradStop();
}
function removeGradStop(i) {
  app.editor.removeGradStop(i);
}
function setGradType(t) {
  app.editor.setGradType(t);
}
function updateGradAngle(v) {
  app.editor.updateGradAngle(v);
}
function toggleGradAnim() {
  app.editor.toggleGradAnim();
}
function setGradAnimSpeed(v) {
  app.editor.setGradAnimSpeed(v);
}
function editPreset(n) {
  app.openEditor();
  app.store.loadPreset(n);
  document.getElementById(
    "editing-label"
  ).textContent = `Editing: ${app.store.active.label}`;
  app.editor.renderFlow();
  app.selectState(app.store.activeId);
  setTimeout(() => app.renderer.applyAll(app.store.activeId), 50);
  if (app.editorOpen) app.gallery.render();
}
function loadPreset(n) {
  app.gallery.stopPlay();
  app.store.loadPreset(n);
  document.getElementById(
    "editing-label"
  ).textContent = `Editing: ${app.store.active.label}`;
  app.editor.renderFlow();
  app.selectState(app.store.activeId);
  setTimeout(() => app.renderer.applyAll(app.store.activeId), 50);
  if (app.editorOpen) app.gallery.render();
}

app.init();

// ── HERO SHOWCASE: auto-play each example button through its real states ──
(function initHeroShowcase() {
  const heroPresets = ["deploy", "match", "like"];
  let delay = 0;
  heroPresets.forEach((key) => {
    const stateDefs = ALL_PRESETS[key];
    if (!stateDefs) return;
    const engine = app.examples.createEngine("hero-" + key, stateDefs);
    engine.start(delay);
    delay += 240;
  });
})();