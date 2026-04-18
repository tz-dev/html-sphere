// ─── DOM references ───────────────────────────────────────────────────────────

const canvas = document.getElementById("sphereCanvas");
const ctx = canvas.getContext("2d");

const compassCanvas = document.getElementById("compassCanvas");
const compassCtx = compassCanvas.getContext("2d");

const stage = document.getElementById("stage");
const overlay = document.getElementById("overlay");
const warpOverlay = document.getElementById("warpOverlay");
const starLabel = document.getElementById("starLabel");
const customCursor = document.getElementById("customCursor");

const speedInput = document.getElementById("speed");
const zoomInput = document.getElementById("zoom");
const axisXInput = document.getElementById("axisX");
const axisYInput = document.getElementById("axisY");
const axisZInput = document.getElementById("axisZ");
const latCountInput = document.getElementById("latCount");
const lonCountInput = document.getElementById("lonCount");

const speedVal = document.getElementById("speedVal");
const zoomVal = document.getElementById("zoomVal");
const axisXVal = document.getElementById("axisXVal");
const axisYVal = document.getElementById("axisYVal");
const axisZVal = document.getElementById("axisZVal");
const latCountVal = document.getElementById("latCountVal");
const lonCountVal = document.getElementById("lonCountVal");

const pauseBtn = document.getElementById("pauseBtn");
const resetSphereBtn = document.getElementById("resetSphereBtn");
const resetBtn = document.getElementById("resetBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const showFpsInput = document.getElementById("showFps");
const fpsBox = document.getElementById("fpsBox");
const fpsVal = document.getElementById("fpsVal");
const fpsCanvas = document.getElementById("fpsCanvas");
const fpsCtx = fpsCanvas.getContext("2d");

const showCompassInput = document.getElementById("showCompass");
const compassBox = document.getElementById("compassBox");

const starDensityInput = document.getElementById("starDensity");
const starDensityVal = document.getElementById("starDensityVal");
const sphereGlowAmountInput = document.getElementById("sphereGlowAmount");
const sphereGlowAmountVal = document.getElementById("sphereGlowAmountVal");
const starGlowAmountInput = document.getElementById("starGlowAmount");
const starGlowAmountVal = document.getElementById("starGlowAmountVal");
const starBrightnessInput = document.getElementById("starBrightness");
const starBrightnessVal = document.getElementById("starBrightnessVal");
const showGlowInput = document.getElementById("showGlow");
const showStarGlowInput = document.getElementById("showStarGlow");
const counterRotateStarsInput = document.getElementById("counterRotateStars");

const hueInput = document.getElementById("hue");
const hueVal = document.getElementById("hueVal");
const huePreview = document.getElementById("huePreview");

const sceneBrightnessInput = document.getElementById("sceneBrightness");
const sceneBrightnessVal = document.getElementById("sceneBrightnessVal");
const sceneContrastInput = document.getElementById("sceneContrast");
const sceneContrastVal = document.getElementById("sceneContrastVal");

const autoWarpInput = document.getElementById("autoWarp");
const autoWarpIntervalInput = document.getElementById("autoWarpInterval");

const stageHueInput = document.getElementById("stageHue");
const stageHueVal = document.getElementById("stageHueVal");
const stageIntensityInput = document.getElementById("stageIntensity");
const stageIntensityVal = document.getElementById("stageIntensityVal");

const ringEnabledInput = document.getElementById("ringEnabled");
const ringInnerRadiusInput = document.getElementById("ringInnerRadius");
const ringOuterRadiusInput = document.getElementById("ringOuterRadius");

const openMenuBtn = document.getElementById("openMenuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");

const sphereRadiusInput = document.getElementById("sphereRadius");
const sphereRadiusVal = document.getElementById("sphereRadiusVal");

const showInfoLabelInput = document.getElementById("showInfoLabel");
const sphereInfoLabel = document.getElementById("sphereInfoLabel");
const sphereInfoTitle = document.getElementById("sphereInfoTitle");
const sphereInfoGrid = document.getElementById("sphereInfoGrid");

const stageBrightnessInput = document.getElementById("stageBrightness");
const stageBrightnessVal = document.getElementById("stageBrightnessVal");

const pixelationInput = document.getElementById("pixelation");
const pixelationVal = document.getElementById("pixelationVal");

const playPauseOverlay = document.getElementById("playPauseOverlay");
const playPauseIcon = document.getElementById("playPauseIcon");

// ─── Constants ────────────────────────────────────────────────────────────────

const minZoom = 0.15;
const maxZoom = 1.75;
const inertiaDamping = 2.4;
const autoReturnStrength = 2.8;
const starCounterRotateStrength = 0.1;
const starFieldMotionFactor = 0.72;
const starWarpScatterStrength = 1.35;
const autoWarpZoomDriftSpeed = 0.06;
const ringSpeedFactor = 0.5;
const overlayTimeoutMs = 5000;

const warpTransientStarSpawnRate = 1200;
const warpTransientStarMaxCount = 900;
const warpTransientStarSpeedMin = 900;
const warpTransientStarSpeedMax = 2200;
const warpTransientStarLifeMin = 0.55;
const warpTransientStarLifeMax = 1.35;
const warpTransientStarSpawnRadiusMin = 40;
const warpTransientStarSpawnRadiusMax = 220;
const warpTransientStarFadeIn = 0.5;

// Warp timing and tuning parameters
const WARP_CONFIG = {
  timing: {
    select: 0.25,
    center: 1.8,
    zoom: 0.8,
    exit: 0.4,
    settle: 0.3
  },
  zoom: {
    centerBoost: 1.08,
    centerBlend: 0.22,
    exitFadeStart: 0.18
  },
  drift: {
    // How far the sphere drifts off-screen during warp exit.
    // 1.6 ensures it is pushed well beyond the longest canvas diagonal.
    distanceFactor: 1.6
  }
};

// ─── State ────────────────────────────────────────────────────────────────────

let cachedCanvasWidth = 0;
let cachedCanvasHeight = 0;
let cachedCompassWidth = 0;
let cachedCompassHeight = 0;

let showGlow = true;
let showStarGlow = true;
let sphereGlowAmount = 1;
let starGlowAmount = 1;
let starBrightness = 1;
let paused = false;

let lastTime = 0;
let fpsSmoothed = 0;
let _fpsUpdateCounter = 0;
let cachedFpsWidth = 0;
let cachedFpsHeight = 0;
const fpsGraphMax = 144;
let fpsGraphSmoothed = 0;
const fpsGraphHistory = [];
const fpsGraphHistoryMax = 120;
let inactivityTimer = null;

let sphereRotation = identityMatrix();
let viewRotation = identityMatrix();
let zoom = 1;

let dragMode = "none";
let dragPointerId = null;
let lastPointerX = 0;
let lastPointerY = 0;
let pointerClientX = window.innerWidth * 0.5;
let pointerClientY = window.innerHeight * 0.5;
let cursorAngle = 0;

let sphereAngularVelocity = [0, 0, 0];
let sphereScreen = { cx: 0, cy: 0, radius: 0 };

let stars = [];
let counterRotateStars = false;
let starfieldRotation = identityMatrix();
let starViewRotation = identityMatrix();
let hoveredStarIdx = -1;

let sphereHue = 210;
let sceneBrightness = 1;
let sceneContrast = 1;
let sphereRadiusScale = 1;
let stageBrightness = 1;
let stageHue = 210;
let stageIntensity = 1;

let stageR1X = 22;
let stageR1Y = 14;
let stageR2X = 78;
let stageR2Y = 24;
let stageLinearAngle = 180;

let ringEnabled = false;
let ringInnerRadius = 1.08;
let ringOuterRadius = 1.45;
let ringRotation = identityMatrix();

let showInfoLabel = true;
let sphereLabelIdCounter = 1;
let currentSphereLabelId = `SPHERE-${String(sphereLabelIdCounter).padStart(3, "0")}`;
let currentSourceStarLabel = "UNASSIGNED";
let currentLabelPosition = "right";
const labelPositions = ["left", "right", "top", "bottom", "top-left", "top-right", "bottom-left", "bottom-right"];

let pixelateEnabled = false;
let pixelationStrength = 1;

const pixelCanvas = document.createElement("canvas");
const pixelCtx = pixelCanvas.getContext("2d");

// ─── Warp state ───────────────────────────────────────────────────────────────

let autoWarp = false;
let autoWarpTimer = 0;
let warpActive = false;
let warpProgress = 0;
let warpElapsed = 0;
let warpStarIdx = -1;

let warpSphereAlpha = 1;
let warpSphereOffsetX = 0;
let warpSphereOffsetY = 0;
let warpDriftDirX = 0;
let warpDriftDirY = 0;

let warpStartZoom = 1;
let warpTargetZoom = 2.2;
let warpStartHue = 210;
let warpTargetHue = 210;
let warpStartSphereGlow = 1;
let warpTargetSphereGlow = 1;
let warpStartAxisX = 30;
let warpTargetAxisX = 30;
let warpStartAxisY = 100;
let warpTargetAxisY = 100;
let warpStartAxisZ = 10;
let warpTargetAxisZ = 10;
let warpStartBrightness = 1;
let warpTargetBrightness = 1;
let warpStartContrast = 1;
let warpTargetContrast = 1;
let warpStartSpeed = 120;
let warpTargetSpeed = 120;
let warpStartStarDensity = 4;
let warpTargetStarDensity = 4;
let warpStartStarGlow = 1;
let warpTargetStarGlow = 1;
let warpStartStarBrightness = 1;
let warpTargetStarBrightness = 1;
let warpTargetRingInnerRadius = 1.08;
let warpTargetRingOuterRadius = 1.45;
let warpTargetRingEnabled = false;
let warpStartRadiusScale = 1;
let warpTargetRadiusScale = 1;

let warpStartViewRotation = identityMatrix();
let warpTargetViewRotation = identityMatrix();
let warpStartStarViewRotation = identityMatrix();
let warpTargetStarViewRotation = identityMatrix();
let warpStartRingRotation = identityMatrix();
let warpTargetRingRotation = identityMatrix();
let warpCounterRotateWasActive = false;

let warpStartStageHue = 210;
let warpTargetStageHue = 210;
let warpStartStageIntensity = 1;
let warpTargetStageIntensity = 1;
let warpStartStageBrightness = 1;
let warpStartStageR1X = 22;
let warpTargetStageR1X = 22;
let warpStartStageR1Y = 14;
let warpTargetStageR1Y = 14;
let warpStartStageR2X = 78;
let warpTargetStageR2X = 78;
let warpStartStageR2Y = 24;
let warpTargetStageR2Y = 24;
let warpStartStageLinearAngle = 180;
let warpTargetStageLinearAngle = 180;

let warpTransientStars = [];

// ─── Math helpers ─────────────────────────────────────────────────────────────

function identityMatrix() {
  return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function addVectors(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function subtractVectors(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function scaleVector(v, s) {
  return [v[0] * s, v[1] * s, v[2] * s];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function lengthVector(v) {
  return Math.hypot(v[0], v[1], v[2]);
}

function normalizeVector(v) {
  const l = lengthVector(v);
  return l < 1e-10 ? [0, 0, 0] : [v[0] / l, v[1] / l, v[2] / l];
}

function multiplyMatrices(a, b) {
  return [
    [
      a[0][0] * b[0][0] + a[0][1] * b[1][0] + a[0][2] * b[2][0],
      a[0][0] * b[0][1] + a[0][1] * b[1][1] + a[0][2] * b[2][1],
      a[0][0] * b[0][2] + a[0][1] * b[1][2] + a[0][2] * b[2][2],
    ],
    [
      a[1][0] * b[0][0] + a[1][1] * b[1][0] + a[1][2] * b[2][0],
      a[1][0] * b[0][1] + a[1][1] * b[1][1] + a[1][2] * b[2][1],
      a[1][0] * b[0][2] + a[1][1] * b[1][2] + a[1][2] * b[2][2],
    ],
    [
      a[2][0] * b[0][0] + a[2][1] * b[1][0] + a[2][2] * b[2][0],
      a[2][0] * b[0][1] + a[2][1] * b[1][1] + a[2][2] * b[2][1],
      a[2][0] * b[0][2] + a[2][1] * b[1][2] + a[2][2] * b[2][2],
    ],
  ];
}

function multiplyMatrixVector(m, v) {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ];
}

function transposeMatrix(m) {
  return [
    [m[0][0], m[1][0], m[2][0]],
    [m[0][1], m[1][1], m[2][1]],
    [m[0][2], m[1][2], m[2][2]],
  ];
}

function orthonormalizeMatrix(m) {
  let x = [m[0][0], m[1][0], m[2][0]];
  let y = [m[0][1], m[1][1], m[2][1]];

  x = normalizeVector(x);

  const dotXY = x[0] * y[0] + x[1] * y[1] + x[2] * y[2];
  y = subtractVectors(y, scaleVector(x, dotXY));
  y = normalizeVector(y);

  let z = cross(x, y);
  z = normalizeVector(z);

  y = normalizeVector(cross(z, x));

  return [
    [x[0], y[0], z[0]],
    [x[1], y[1], z[1]],
    [x[2], y[2], z[2]],
  ];
}

function rotationMatrixFromAxisAngle(axis, angle) {
  const [x, y, z] = normalizeVector(axis);
  if (Math.hypot(x, y, z) < 1e-10 || Math.abs(angle) < 1e-10) return identityMatrix();
  const c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;
  return [
    [t * x * x + c,     t * x * y - s * z, t * x * z + s * y],
    [t * x * y + s * z, t * y * y + c,     t * y * z - s * x],
    [t * x * z - s * y, t * y * z + s * x, t * z * z + c    ],
  ];
}

function applyAngularVelocity(r, omega, dt) {
  const mag = lengthVector(omega);
  if (mag < 1e-10) return r;
  return orthonormalizeMatrix(
    multiplyMatrices(rotationMatrixFromAxisAngle(scaleVector(omega, 1 / mag), mag * dt), r)
  );
}

function randomRotationMatrix() {
  return rotationMatrixFromAxisAngle(randomUnitVector(), Math.random() * Math.PI * 2);
}

function randomUnitVector() {
  const u = Math.random() * 2 - 1;
  const a = Math.random() * Math.PI * 2;
  const r = Math.sqrt(1 - u * u);
  return [Math.cos(a) * r, u, Math.sin(a) * r];
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpAngleDeg(a, b, t) {
  let diff = ((b - a + 540) % 360) - 180;
  return (a + diff * t + 360) % 360;
}

function lerpAngleShortestDeg(a, b, t) {
  let diff = ((b - a + 540) % 360) - 180;
  return (a + diff * t + 360) % 360;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeInQuint(t) {
  return t * t * t * t * t;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function hslaString(h, s, l, a) {
  return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a.toFixed(3)})`;
}

// ─── Quaternion helpers (for slerp) ───────────────────────────────────────────

function matToQuat(m) {
  const tr = m[0][0] + m[1][1] + m[2][2];
  let s, w, x, y, z;
  if (tr > 0) {
    s = 0.5 / Math.sqrt(tr + 1);
    w = 0.25 / s;
    x = (m[2][1] - m[1][2]) * s;
    y = (m[0][2] - m[2][0]) * s;
    z = (m[1][0] - m[0][1]) * s;
  } else if (m[0][0] > m[1][1] && m[0][0] > m[2][2]) {
    s = 2 * Math.sqrt(1 + m[0][0] - m[1][1] - m[2][2]);
    w = (m[2][1] - m[1][2]) / s; x = 0.25 * s;
    y = (m[0][1] + m[1][0]) / s; z = (m[0][2] + m[2][0]) / s;
  } else if (m[1][1] > m[2][2]) {
    s = 2 * Math.sqrt(1 + m[1][1] - m[0][0] - m[2][2]);
    w = (m[0][2] - m[2][0]) / s; x = (m[0][1] + m[1][0]) / s;
    y = 0.25 * s; z = (m[1][2] + m[2][1]) / s;
  } else {
    s = 2 * Math.sqrt(1 + m[2][2] - m[0][0] - m[1][1]);
    w = (m[1][0] - m[0][1]) / s; x = (m[0][2] + m[2][0]) / s;
    y = (m[1][2] + m[2][1]) / s; z = 0.25 * s;
  }
  return [w, x, y, z];
}

function slerpQuat(q1, q2, t) {
  let dot = q1[0]*q2[0] + q1[1]*q2[1] + q1[2]*q2[2] + q1[3]*q2[3];
  if (dot < 0) { q2 = q2.map(v => -v); dot = -dot; }
  if (dot > 0.9995) {
    const r = [q1[0]+t*(q2[0]-q1[0]), q1[1]+t*(q2[1]-q1[1]), q1[2]+t*(q2[2]-q1[2]), q1[3]+t*(q2[3]-q1[3])];
    const l = Math.hypot(...r); return r.map(v => v / l);
  }
  const theta0 = Math.acos(dot), theta = theta0 * t;
  const sinTheta = Math.sin(theta), sinTheta0 = Math.sin(theta0);
  const s1 = Math.cos(theta) - dot * sinTheta / sinTheta0, s2 = sinTheta / sinTheta0;
  return [s1*q1[0]+s2*q2[0], s1*q1[1]+s2*q2[1], s1*q1[2]+s2*q2[2], s1*q1[3]+s2*q2[3]];
}

function quatToMat(q) {
  const [w, x, y, z] = q;
  return [
    [1-2*(y*y+z*z), 2*(x*y-z*w),   2*(x*z+y*w)  ],
    [2*(x*y+z*w),   1-2*(x*x+z*z), 2*(y*z-x*w)  ],
    [2*(x*z-y*w),   2*(y*z+x*w),   1-2*(x*x+y*y)],
  ];
}

// ─── Warp phase helpers ───────────────────────────────────────────────────────

function getWarpTotalDuration() {
  const t = WARP_CONFIG.timing;
  return t.select + t.center + t.zoom + t.exit + t.settle;
}

function phaseProgress(elapsed, start, duration) {
  if (duration <= 0) return elapsed >= start ? 1 : 0;
  return clamp((elapsed - start) / duration, 0, 1);
}

// ─── Input helpers ────────────────────────────────────────────────────────────

function getAxisWeights() {
  return [
    Number(axisXInput.value) / 100,
    Number(axisYInput.value) / 100,
    Number(axisZInput.value) / 100,
  ];
}

function getPresetAngularVelocity() {
  const s = Number(speedInput.value) * Math.PI / 180;
  const [x, y, z] = getAxisWeights();
  return [x * s, y * s, z * s];
}

function getAutoWarpIntervalSeconds() {
  return clamp(Number(autoWarpIntervalInput.value) || 12, 2, 120);
}

function getRandomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function randomizeAround(value, percent, min, max) {
  const factor = getRandomInRange(1 - percent, 1 + percent);
  return clamp(value * factor, min, max);
}

function getRandomStarIndex() {
  if (!stars.length) return -1;
  return Math.floor(Math.random() * stars.length);
}

function getLatCount() { return clamp(Number(latCountInput.value) || 0, 0, 16); }
function getLonCount() { return clamp(Number(lonCountInput.value) || 0, 0, 16); }
function syncZoomFromInput() { zoom = clamp(Number(zoomInput.value) / 100, minZoom, maxZoom); }
function syncInputFromZoom() { zoomInput.value = String(Math.round(zoom * 100)); }
function getSphereRadiusScale() { return clamp(Number(sphereRadiusInput.value) / 100, 0.5, 1.8); }
function syncSphereRadiusFromInput() { sphereRadiusScale = getSphereRadiusScale(); }
function syncInputFromSphereRadius() { sphereRadiusInput.value = String(Math.round(sphereRadiusScale * 100)); }
function getStageIntensity() { return clamp(Number(stageIntensityInput.value) / 100, 0, 2); }
function getStageBrightness() { return clamp(Number(stageBrightnessInput.value) / 100, 0.4, 1.8); }

function syncRingInputs() {
  let inner = Number(ringInnerRadiusInput.value);
  let outer = Number(ringOuterRadiusInput.value);

  if (!Number.isFinite(inner)) inner = 1.08;
  if (!Number.isFinite(outer)) outer = 1.45;

  inner = Math.max(1.0, inner);
  outer = Math.max(inner + 0.05, outer);

  ringInnerRadius = inner;
  ringOuterRadius = outer;
  ringEnabled = ringEnabledInput.checked;

  ringInnerRadiusInput.value = inner.toFixed(2);
  ringOuterRadiusInput.value = outer.toFixed(2);
  ringInnerRadiusInput.min = "1.00";
  ringOuterRadiusInput.min = (inner + 0.05).toFixed(2);
}

// ─── Hue / color ──────────────────────────────────────────────────────────────

let _cachedHslColors = null;
let _cachedHslHue = -1;

// Returns a cached set of HSLA color strings for the given hue.
function hslColors(h) {
  if (h === _cachedHslHue && _cachedHslColors) return _cachedHslColors;
  _cachedHslHue = h;
  _cachedHslColors = {
    high:      `hsl(${h}, 90%, 92%)`,
    mid1:      `hsl(${h}, 85%, 80%)`,
    mid2:      `hsl(${h}, 70%, 60%)`,
    mid3:      `hsl(${h}, 60%, 35%)`,
    low1:      `hsl(${h}, 55%, 20%)`,
    deep:      `hsl(${h}, 50%, 7%)`,
    glow1:     `hsla(${h}, 85%, 70%, 0.14)`,
    glow2:     `hsla(${h}, 70%, 55%, 0.09)`,
    glow3:     `hsla(${h}, 60%, 40%, 0.035)`,
    seam:      `hsla(${h}, 85%, 75%, 0.88)`,
    seamDark:  `rgba(8, 20, 28, 0.22)`,
    rim:       `hsla(${h}, 85%, 80%, 0.24)`,
  };
  return _cachedHslColors;
}

function updateHuePreview() {
  huePreview.style.background = `hsl(${sphereHue}, 85%, 65%)`;
  huePreview.style.boxShadow  = `0 0 6px 1px hsl(${sphereHue}, 80%, 60%)`;
}

function updateSceneFilter() {
  canvas.style.filter = `brightness(${sceneBrightness}) contrast(${sceneContrast})`;
}

function updateStageIntensity() {
  stageIntensity = getStageIntensity();
  stage.style.setProperty("--stage-intensity", stageIntensity.toFixed(2));
}

function updateStageBrightness() {
  stageBrightness = getStageBrightness();
  stage.style.setProperty("--stage-brightness", stageBrightness.toFixed(2));
}

function updateLabels() {
  const [x, y, z] = getAxisWeights();
  const density = clamp(Number(starDensityInput.value) / 100, 0.25, 8);
  sphereGlowAmount = clamp(Number(sphereGlowAmountInput.value) / 100, 0, 3);
  starGlowAmount = clamp(Number(starGlowAmountInput.value) / 100, 0, 3);
  starBrightness = clamp(Number(starBrightnessInput.value) / 100, 0.2, 2);
  sphereRadiusScale = getSphereRadiusScale();
  sphereRadiusVal.textContent = `${sphereRadiusScale.toFixed(2)}×`;

  starDensityVal.textContent = `${density.toFixed(2)}×`;
  sphereGlowAmountVal.textContent = `${sphereGlowAmount.toFixed(2)}×`;
  starGlowAmountVal.textContent = `${starGlowAmount.toFixed(2)}×`;
  stageHueVal.textContent = `${Math.round(stageHue)}°`;
  stageIntensityVal.textContent = `${stageIntensity.toFixed(2)}×`;

  sceneBrightness = clamp(Number(sceneBrightnessInput.value) / 100, 0.4, 1.8);
  sceneContrast = clamp(Number(sceneContrastInput.value) / 100, 0.4, 1.8);

  if (!warpActive) {
    stageHue = Number(stageHueInput.value);
    stageIntensity = getStageIntensity();
    stageBrightness = getStageBrightness();
  }

  stageBrightnessVal.textContent = `${stageBrightness.toFixed(2)}×`;
  sceneBrightnessVal.textContent = `${sceneBrightness.toFixed(2)}×`;
  sceneContrastVal.textContent = `${sceneContrast.toFixed(2)}×`;
  updateSceneFilter();

  pixelationStrength = Number(pixelationInput.value);
  pixelateEnabled = pixelationStrength > 1;
  pixelationVal.textContent = pixelationStrength <= 1 ? "off" : `${pixelationStrength}px`;

  speedVal.textContent = `${speedInput.value} °/s`;
  zoomVal.textContent = `${zoom.toFixed(2)}×`;
  axisXVal.textContent = x.toFixed(2);
  axisYVal.textContent = y.toFixed(2);
  axisZVal.textContent = z.toFixed(2);
  starBrightnessVal.textContent = `${starBrightness.toFixed(2)}×`;
  if (latCountVal) latCountVal.textContent = String(getLatCount());
  if (lonCountVal) lonCountVal.textContent = String(getLonCount());
  hueVal.textContent = `${sphereHue}°`;
  updateHuePreview();
}

function setControlsDisabled(disabled) {
  const controls = [
    speedInput, zoomInput, axisXInput, axisYInput, axisZInput,
    sphereRadiusInput, stageHueInput, stageIntensityInput, stageBrightnessInput,
    starDensityInput, sphereGlowAmountInput, starGlowAmountInput, starBrightnessInput,
    hueInput, sceneBrightnessInput, sceneContrastInput
  ];
  controls.forEach(el => { if (el) el.disabled = disabled; });
  autoWarpInput.disabled = false;
  autoWarpIntervalInput.disabled = false;
}

// ─── Stage background ─────────────────────────────────────────────────────────

function randomizeStageControls() {
  stageHueInput.value = String(Math.floor(getRandomInRange(0, 360)));
  stageIntensityInput.value = String(Math.round(getRandomInRange(45, 180)));
  stageBrightnessInput.value = String(Math.round(getRandomInRange(70, 145)));
  stageHue = Number(stageHueInput.value);
  updateStageIntensity();
  updateStageBrightness();
  updateLabels();
}

function randomStageBackground(randomizeControls = false) {
  if (randomizeControls) randomizeStageControls();

  const intensity = stageIntensity;
  const hueBase = stageHue + rand(-28, 28);
  const hueOffset = rand(-28, 28);

  stageR1X = rand(8, 38);
  stageR1Y = rand(4, 28);
  const r1stop = rand(18, 36);

  stageR2X = rand(62, 92);
  stageR2Y = rand(10, 38);
  const r2stop = rand(18, 38);

  const radialAlphaMin = 0.03 + intensity * 0.02;
  const radialAlphaMax = 0.08 + intensity * 0.08;

  const r1Color = hslaString(hueBase + rand(-16, 16), rand(72, 96), rand(60, 76),
    clamp(rand(radialAlphaMin, radialAlphaMax), 0, 1));

  const r2Color = hslaString(hueBase + hueOffset, rand(68, 94), rand(56, 74),
    clamp(rand(radialAlphaMin, radialAlphaMax), 0, 1));

  stageLinearAngle = randInt(145, 225);
  const linAngle = `${stageLinearAngle}deg`;

  const lightBoost = intensity * 6;
  const satBoost = intensity * 6;

  const lin1 = hslaString(hueBase + rand(-18, 12),
    clamp(rand(48, 72) + satBoost, 0, 100), clamp(rand(8, 18) + lightBoost * 0.35, 0, 100), 1);

  const lin2 = hslaString(hueBase + rand(-10, 20),
    clamp(rand(40, 68) + satBoost, 0, 100), clamp(rand(10, 24) + lightBoost * 0.45, 0, 100), 1);

  const lin3 = hslaString(hueBase + rand(-22, 18),
    clamp(rand(38, 62) + satBoost * 0.8, 0, 100), clamp(rand(3, 10) + lightBoost * 0.2, 0, 100), 1);

  const lin2Stop = `${randInt(35, 62)}%`;

  stage.style.setProperty("--stage-r1-x", `${stageR1X}%`);
  stage.style.setProperty("--stage-r1-y", `${stageR1Y}%`);
  stage.style.setProperty("--stage-r1-r", r1Color);
  stage.style.setProperty("--stage-r1-stop", `${r1stop}%`);
  stage.style.setProperty("--stage-r2-x", `${stageR2X}%`);
  stage.style.setProperty("--stage-r2-y", `${stageR2Y}%`);
  stage.style.setProperty("--stage-r2-r", r2Color);
  stage.style.setProperty("--stage-r2-stop", `${r2stop}%`);
  stage.style.setProperty("--stage-lin-angle", linAngle);
  stage.style.setProperty("--stage-lin-c1", lin1);
  stage.style.setProperty("--stage-lin-c2", lin2);
  stage.style.setProperty("--stage-lin-c2-stop", lin2Stop);
  stage.style.setProperty("--stage-lin-c3", lin3);

  updateStageIntensity();
}

// Applies the stage background using the current (non-randomized) control values.
// Used during warp interpolation to smoothly transition the background.
function applyStageBackgroundFromCurrentControls() {
  const hueBase = stageHue;
  const intensity = stageIntensity;

  const radialAlpha1 = clamp(0.025 + intensity * 0.045, 0, 1);
  const radialAlpha2 = clamp(0.02 + intensity * 0.04, 0, 1);

  const r1Color = hslaString(hueBase - 10, 86, 68, radialAlpha1);
  const r2Color = hslaString(hueBase + 18, 82, 62, radialAlpha2);

  const lightBoost = intensity * 6;
  const satBoost = intensity * 6;

  const lin1 = hslaString(hueBase - 14, clamp(54 + satBoost, 0, 100), clamp(10 + lightBoost * 0.35, 0, 100), 1);
  const lin2 = hslaString(hueBase + 8,  clamp(48 + satBoost, 0, 100), clamp(14 + lightBoost * 0.45, 0, 100), 1);
  const lin3 = hslaString(hueBase - 20, clamp(42 + satBoost * 0.8, 0, 100), clamp(4 + lightBoost * 0.2, 0, 100), 1);

  stage.style.setProperty("--stage-r1-x", `${stageR1X}%`);
  stage.style.setProperty("--stage-r1-y", `${stageR1Y}%`);
  stage.style.setProperty("--stage-r1-r", r1Color);
  stage.style.setProperty("--stage-r1-stop", "28%");
  stage.style.setProperty("--stage-r2-x", `${stageR2X}%`);
  stage.style.setProperty("--stage-r2-y", `${stageR2Y}%`);
  stage.style.setProperty("--stage-r2-r", r2Color);
  stage.style.setProperty("--stage-r2-stop", "30%");
  stage.style.setProperty("--stage-lin-angle", `${stageLinearAngle}deg`);
  stage.style.setProperty("--stage-lin-c1", lin1);
  stage.style.setProperty("--stage-lin-c2", lin2);
  stage.style.setProperty("--stage-lin-c2-stop", "46%");
  stage.style.setProperty("--stage-lin-c3", lin3);
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function buildStars() {
  const w = cachedCanvasWidth  || canvas.clientWidth;
  const h = cachedCanvasHeight || canvas.clientHeight;
  const df = clamp(Number(starDensityInput.value) / 100, 0.25, 8);
  const count = clamp(Math.floor((w * h / 2200) * df), 80, 12000);
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      dir: randomUnitVector(),
      distance: 3.8 + Math.random() * 4.4,
      radius: 0.4 + Math.random() * 1.8,
      alpha: 0.12 + Math.random() * 0.42,
      brightness: 0.55 + Math.random() * 0.75,
      tint: Math.random(),
      name: `Star ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 999) + 1}`,
    });
  }
  cacheStarColors();
}

// Pre-compute integer RGB components and the RGB string for each star to avoid
// repeated string allocation inside the hot draw loop.
function cacheStarColors() {
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    const b = (star.brightness ?? 1) * starBrightness;

    star._rv = Math.round((155 + (1 - star.tint) * 40) * b);
    star._gv = Math.round((205 + star.tint * 30) * b);
    star._bv = Math.round((220 + star.tint * 25) * b);

    star._rv = clamp(star._rv, 80, 255);
    star._gv = clamp(star._gv, 80, 255);
    star._bv = clamp(star._bv, 80, 255);

    star._rgbStr = `${star._rv}, ${star._gv}, ${star._bv}`;
  }
}

// Returns the screen-space position of a star, or null when behind or off-screen.
function starScreenPos(star, width, height) {
  const useCounterRotate = counterRotateStars && !warpActive;
  const viewForStars = useCounterRotate
    ? multiplyMatrices(transposeMatrix(viewRotation), starfieldRotation)
    : starViewRotation;

  const d = star.dir, dist = star.distance;
  const wx = d[0] * dist, wy = d[1] * dist, wz = d[2] * dist;
  const m = viewForStars;
  const rx = m[0][0] * wx + m[0][1] * wy + m[0][2] * wz;
  const ry = m[1][0] * wx + m[1][1] * wy + m[1][2] * wz;
  const rz = m[2][0] * wx + m[2][1] * wy + m[2][2] * wz;

  if (rz < -0.6) return null;

  const camera = 10;
  const perspective = camera / (camera - rz);
  const starZoom = 0.82 + zoom * 0.18;
  const baseScale = Math.min(width, height) * 0.35;
  const aspect = width / Math.max(1, height);
  const stretchX = Math.pow(aspect, 0.36);
  const stretchY = Math.pow(1 / aspect, 0.16);

  const x = width * 0.5 + rx * baseScale * stretchX * perspective * starZoom * starFieldMotionFactor;
  const y = height * 0.5 - ry * baseScale * stretchY * perspective * starZoom * starFieldMotionFactor;

  if (x < -20 || x > width + 20 || y < -20 || y > height + 20) return null;

  return { x, y, r: star.radius * perspective * (0.9 + zoom * 0.12), rotated: [rx, ry, rz] };
}

// Returns the index of the star closest to (mx, my) within hit radius, or -1.
function findStarNear(mx, my) {
  const w = cachedCanvasWidth  || canvas.clientWidth;
  const h = cachedCanvasHeight || canvas.clientHeight;
  let bestIdx = -1, bestDist = 28;
  for (let i = 0; i < stars.length; i++) {
    const pos = starScreenPos(stars[i], w, h);
    if (!pos) continue;
    const dx = pos.x - mx, dy = pos.y - my;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const hitR = Math.max(pos.r * 2.5, 10);
    if (dist < hitR && dist < bestDist) { bestDist = dist; bestIdx = i; }
  }
  return bestIdx;
}

// Returns a random visible star, trying random samples first for speed, then
// falling back to a linear scan. Returns null if no star is on-screen.
function getRandomVisibleStar() {
  if (!stars.length) return null;
  const width  = cachedCanvasWidth  || canvas.clientWidth;
  const height = cachedCanvasHeight || canvas.clientHeight;
  const attempts = Math.min(stars.length, 80);
  for (let i = 0; i < attempts; i++) {
    const idx = Math.floor(Math.random() * stars.length);
    const pos = starScreenPos(stars[idx], width, height);
    if (pos) return { idx, pos };
  }
  for (let i = 0; i < stars.length; i++) {
    const pos = starScreenPos(stars[i], width, height);
    if (pos) return { idx: i, pos };
  }
  return null;
}

// ─── Canvas setup ─────────────────────────────────────────────────────────────

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  cachedCanvasWidth  = rect.width;
  cachedCanvasHeight = rect.height;

  const cr = compassCanvas.getBoundingClientRect();
  compassCanvas.width = Math.max(1, Math.round(cr.width * dpr));
  compassCanvas.height = Math.max(1, Math.round(cr.height * dpr));
  compassCtx.setTransform(1, 0, 0, 1, 0, 0);
  compassCtx.scale(dpr, dpr);
  cachedCompassWidth  = cr.width;
  cachedCompassHeight = cr.height;

  const fr = fpsCanvas.getBoundingClientRect();
  fpsCanvas.width = Math.max(1, Math.round(fr.width * dpr));
  fpsCanvas.height = Math.max(1, Math.round(fr.height * dpr));
  fpsCtx.setTransform(1, 0, 0, 1, 0, 0);
  fpsCtx.scale(dpr, dpr);
  cachedFpsWidth = fr.width;
  cachedFpsHeight = fr.height;

  buildStars();
}

// ─── Auto-warp zoom drift ─────────────────────────────────────────────────────

// Slowly returns zoom to 1× while auto-warp is active and no warp is running.
function tickAutoWarpZoomDrift(dt) {
  if (!autoWarp || paused || warpActive || dragMode !== "none") return;
  const targetZoom = 1;
  const delta = autoWarpZoomDriftSpeed * dt;
  if (zoom < targetZoom) {
    zoom = Math.min(targetZoom, zoom + delta);
    syncInputFromZoom();
    updateLabels();
  } else if (zoom > targetZoom) {
    zoom = Math.max(targetZoom, zoom - delta);
    syncInputFromZoom();
    updateLabels();
  }
}

function triggerAutoWarp() {
  if (!autoWarp || warpActive || dragMode !== "none") return;
  const target = getRandomVisibleStar();
  if (!target) return;
  startWarp(target.idx, target.pos.x, target.pos.y);
}

// ─── Transform helpers ────────────────────────────────────────────────────────

function transformSpherePoint(lp) {
  return multiplyMatrixVector(viewRotation, multiplyMatrixVector(sphereRotation, lp));
}

function transformRingPoint(lp) {
  return multiplyMatrixVector(viewRotation, multiplyMatrixVector(ringRotation, lp));
}

// Projects a normalized 3D point onto canvas using simple perspective.
function projectPointNormalized(point, radius, cx, cy) {
  const camera = 3.4, p = camera / (camera - point[2]);
  return { x: cx + point[0] * radius * p, y: cy - point[1] * radius * p, z: point[2] };
}

function getCurrentStarViewRotation() {
  const useCounterRotate = counterRotateStars && !warpActive;
  return useCounterRotate
    ? multiplyMatrices(transposeMatrix(viewRotation), starfieldRotation)
    : starViewRotation;
}

// Returns the view rotation that places the given star direction at screen center.
function getViewRotationForStarCenter(starDir, currentViewRotation) {
  const currentDir = normalizeVector(multiplyMatrixVector(currentViewRotation, starDir));
  const targetDir = [0, 0, 1];
  const axis = cross(currentDir, targetDir);
  const axisLen = lengthVector(axis);
  const dotVal = clamp(
    currentDir[0] * targetDir[0] + currentDir[1] * targetDir[1] + currentDir[2] * targetDir[2],
    -1, 1
  );

  if (axisLen < 1e-8) {
    if (dotVal > 0.9999) return orthonormalizeMatrix(currentViewRotation);
    const fallbackAxis = Math.abs(currentDir[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    return orthonormalizeMatrix(
      multiplyMatrices(rotationMatrixFromAxisAngle(fallbackAxis, Math.PI), currentViewRotation)
    );
  }

  const angle = Math.acos(dotVal);
  const align = rotationMatrixFromAxisAngle(scaleVector(axis, 1 / axisLen), angle);
  return orthonormalizeMatrix(multiplyMatrices(align, currentViewRotation));
}

// ─── Drawing ──────────────────────────────────────────────────────────────────

// Draws visible segments of a polyline, splitting at the horizon (z = 0).
function drawVisiblePolyline(points, predicate, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth   = lineWidth;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  let drawing = false;
  ctx.beginPath();
  for (const p of points) {
    const vis = predicate(p);
    if (vis && !drawing)      { ctx.moveTo(p.x, p.y); drawing = true; }
    else if (vis && drawing)  { ctx.lineTo(p.x, p.y); }
    else if (!vis && drawing) { ctx.stroke(); ctx.beginPath(); drawing = false; }
  }
  if (drawing) ctx.stroke();
}

function buildPlaneBasis(normal) {
  const n   = normalizeVector(normal);
  const ref = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const u   = normalizeVector(cross(n, ref));
  const v   = normalizeVector(cross(n, u));
  return { n, u, v };
}

// Draws one latitude or longitude seam circle on the sphere surface.
// Step count is scaled to the projected radius to avoid overdraw on small spheres.
function drawSeamCircle(normal, offset, sphereRadius, cx, cy, c) {
  const { n, u, v } = buildPlaneBasis(normal);
  const cr = Math.sqrt(Math.max(0, 1 - offset * offset));
  const center = scaleVector(n, offset);
  const steps = Math.max(60, Math.min(320, Math.round(sphereRadius * 2.2))) | 0;
  const points = [];
  const invSteps = 1 / steps;
  const TAU = Math.PI * 2;
  for (let i = 0; i <= steps; i++) {
    const t  = i * invSteps * TAU;
    const cosT = Math.cos(t), sinT = Math.sin(t);
    const lp = [
      center[0] + u[0] * cosT * cr + v[0] * sinT * cr,
      center[1] + u[1] * cosT * cr + v[1] * sinT * cr,
      center[2] + u[2] * cosT * cr + v[2] * sinT * cr,
    ];
    points.push(projectPointNormalized(transformSpherePoint(lp), sphereRadius, cx, cy));
  }
  drawVisiblePolyline(points, p => p.z < 0,  c.seamDark, sphereRadius * 0.018);
  drawVisiblePolyline(points, p => p.z >= 0, c.seam,     sphereRadius * 0.012);
}

// Draws all background stars. Hot path — matrix math is inlined to avoid allocations.
function drawBackground(width, height) {
  const cx = width * 0.5, cy = height * 0.5;
  const useCounterRotate = counterRotateStars && !warpActive;
  const viewForStars = useCounterRotate
    ? multiplyMatrices(transposeMatrix(viewRotation), starfieldRotation)
    : starViewRotation;

  const camera = 10;
  const starZoom = 0.82 + zoom * 0.18;
  const baseScale = Math.min(width, height) * 0.35;
  const aspect = width / Math.max(1, height);
  const stretchX = Math.pow(aspect, 0.36);
  const stretchY = Math.pow(1 / aspect, 0.16);
  const m = viewForStars;

  const scatterStart = WARP_CONFIG.timing.select + WARP_CONFIG.timing.center;
  const scatterDuration = WARP_CONFIG.timing.zoom + WARP_CONFIG.timing.exit;

  let scatterT = 0;
  if (warpActive) {
    const scatterRaw = phaseProgress(warpElapsed, scatterStart, scatterDuration);
    scatterT = easeInOutCubic(scatterRaw);
  }

  const maxDim = Math.max(width, height);
  let deferredWarpTarget = null;

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    const d = star.dir;
    const dist = star.distance;

    const wx = d[0] * dist, wy = d[1] * dist, wz = d[2] * dist;
    const rx = m[0][0] * wx + m[0][1] * wy + m[0][2] * wz;
    const ry = m[1][0] * wx + m[1][1] * wy + m[1][2] * wz;
    const rz = m[2][0] * wx + m[2][1] * wy + m[2][2] * wz;
    if (rz < -0.6) continue;

    const perspective = camera / (camera - rz);
    const starScaleX = baseScale * stretchX * perspective * starZoom * starFieldMotionFactor;
    const starScaleY = baseScale * stretchY * perspective * starZoom * starFieldMotionFactor;

    let x = cx + rx * starScaleX;
    let y = cy - ry * starScaleY;

    const isHovered = i === hoveredStarIdx && !warpActive;
    const isWarpTarget = i === warpStarIdx;

    if (warpActive && !isWarpTarget && scatterT > 0) {
      const dxFromCenter = x - cx;
      const dyFromCenter = y - cy;
      const distFromCenter = Math.hypot(dxFromCenter, dyFromCenter) || 1;
      const scatterDistance = maxDim * starWarpScatterStrength * scatterT;
      x += (dxFromCenter / distFromCenter) * scatterDistance;
      y += (dyFromCenter / distFromCenter) * scatterDistance;
    }

    const clipPad = isWarpTarget ? 220 : 40;
    if (x < -clipPad || x > width + clipPad || y < -clipPad || y > height + clipPad) continue;

    if (isWarpTarget) {
      deferredWarpTarget = { star, perspective, x, y };
      continue;
    }

    const rgb = star._rgbStr;
    const sr = star.radius * perspective * (0.9 + zoom * 0.12);

    let alphaScale = 1;
    if (warpActive) {
      alphaScale = Math.max(0, 1 - easeInOutCubic(warpProgress) * 0.7);
    }

    if (showStarGlow && starGlowAmount > 0 && (star.alpha > 0.3 || isHovered)) {
      const baseGlowR = isHovered ? sr * 7 : sr * 4;
      const glowR = baseGlowR * (0.45 + starGlowAmount * 0.55);
      const glowA =
        (isHovered ? star.alpha * 0.55 : star.alpha * 0.35) *
        starGlowAmount *
        (star.brightness ?? 1);

      const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
      glow.addColorStop(0, `rgba(${rgb}, ${glowA * alphaScale})`);
      glow.addColorStop(1, `rgba(${rgb}, 0)`);

      ctx.beginPath();
      ctx.fillStyle = glow;
      ctx.arc(x, y, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    const drawR = isHovered ? sr * 2 : sr;

    ctx.beginPath();
    const baseAlpha = Math.min(1, star.alpha * alphaScale * (star.brightness ?? 1));
    ctx.fillStyle = `rgba(${rgb}, ${baseAlpha})`;
    ctx.arc(x, y, drawR, 0, Math.PI * 2);
    ctx.fill();

    if (isHovered) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${rgb}, 0.6)`;
      ctx.lineWidth = 0.8;
      ctx.arc(x, y, sr * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (deferredWarpTarget) {
    const { star, perspective, x, y } = deferredWarpTarget;

    const rgb = star._rgbStr;
    const sr = star.radius * perspective * (0.9 + zoom * 0.12);

    const targetAlphaScale = warpActive
      ? Math.max(1, 1 + easeInQuint(Math.min(warpProgress, 0.92)) * 2.2)
      : 1;

    const pulse = warpActive
      ? 1 + easeInQuint(Math.min(warpProgress, 0.94)) * 5.2
      : 1;

    const drawR = sr * pulse;

    const glowFadeStart =
      WARP_CONFIG.timing.select + WARP_CONFIG.timing.center + WARP_CONFIG.timing.zoom * 0.14;

    const glowFadeDuration =
      WARP_CONFIG.timing.zoom * 1.65;

    const glowFadeT = Math.pow(
      phaseProgress(warpElapsed, glowFadeStart, glowFadeDuration),
      1.8
    );

    const targetGlowAlphaScale = 1 - glowFadeT;
    const targetGlowRadiusScale = lerp(1.0, 0.16, glowFadeT);

    if (showStarGlow && starGlowAmount > 0 && targetGlowAlphaScale > 0.01) {
      const glowR =
        sr *
        (7.5 + pulse * 1.8) *
        (0.45 + starGlowAmount * 0.55) *
        targetGlowRadiusScale;

      const glowA = Math.min(
        1,
        star.alpha * 0.85 * starGlowAmount * targetGlowAlphaScale
      );

      const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
      glow.addColorStop(0, `rgba(${rgb}, ${glowA})`);
      glow.addColorStop(1, `rgba(${rgb}, 0)`);

      ctx.beginPath();
      ctx.fillStyle = glow;
      ctx.arc(x, y, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.fillStyle = `rgba(${rgb}, ${Math.min(1, star.alpha * targetAlphaScale)})`;
    ctx.arc(x, y, drawR, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Warp transient stars ─────────────────────────────────────────────────────

function spawnWarpTransientStars(count, width, height) {
  const cx = width * 0.5;
  const cy = height * 0.5;

  for (let i = 0; i < count; i++) {
    if (warpTransientStars.length >= warpTransientStarMaxCount) break;

    const angle = Math.random() * Math.PI * 2;
    const spawnRadius = rand(warpTransientStarSpawnRadiusMin, warpTransientStarSpawnRadiusMax);
    const x = cx + Math.cos(angle) * spawnRadius;
    const y = cy + Math.sin(angle) * spawnRadius;
    const dirLen = Math.hypot(x - cx, y - cy) || 1;

    warpTransientStars.push({
      x, y,
      vx: ((x - cx) / dirLen) * rand(warpTransientStarSpeedMin, warpTransientStarSpeedMax),
      vy: ((y - cy) / dirLen) * rand(warpTransientStarSpeedMin, warpTransientStarSpeedMax),
      r: rand(0.7, 2.4),
      alpha: rand(0.18, 0.7),
      life: rand(warpTransientStarLifeMin, warpTransientStarLifeMax),
      age: 0
    });
  }
}

function updateWarpTransientStars(dt, width, height) {
  for (let i = warpTransientStars.length - 1; i >= 0; i--) {
    const s = warpTransientStars[i];
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.life -= dt;
    s.age += dt;
    if (s.life <= 0 || s.x < -220 || s.x > width + 220 || s.y < -220 || s.y > height + 220) {
      warpTransientStars.splice(i, 1);
    }
  }
}

function drawWarpTransientStars() {
  if (!warpTransientStars.length) return;

  for (let i = 0; i < warpTransientStars.length; i++) {
    const s = warpTransientStars[i];

    const fadeInT  = clamp(s.age / warpTransientStarFadeIn, 0, 1);
    const fadeOutT = clamp(s.life * 1.6, 0, 1);
    const a = clamp(s.alpha * fadeInT * fadeOutT, 0, 1);
    if (a <= 0.001) continue;

    const speed = Math.hypot(s.vx, s.vy);
    const dirX = speed > 0.0001 ? s.vx / speed : 0;
    const dirY = speed > 0.0001 ? s.vy / speed : 0;

    // Streifenlänge wächst mit Geschwindigkeit und leicht mit dem Alter
    const trailLen =
      clamp(speed * 0.05, 18, 140) *
      lerp(0.55, 1.15, fadeInT);

    const tailX = s.x - dirX * trailLen;
    const tailY = s.y - dirY * trailLen;

    // feiner Leucht-Schweif
    const trail = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
    trail.addColorStop(0.0, `rgba(235, 245, 255, ${a * 0.95})`);
    trail.addColorStop(0.18, `rgba(210, 235, 255, ${a * 0.55})`);
    trail.addColorStop(1.0, `rgba(210, 235, 255, 0)`);

    ctx.beginPath();
    ctx.strokeStyle = trail;
    ctx.lineWidth = Math.max(1, s.r * 1.15);
    ctx.lineCap = "round";
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();

    // optionaler weicher Glow um den Streifenkopf
    if (showStarGlow && starGlowAmount > 0) {
      const glowR = s.r * (4.0 + starGlowAmount * 2.8);
      const glowA = a * (0.18 + starGlowAmount * 0.14);

      const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
      glow.addColorStop(0, `rgba(210, 235, 255, ${glowA})`);
      glow.addColorStop(1, `rgba(210, 235, 255, 0)`);

      ctx.beginPath();
      ctx.fillStyle = glow;
      ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    // heller Kern vorne
    ctx.beginPath();
    ctx.fillStyle = `rgba(245, 250, 255, ${Math.min(1, a * 1.1)})`;
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Ring ─────────────────────────────────────────────────────────────────────

function buildRingProjectedPoints(radiusScale, sphereRadius, cx, cy, steps = 240) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const local = [Math.cos(t) * radiusScale, 0, Math.sin(t) * radiusScale];
    pts.push(projectPointNormalized(transformRingPoint(local), sphereRadius, cx, cy));
  }
  return pts;
}

function getVisibleRingSegments(outerPts, innerPts, isFront) {
  const n = outerPts.length - 1;
  const visible = [];
  for (let i = 0; i < n; i++) {
    const o = outerPts[i];
    const inn = innerPts[i];
    visible[i] = isFront ? (o.z >= 0 && inn.z >= 0) : (o.z < 0 && inn.z < 0);
  }

  const segments = [];
  let i = 0;
  while (i < n) {
    while (i < n && !visible[i]) i++;
    if (i >= n) break;
    const start = i;
    while (i < n && visible[i]) i++;
    segments.push([start, i - 1]);
  }

  // Merge wrap-around segment if both ends are visible
  if (segments.length > 1 && visible[0] && visible[n - 1]) {
    const first = segments[0];
    const last = segments[segments.length - 1];
    segments[0] = [last[0] - n, first[1]];
    segments.pop();
  }

  return segments;
}

function drawRingBandSegment(outerPts, innerPts, start, end, fillStyle, strokeStyle, lineWidth) {
  const n = outerPts.length - 1;
  ctx.beginPath();
  for (let j = start; j <= end; j++) {
    const p = outerPts[((j % n) + n) % n];
    if (j === start) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  for (let j = end; j >= start; j--) {
    const p = innerPts[((j % n) + n) % n];
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  if (lineWidth > 0) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

// Draws either the front (isFront = true) or back half of the planetary ring.
function drawRing(isFront, alpha = 1) {
  if (!ringEnabled || alpha <= 0.005) return;
  if (ringOuterRadius <= ringInnerRadius) return;

  const width  = cachedCanvasWidth  || canvas.clientWidth;
  const height = cachedCanvasHeight || canvas.clientHeight;
  const cx = width * 0.5 + warpSphereOffsetX;
  const cy = height * 0.5 + warpSphereOffsetY;
  const sphereRadius = Math.min(width, height) * 0.23 * zoom * sphereRadiusScale;
  const ringVisualRadius = sphereRadius * ringOuterRadius + sphereRadius * 0.04;

  if (cx + ringVisualRadius < 0 || cx - ringVisualRadius > width ||
      cy + ringVisualRadius < 0 || cy - ringVisualRadius > height) {
    return;
  }

  const outerPts = buildRingProjectedPoints(ringOuterRadius, sphereRadius, cx, cy);
  const innerPts = buildRingProjectedPoints(ringInnerRadius, sphereRadius, cx, cy);
  const segments = getVisibleRingSegments(outerPts, innerPts, isFront);

  const fill   = isFront ? `hsla(${sphereHue}, 85%, 78%, ${0.26 * alpha})` : `hsla(${sphereHue}, 70%, 52%, ${0.16 * alpha})`;
  const stroke = isFront ? `hsla(${sphereHue}, 95%, 86%, ${0.55 * alpha})` : `hsla(${sphereHue}, 80%, 70%, ${0.26 * alpha})`;
  const lineWidth = Math.max(1, sphereRadius * 0.008);

  for (const [start, end] of segments) {
    drawRingBandSegment(outerPts, innerPts, start, end, fill, stroke, lineWidth);
  }
}

// ─── Sphere ───────────────────────────────────────────────────────────────────

function drawSphere(alpha) {
  if (alpha < 0.005) return;

  const width  = cachedCanvasWidth  || canvas.clientWidth;
  const height = cachedCanvasHeight || canvas.clientHeight;
  const cx = width * 0.5 + warpSphereOffsetX;
  const cy = height * 0.5 + warpSphereOffsetY;
  const radius = Math.min(width, height) * 0.23 * zoom * sphereRadiusScale;

  sphereScreen = { cx, cy, radius };

  const c = hslColors(sphereHue);
  const visualRadius = showGlow && sphereGlowAmount > 0.02
    ? radius * (1.45 + sphereGlowAmount * 0.55)
    : radius;

  // Early-out when the sphere (including glow) is fully off-screen
  if (cx + visualRadius < 0 || cx - visualRadius > width ||
      cy + visualRadius < 0 || cy - visualRadius > height) {
    return;
  }

  const lightVec = normalizeVector(transformSpherePoint([-0.65, 0.75, 0.9]));
  const shadeVec = normalizeVector(transformSpherePoint([0.55, -0.35, -0.9]));
  const hx = cx + lightVec[0] * radius * 0.34;
  const hy = cy - lightVec[1] * radius * 0.34;
  const sx = cx + shadeVec[0] * radius * 0.30;
  const sy = cy - shadeVec[1] * radius * 0.30;

  ctx.globalAlpha = alpha;

  if (showGlow && sphereGlowAmount > 0.02) {
    const gr = radius * (1.45 + sphereGlowAmount * 0.55);
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.28, cx, cy, gr);
    glow.addColorStop(0, `hsla(${sphereHue}, 85%, 70%, ${0.10 * sphereGlowAmount})`);
    glow.addColorStop(0.45, `hsla(${sphereHue}, 70%, 55%, ${0.05 * sphereGlowAmount})`);
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, gr, 0, Math.PI * 2);
    ctx.fill();
  }

  const shell = ctx.createRadialGradient(hx, hy, radius * 0.06, cx, cy, radius * 1.08);
  shell.addColorStop(0,    c.high);
  shell.addColorStop(0.12, c.mid1);
  shell.addColorStop(0.28, c.mid2);
  shell.addColorStop(0.58, c.mid3);
  shell.addColorStop(0.82, c.low1);
  shell.addColorStop(1,    c.deep);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = shell;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  const lonCount = getLonCount();
  const latCount = getLatCount();
  for (let i = 0; i < lonCount; i++) {
    const angle = (i / Math.max(1, lonCount)) * Math.PI;
    drawSeamCircle([Math.cos(angle), 0, Math.sin(angle)], 0, radius, cx, cy, c);
  }
  for (let i = 1; i <= latCount; i++) {
    const phi = -Math.PI / 2 + (i * Math.PI) / (latCount + 1);
    drawSeamCircle([0, 1, 0], Math.sin(phi), radius, cx, cy, c);
  }

  const scan = ctx.createLinearGradient(hx - radius * 0.9, hy - radius * 0.9, sx + radius * 0.9, sy + radius * 0.9);
  scan.addColorStop(0,    "rgba(255, 200, 110, 0.06)");
  scan.addColorStop(0.35, "rgba(255, 255, 255, 0.00)");
  scan.addColorStop(0.65, "rgba(120, 220, 255, 0.05)");
  scan.addColorStop(1,    "rgba(255, 255, 255, 0.00)");
  ctx.fillStyle = scan;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  const light = ctx.createRadialGradient(hx - radius * 0.10, hy - radius * 0.10, radius * 0.04, hx, hy, radius * 1.05);
  light.addColorStop(0,   "rgba(255, 255, 255, 0.24)");
  light.addColorStop(0.2, "rgba(200, 245, 255, 0.10)");
  light.addColorStop(0.5, "rgba(140, 220, 255, 0.025)");
  light.addColorStop(1,   "rgba(255, 255, 255, 0)");
  ctx.fillStyle = light;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  const edgeShade = ctx.createRadialGradient(sx, sy, radius * 0.08, cx, cy, radius * 1.22);
  edgeShade.addColorStop(0,    "rgba(0, 0, 0, 0.01)");
  edgeShade.addColorStop(0.64, "rgba(0, 0, 0, 0.10)");
  edgeShade.addColorStop(1,    "rgba(0, 0, 0, 0.28)");
  ctx.fillStyle = edgeShade;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  ctx.restore();

  ctx.strokeStyle = c.rim;
  ctx.lineWidth = radius * 0.01;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

// ─── Compass ──────────────────────────────────────────────────────────────────

function hexToRgba(hex, alpha) {
  const v = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}, ${alpha})`;
}

function drawCompass() {
  const width  = cachedCompassWidth  || compassCanvas.clientWidth;
  const height = cachedCompassHeight || compassCanvas.clientHeight;
  compassCtx.clearRect(0, 0, width, height);
  if (compassBox.classList.contains("hidden")) return;

  const cx = width * 0.5, cy = height * 0.5, radius = Math.min(width, height) * 0.34;

  compassCtx.beginPath();
  compassCtx.strokeStyle = "rgba(125, 220, 255, 0.22)";
  compassCtx.lineWidth   = 1.25;
  compassCtx.arc(cx, cy, radius, 0, Math.PI * 2);
  compassCtx.stroke();

  const useCounterRotate = counterRotateStars && !warpActive;
  const compassViewRot = useCounterRotate
    ? multiplyMatrices(transposeMatrix(viewRotation), starfieldRotation)
    : viewRotation;

  compassCtx.beginPath();
  compassCtx.strokeStyle = "rgba(255, 200, 110, 0.25)";
  compassCtx.lineWidth   = 1;
  compassCtx.ellipse(cx, cy, radius, radius * 0.42, 0, 0, Math.PI * 2);
  compassCtx.stroke();

  const axisInfo = [
    { label: "X", vector: [1, 0, 0], color: "#ffad66" },
    { label: "Y", vector: [0, 1, 0], color: "#7ee7ff" },
    { label: "Z", vector: [0, 0, 1], color: "#b6c9ff" },
  ];
  for (const axis of axisInfo) {
    const transformed = multiplyMatrixVector(compassViewRot, axis.vector);
    const x     = cx + transformed[0] * radius * 0.88;
    const y     = cy - transformed[1] * radius * 0.88;
    const alpha = 0.35 + Math.max(0, transformed[2]) * 0.65;
    compassCtx.beginPath();
    compassCtx.strokeStyle = hexToRgba(axis.color, alpha);
    compassCtx.lineWidth   = 2;
    compassCtx.moveTo(cx, cy); compassCtx.lineTo(x, y); compassCtx.stroke();
    compassCtx.fillStyle   = hexToRgba(axis.color, alpha);
    compassCtx.font        = "12px Inter, system-ui, sans-serif";
    compassCtx.textAlign   = "center";
    compassCtx.textBaseline = "middle";
    compassCtx.fillText(axis.label, x, y);
  }
}

// ─── FPS  ─────────────────────────────────────────────────────────────────────

function drawFpsGraph() {
  const width = cachedFpsWidth || fpsCanvas.clientWidth;
  const height = cachedFpsHeight || fpsCanvas.clientHeight;

  fpsCtx.clearRect(0, 0, width, height);
  if (fpsBox.classList.contains("hidden")) return;

  const pad = 10;
  const graphX = pad;
  const graphY = pad;
  const graphW = width - pad * 2;
  const graphH = height - pad * 2;

  fpsCtx.strokeStyle = "rgba(135, 227, 255, 0.10)";
  fpsCtx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y = graphY + (graphH / 4) * i;
    fpsCtx.beginPath();
    fpsCtx.moveTo(graphX, y);
    fpsCtx.lineTo(graphX + graphW, y);
    fpsCtx.stroke();
  }

  fpsCtx.fillStyle = "rgba(151, 199, 216, 0.75)";
  fpsCtx.font = "10px Inter, system-ui, sans-serif";
  fpsCtx.textAlign = "left";
  fpsCtx.textBaseline = "middle";
  fpsCtx.fillText("144", graphX + 2, graphY + 8);
  fpsCtx.fillText("72", graphX + 2, graphY + graphH * 0.5);
  fpsCtx.fillText("0", graphX + 2, graphY + graphH - 8);

  if (fpsGraphHistory.length < 2) return;

  fpsCtx.beginPath();
  for (let i = 0; i < fpsGraphHistory.length; i++) {
    const value = clamp(fpsGraphHistory[i], 0, fpsGraphMax);
    const x = graphX + (i / Math.max(1, fpsGraphHistoryMax - 1)) * graphW;
    const y = graphY + graphH - (value / fpsGraphMax) * graphH;

    if (i === 0) fpsCtx.moveTo(x, y);
    else fpsCtx.lineTo(x, y);
  }

  fpsCtx.strokeStyle = "rgba(101, 216, 255, 0.95)";
  fpsCtx.lineWidth = 2;
  fpsCtx.stroke();

  fpsCtx.lineTo(graphX + graphW, graphY + graphH);
  fpsCtx.lineTo(graphX, graphY + graphH);
  fpsCtx.closePath();

  const fill = fpsCtx.createLinearGradient(0, graphY, 0, graphY + graphH);
  fill.addColorStop(0, "rgba(101, 216, 255, 0.22)");
  fill.addColorStop(1, "rgba(101, 216, 255, 0.02)");
  fpsCtx.fillStyle = fill;
  fpsCtx.fill();

  const lastValue = clamp(fpsGraphHistory[fpsGraphHistory.length - 1], 0, fpsGraphMax);
  const lx = graphX + ((fpsGraphHistory.length - 1) / Math.max(1, fpsGraphHistoryMax - 1)) * graphW;
  const ly = graphY + graphH - (lastValue / fpsGraphMax) * graphH;

  fpsCtx.beginPath();
  fpsCtx.arc(lx, ly, 2.5, 0, Math.PI * 2);
  fpsCtx.fillStyle = "rgba(200, 245, 255, 0.95)";
  fpsCtx.fill();
}

// ─── Pixelation post-process ──────────────────────────────────────────────────

function applyPixelation() {
  if (!pixelateEnabled || pixelationStrength <= 1) return;

  const sourceWidth  = canvas.width;
  const sourceHeight = canvas.height;
  const block = Math.max(1, Math.round(pixelationStrength));
  const dpr   = window.devicePixelRatio || 1;
  const scaledW = Math.max(1, Math.floor(sourceWidth  / (block * dpr)));
  const scaledH = Math.max(1, Math.floor(sourceHeight / (block * dpr)));

  pixelCanvas.width  = scaledW;
  pixelCanvas.height = scaledH;

  pixelCtx.setTransform(1, 0, 0, 1, 0, 0);
  pixelCtx.clearRect(0, 0, scaledW, scaledH);
  pixelCtx.imageSmoothingEnabled = true;
  pixelCtx.drawImage(canvas, 0, 0, sourceWidth, sourceHeight, 0, 0, scaledW, scaledH);

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, sourceWidth, sourceHeight);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(pixelCanvas, 0, 0, scaledW, scaledH, 0, 0, sourceWidth, sourceHeight);
  ctx.restore();
}

// ─── Main render ──────────────────────────────────────────────────────────────

function render() {
  const width  = cachedCanvasWidth  || canvas.clientWidth;
  const height = cachedCanvasHeight || canvas.clientHeight;

  ctx.clearRect(0, 0, width, height);
  drawBackground(width, height);
  drawWarpTransientStars();
  drawRing(false, warpSphereAlpha);  // back half of ring
  drawSphere(warpSphereAlpha);
  drawRing(true, warpSphereAlpha);   // front half of ring

  applyPixelation();

  updateSphereInfoLabelContent();
  updateSphereInfoLabelPosition();
  drawCompass();
  drawFpsGraph();
}

// ─── Warp ─────────────────────────────────────────────────────────────────────

function startWarp(starIdx, flashX, flashY) {
  if (warpActive) return;

  const currentStarViewRotation = getCurrentStarViewRotation();

  autoWarpTimer = 0;
  warpActive = true;
  warpProgress = 0;
  warpElapsed = 0;
  warpTransientStars.length = 0;

  warpCounterRotateWasActive = counterRotateStars;
  warpStartStarViewRotation = orthonormalizeMatrix(currentStarViewRotation);
  warpStartViewRotation = orthonormalizeMatrix(viewRotation);

  starViewRotation = warpStartStarViewRotation;
  counterRotateStars = false;

  warpStarIdx = starIdx;
  currentSourceStarLabel = stars[starIdx]?.name || "UNASSIGNED";
  warpStartZoom = zoom;
  warpStartHue  = sphereHue;
  warpStartAxisX = Number(axisXInput.value);
  warpStartAxisY = Number(axisYInput.value);
  warpStartAxisZ = Number(axisZInput.value);
  warpStartBrightness = Number(sceneBrightnessInput.value) / 100;
  warpStartContrast   = Number(sceneContrastInput.value) / 100;
  warpStartSpeed      = Number(speedInput.value);
  warpStartStarDensity    = clamp(Number(starDensityInput.value) / 100, 0.25, 8);
  warpStartStarGlow       = clamp(Number(starGlowAmountInput.value) / 100, 0, 3);
  warpStartStarBrightness = clamp(Number(starBrightnessInput.value) / 100, 0.2, 2);

  warpTargetZoom        = getRandomInRange(0.15, 1.25);
  warpTargetHue         = Math.floor(Math.random() * 360);
  warpTargetAxisX       = Math.floor(Math.random() * 200) - 100;
  warpTargetAxisY       = Math.floor(Math.random() * 200) - 100;
  warpTargetAxisZ       = Math.floor(Math.random() * 200) - 100;
  warpTargetBrightness  = getRandomInRange(0.75, 1.5);
  warpTargetContrast    = getRandomInRange(0.75, 1.5);
  warpTargetSpeed       = Math.round(getRandomInRange(15, 150));
  warpTargetStarDensity    = getRandomInRange(0.6, 6.5);
  warpTargetStarGlow       = getRandomInRange(0.15, 3.0);
  warpTargetStarBrightness = getRandomInRange(0.5, 1.7);

  const nextRingInner = getRandomInRange(1.00, 1.80);
  const nextRingOuter = getRandomInRange(nextRingInner + 0.05, nextRingInner + 0.90);

  warpStartSphereGlow       = sphereGlowAmount;
  warpTargetSphereGlow      = getRandomInRange(0.2, 3.0);
  warpTargetRingInnerRadius = Number(nextRingInner.toFixed(2));
  warpTargetRingOuterRadius = Number(nextRingOuter.toFixed(2));
  warpStartRadiusScale      = sphereRadiusScale;
  warpTargetRadiusScale     = autoWarp ? getRandomInRange(0.72, 1.45) : sphereRadiusScale;
  warpTargetRingEnabled     = Math.random() < 0.5;
  warpStartRingRotation     = orthonormalizeMatrix(ringRotation);
  warpTargetRingRotation    = randomRotationMatrix();

  warpSphereAlpha = 1;
  starLabel.style.opacity = "0";

  warpStartStageHue         = stageHue;
  warpStartStageIntensity   = stageIntensity;
  warpStartStageBrightness  = stageBrightness;
  warpStartStageR1X         = stageR1X;
  warpStartStageR1Y         = stageR1Y;
  warpStartStageR2X         = stageR2X;
  warpStartStageR2Y         = stageR2Y;
  warpStartStageLinearAngle = stageLinearAngle;

  warpTargetStageHue         = Math.floor(getRandomInRange(0, 360));
  warpTargetStageIntensity   = getRandomInRange(0.45, 1.8);
  warpTargetStageBrightness  = getRandomInRange(0.7, 1.45);
  warpTargetStageR1X         = rand(8, 38);
  warpTargetStageR1Y         = rand(4, 28);
  warpTargetStageR2X         = rand(62, 92);
  warpTargetStageR2Y         = rand(10, 38);
  warpTargetStageLinearAngle = randInt(145, 225);

  const starDir = stars[starIdx]?.dir || [0, 0, 1];
  warpTargetStarViewRotation = orthonormalizeMatrix(
    getViewRotationForStarCenter(starDir, warpStartStarViewRotation)
  );
  warpTargetViewRotation = orthonormalizeMatrix(warpTargetStarViewRotation);

  // Compute drift direction: sphere moves away from the target star
  const centerX = (cachedCanvasWidth || canvas.clientWidth) * 0.5;
  const centerY = (cachedCanvasHeight || canvas.clientHeight) * 0.5;
  const dirX = flashX - centerX;
  const dirY = flashY - centerY;
  const dirLen = Math.hypot(dirX, dirY) || 1;
  warpDriftDirX = -dirX / dirLen;
  warpDriftDirY = -dirY / dirLen;
  warpSphereOffsetX = 0;
  warpSphereOffsetY = 0;

  warpOverlay.style.setProperty("--wx", `${(flashX / (cachedCanvasWidth || canvas.clientWidth)) * 100}%`);
  warpOverlay.style.setProperty("--wy", `${(flashY / (cachedCanvasHeight || canvas.clientHeight)) * 100}%`);
  warpOverlay.classList.add("flash");
  setTimeout(() => warpOverlay.classList.remove("flash"), 350);
}

function tickWarp(dt) {
  warpElapsed += dt;

  const tCfg = WARP_CONFIG.timing;
  const total = getWarpTotalDuration();

  const selectStart = 0;
  const centerStart = selectStart + tCfg.select;
  const zoomStart   = centerStart + tCfg.center;
  const exitStart   = zoomStart + tCfg.zoom;
  const settleStart = exitStart + tCfg.exit;

  const selectT = easeInOutCubic(phaseProgress(warpElapsed, selectStart, tCfg.select));
  const centerT = easeInOutCubic(phaseProgress(warpElapsed, centerStart, tCfg.center));
  const zoomT   = easeInOutCubic(phaseProgress(warpElapsed, zoomStart, tCfg.zoom));
  const exitT   = easeInOutCubic(phaseProgress(warpElapsed, exitStart, tCfg.exit));
  const settleT = easeInOutCubic(phaseProgress(warpElapsed, settleStart, tCfg.settle));

  const transientStart    = tCfg.select + tCfg.center;
  const transientDuration = tCfg.zoom + tCfg.exit;
  const transientT = easeInOutCubic(phaseProgress(warpElapsed, transientStart, transientDuration));

  const driftStart    = selectStart;
  const driftDuration = tCfg.center * 0.55 + tCfg.zoom * 0.35 + tCfg.exit * 0.2;
  const driftT = easeInOutCubic(phaseProgress(warpElapsed, driftStart, driftDuration));

  warpProgress = clamp(warpElapsed / total, 0, 1);

  // 1) Smoothly rotate view so the target star is centered
  const q1 = matToQuat(warpStartViewRotation);
  const q2 = matToQuat(warpTargetViewRotation);
  viewRotation = orthonormalizeMatrix(quatToMat(slerpQuat(q1, q2, centerT)));

  if (warpCounterRotateWasActive) {
    const starQ1 = matToQuat(warpStartStarViewRotation);
    const starQ2 = matToQuat(warpTargetStarViewRotation);
    starViewRotation = orthonormalizeMatrix(quatToMat(slerpQuat(starQ1, starQ2, centerT)));
  } else {
    starViewRotation = viewRotation;
  }

  // Gentle pre-zoom during centering phase
  const centerZoomTarget = lerp(warpStartZoom, Math.min(maxZoom, warpStartZoom * WARP_CONFIG.zoom.centerBoost), WARP_CONFIG.zoom.centerBlend);
  const zoomBeforeMain = lerp(warpStartZoom, centerZoomTarget, centerT);
  zoom = lerp(zoomBeforeMain, warpTargetZoom, zoomT);
  syncInputFromZoom();

  // 2) Interpolate all visual parameters toward the target scene
  stageHue        = lerpAngleDeg(warpStartStageHue, warpTargetStageHue, zoomT);
  stageIntensity  = lerp(warpStartStageIntensity, warpTargetStageIntensity, zoomT);
  stageBrightness = lerp(warpStartStageBrightness, warpTargetStageBrightness, zoomT);

  stageR1X = lerp(warpStartStageR1X, warpTargetStageR1X, zoomT);
  stageR1Y = lerp(warpStartStageR1Y, warpTargetStageR1Y, zoomT);
  stageR2X = lerp(warpStartStageR2X, warpTargetStageR2X, zoomT);
  stageR2Y = lerp(warpStartStageR2Y, warpTargetStageR2Y, zoomT);
  stageLinearAngle = lerpAngleShortestDeg(warpStartStageLinearAngle, warpTargetStageLinearAngle, zoomT);

  stageHueInput.value        = String(Math.round(stageHue));
  stageIntensityInput.value  = String(Math.round(stageIntensity * 100));
  stageBrightnessInput.value = String(Math.round(stageBrightness * 100));

  updateStageIntensity();
  updateStageBrightness();

  stageHueVal.textContent        = `${Math.round(stageHue)}°`;
  stageIntensityVal.textContent  = `${stageIntensity.toFixed(2)}×`;
  stageBrightnessVal.textContent = `${stageBrightness.toFixed(2)}×`;

  applyStageBackgroundFromCurrentControls();

  sphereHue = Math.round(lerpAngleDeg(warpStartHue, warpTargetHue, zoomT));
  hueInput.value = String(sphereHue);

  axisXInput.value = String(Math.round(lerp(warpStartAxisX, warpTargetAxisX, zoomT)));
  axisYInput.value = String(Math.round(lerp(warpStartAxisY, warpTargetAxisY, zoomT)));
  axisZInput.value = String(Math.round(lerp(warpStartAxisZ, warpTargetAxisZ, zoomT)));

  sceneBrightnessInput.value = String(Math.round(lerp(warpStartBrightness, warpTargetBrightness, zoomT) * 100));
  sceneContrastInput.value   = String(Math.round(lerp(warpStartContrast, warpTargetContrast, zoomT) * 100));
  speedInput.value           = String(Math.round(lerp(warpStartSpeed, warpTargetSpeed, zoomT)));

  const nextStarDensity = lerp(warpStartStarDensity, warpTargetStarDensity, zoomT);
  const nextStarGlow = lerp(warpStartStarGlow, warpTargetStarGlow, zoomT);
  const nextStarBrightness = lerp(warpStartStarBrightness, warpTargetStarBrightness, zoomT);

  starDensityInput.value = String(Math.round(nextStarDensity * 100));
  starGlowAmountInput.value = String(Math.round(nextStarGlow * 100));
  starBrightnessInput.value = String(Math.round(nextStarBrightness * 100));

  starGlowAmount = nextStarGlow;
  starBrightness = nextStarBrightness;

  cacheStarColors();

  sphereRadiusScale = lerp(warpStartRadiusScale, warpTargetRadiusScale, zoomT);
  syncInputFromSphereRadius();

  sphereGlowAmount = lerp(warpStartSphereGlow, warpTargetSphereGlow, zoomT);
  sphereGlowAmountInput.value = String(Math.round(sphereGlowAmount * 100));

  const ringQ1 = matToQuat(warpStartRingRotation);
  const ringQ2 = matToQuat(warpTargetRingRotation);
  ringRotation = orthonormalizeMatrix(quatToMat(slerpQuat(ringQ1, ringQ2, zoomT)));

  // 3) Drift the sphere off-screen and fade it out
  //    distanceFactor is set to 1.6 so the sphere moves well beyond the canvas
  //    diagonal, ensuring no partial sprite is visible at the edge.
  const driftDistance = Math.hypot(
    cachedCanvasWidth  || canvas.clientWidth,
    cachedCanvasHeight || canvas.clientHeight
  ) * WARP_CONFIG.drift.distanceFactor;

  warpSphereOffsetX = warpDriftDirX * driftDistance * driftT;
  warpSphereOffsetY = warpDriftDirY * driftDistance * driftT;

  const fadeLocal = clamp(
    (exitT - WARP_CONFIG.zoom.exitFadeStart) / (1 - WARP_CONFIG.zoom.exitFadeStart),
    0, 1
  );
  warpSphereAlpha = 1 - easeInOutCubic(fadeLocal);

  // Spawn and age transient star streaks during the hyperspace phase
  if (transientT > 0 && transientT < 1) {
    const width  = cachedCanvasWidth  || canvas.clientWidth;
    const height = cachedCanvasHeight || canvas.clientHeight;
    spawnWarpTransientStars(Math.floor(warpTransientStarSpawnRate * dt), width, height);
    updateWarpTransientStars(dt, width, height);
  } else if (warpTransientStars.length) {
    const width  = cachedCanvasWidth  || canvas.clientWidth;
    const height = cachedCanvasHeight || canvas.clientHeight;
    updateWarpTransientStars(dt, width, height);
  }

  // 4) Finalize and end the warp
  if (warpElapsed >= total) {
    stageHue        = warpTargetStageHue;
    stageIntensity  = warpTargetStageIntensity;
    stageBrightness = warpTargetStageBrightness;
    stageR1X = warpTargetStageR1X; stageR1Y = warpTargetStageR1Y;
    stageR2X = warpTargetStageR2X; stageR2Y = warpTargetStageR2Y;
    stageLinearAngle = warpTargetStageLinearAngle;

    stageHueInput.value        = String(Math.round(stageHue));
    stageIntensityInput.value  = String(Math.round(stageIntensity * 100));
    stageBrightnessInput.value = String(Math.round(stageBrightness * 100));

    warpTransientStars.length = 0;
    updateStageIntensity();
    updateStageBrightness();

    stageHueVal.textContent        = `${Math.round(stageHue)}°`;
    stageIntensityVal.textContent  = `${stageIntensity.toFixed(2)}×`;
    stageBrightnessVal.textContent = `${stageBrightness.toFixed(2)}×`;

    sphereHue = warpTargetHue;
    hueInput.value   = String(warpTargetHue);
    axisXInput.value = String(warpTargetAxisX);
    axisYInput.value = String(warpTargetAxisY);
    axisZInput.value = String(warpTargetAxisZ);

    sceneBrightnessInput.value  = String(Math.round(warpTargetBrightness * 100));
    sceneContrastInput.value    = String(Math.round(warpTargetContrast * 100));
    speedInput.value            = String(warpTargetSpeed);
    sphereGlowAmountInput.value = String(Math.round(warpTargetSphereGlow * 100));
    sphereGlowAmount = warpTargetSphereGlow;

    starDensityInput.value = String(Math.round(warpTargetStarDensity * 100));
    starGlowAmountInput.value = String(Math.round(warpTargetStarGlow * 100));
    starBrightnessInput.value = String(Math.round(warpTargetStarBrightness * 100));

    starGlowAmount = warpTargetStarGlow;
    starBrightness = warpTargetStarBrightness;

    ringEnabled = warpTargetRingEnabled;
    ringEnabledInput.checked = ringEnabled;
    ringInnerRadiusInput.value = warpTargetRingInnerRadius.toFixed(2);
    ringOuterRadiusInput.value = warpTargetRingOuterRadius.toFixed(2);
    syncRingInputs();

    sphereRotation    = identityMatrix();
    ringRotation      = warpTargetRingRotation;
    sphereAngularVelocity = getPresetAngularVelocity();

    zoom = warpTargetZoom;
    syncInputFromZoom();
    sphereRadiusScale = warpTargetRadiusScale;
    syncInputFromSphereRadius();

    // Reset all warp-driven offsets
    warpSphereAlpha   = 1;
    warpSphereOffsetX = 0;
    warpSphereOffsetY = 0;
    warpDriftDirX     = 0;
    warpDriftDirY     = 0;
    warpElapsed       = 0;
    warpTransientStars.length = 0;

    if (warpCounterRotateWasActive) {
      starViewRotation  = orthonormalizeMatrix(starViewRotation);
      viewRotation      = orthonormalizeMatrix(viewRotation);
      starfieldRotation = orthonormalizeMatrix(multiplyMatrices(viewRotation, starViewRotation));
    } else {
      starViewRotation = orthonormalizeMatrix(viewRotation);
    }

    buildStars();

    counterRotateStars = warpCounterRotateWasActive;
    counterRotateStarsInput.checked = counterRotateStars;
    warpCounterRotateWasActive = false;

    sphereLabelIdCounter += 1;
    currentSphereLabelId = `SPHERE-${String(sphereLabelIdCounter).padStart(3, "0")}`;
    chooseNextLabelPosition();

    applyStageBackgroundFromCurrentControls();

    warpActive  = false;
    warpStarIdx = -1;

    updateLabels();

    warpOverlay.style.setProperty("--wx", "50%");
    warpOverlay.style.setProperty("--wy", "50%");
    warpOverlay.classList.add("flash");
    setTimeout(() => warpOverlay.classList.remove("flash"), 400);
  }
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function setUiVisible(v) {
  const menuOpen = overlay.classList.contains("visible");
  if (menuOpen) {
    stage.classList.remove("ui-hidden");
    openMenuBtn?.classList.add("hidden");
    return;
  }
  openMenuBtn?.classList.toggle("hidden", !v);
  customCursor?.classList.toggle("hidden", !v);
  stage.classList.remove("ui-hidden");
  overlay.classList.toggle("ui-faded", !v);
}

function openMenu() {
  overlay.classList.add("visible");
  overlay.classList.remove("ui-faded");
  openMenuBtn?.classList.add("hidden");
  setUiVisible(true);
}

function closeMenu() {
  overlay.classList.remove("visible");
  overlay.classList.remove("ui-faded");
  openMenuBtn?.classList.remove("hidden");
  setUiVisible(true);
}

function updateOverlayVisibility() {
  if (overlay.classList.contains("visible")) {
    setUiVisible(true);
    clearTimeout(inactivityTimer);
    return;
  }
  setUiVisible(true);
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    if (dragMode === "none" && !overlay.classList.contains("visible")) {
      setUiVisible(false);
    }
  }, overlayTimeoutMs);
}

function updateCustomCursor() {
  if (!customCursor) return;
  customCursor.style.transform =
    `translate3d(${pointerClientX}px, ${pointerClientY}px, 0) translate(-50%, -50%) rotate(${cursorAngle}deg)`;
}

function setFpsVisible(v)     { fpsBox.classList.toggle("hidden", !v); }
function setCompassVisible(v) { compassBox.classList.toggle("hidden", !v); }

function resetSphereOrientation() {
  sphereRotation        = identityMatrix();
  ringRotation          = identityMatrix();
  sphereAngularVelocity = getPresetAngularVelocity();
  render();
}

function resetView() {
  speedInput.value        = 60;
  zoom                    = 1;
  syncInputFromZoom();

  axisXInput.value        = 30;
  axisYInput.value        = 100;
  axisZInput.value        = 10;

  latCountInput.value     = 12;
  lonCountInput.value     = 12;

  starDensityInput.value  = 400;
  starBrightnessInput.value = "100";
  starBrightness = 1;

  hueInput.value          = 210;
  sphereHue               = 210;

  stageHueInput.value     = 210;
  stageIntensityInput.value = 100;
  stageHue                = 210;
  stageIntensity          = 1;

  sceneBrightnessInput.value = 100;
  sceneContrastInput.value   = 100;

  autoWarpTimer           = 0;
  sphereRotation          = identityMatrix();
  ringRotation            = identityMatrix();
  viewRotation            = identityMatrix();
  sphereAngularVelocity   = getPresetAngularVelocity();

  starfieldRotation       = identityMatrix();
  starViewRotation        = viewRotation;

  counterRotateStars      = true;
  counterRotateStarsInput.checked = true;

  paused                  = false;
  pauseBtn.textContent    = "Pause";

  warpActive              = false;
  warpStarIdx             = -1;
  warpSphereAlpha         = 1;
  warpSphereOffsetX       = 0;
  warpSphereOffsetY       = 0;
  warpDriftDirX           = 0;
  warpDriftDirY           = 0;

  warpStartViewRotation      = identityMatrix();
  warpTargetViewRotation     = identityMatrix();
  warpStartStarViewRotation  = identityMatrix();
  warpTargetStarViewRotation = identityMatrix();
  warpCounterRotateWasActive = false;

  ringEnabled             = true;
  ringInnerRadius         = 1.08;
  ringOuterRadius         = 1.45;
  ringEnabledInput.checked = true;
  ringInnerRadiusInput.value = "1.08";
  ringOuterRadiusInput.value = "1.45";

  stageBrightnessInput.value = 100;
  stageBrightness            = 1;

  sphereRadiusScale          = 1;
  sphereRadiusInput.value    = "100";

  showInfoLabel              = showInfoLabelInput.checked;
  currentSphereLabelId       = "SPHERE-001";
  currentLabelPosition       = "right";

  pixelationInput.value      = "1";
  pixelationStrength         = 1;
  pixelateEnabled            = false;

  showFpsInput.checked = true;
  setFpsVisible(true);

  syncRingInputs();
  buildStars();
  updateLabels();
  updateSceneFilter();
  updateStageIntensity();
  updateStageBrightness();
  randomStageBackground();
  render();
}

function chooseNextLabelPosition() {
  currentLabelPosition = labelPositions[Math.floor(Math.random() * labelPositions.length)];
}

function toggleFullscreen() {
  if (!document.fullscreenElement) stage.requestFullscreen?.();
  else document.exitFullscreen?.();
}

function updateFullscreenButtonState() {
  const isFullscreen = !!document.fullscreenElement;
  fullscreenBtn.textContent = isFullscreen ? "Exit Fullscreen" : "Fullscreen";
  fullscreenBtn.classList.toggle("active", isFullscreen);
}

let playPauseOverlayTimer = null;

function showPlayPauseOverlay(isPaused) {
  if (!playPauseOverlay || !playPauseIcon) return;

  playPauseIcon.textContent = isPaused ? "⏸" : "▶";

  playPauseOverlay.classList.remove("fade-out");
  playPauseOverlay.classList.add("visible");

  clearTimeout(playPauseOverlayTimer);
  playPauseOverlayTimer = setTimeout(() => {
    playPauseOverlay.classList.add("fade-out");
    playPauseOverlay.classList.remove("visible");
  }, 700);
}

// ─── Sphere info label ────────────────────────────────────────────────────────

function formatVec(v) {
  return `${v[0].toFixed(2)} / ${v[1].toFixed(2)} / ${v[2].toFixed(2)}`;
}

function setSphereInfoRow(key, value) {
  const k = document.createElement("div");
  k.className = "k";
  k.textContent = key;
  const v = document.createElement("div");
  v.className = "v";
  v.textContent = value;
  sphereInfoGrid.appendChild(k);
  sphereInfoGrid.appendChild(v);
}

function updateSphereInfoLabelContent() {
  if (!sphereInfoGrid) return;
  sphereInfoTitle.textContent = `SPHERE // ${currentSphereLabelId}`;
  sphereInfoGrid.innerHTML = "";
  const axis = getAxisWeights();
  const speedDeg = Number(speedInput.value);
  setSphereInfoRow("Label", currentSphereLabelId);
  setSphereInfoRow("Star", currentSourceStarLabel);
  sphereInfoTitle.textContent = `${currentSphereLabelId} // ${currentSourceStarLabel}`;
  setSphereInfoRow("Radius", `${sphereRadiusScale.toFixed(2)}×`);
  setSphereInfoRow("Spin X/Y/Z", formatVec(axis));
  setSphereInfoRow("Speed", `${speedDeg} °/s`);
  setSphereInfoRow("Ring", ringEnabled ? "yes" : "no");
  setSphereInfoRow("Ring radii", ringEnabled ? `${ringInnerRadius.toFixed(2)} / ${ringOuterRadius.toFixed(2)}` : "—");
  setSphereInfoRow("Luminance", `${sphereGlowAmount.toFixed(2)}×`);
}

function updateSphereInfoLabelPosition() {
  if (!sphereInfoLabel || !showInfoLabel) {
    sphereInfoLabel?.classList.add("hidden");
    return;
  }
  const width  = cachedCanvasWidth  || canvas.clientWidth;
  const height = cachedCanvasHeight || canvas.clientHeight;
  if (!width || !height) return;

  const cx = sphereScreen.cx;
  const cy = sphereScreen.cy;
  const r  = sphereScreen.radius;
  const distance = r + 90;

  let x = cx, y = cy;
  sphereInfoLabel.className = "sphere-info-label";

  const effectiveLabelPosition =
    overlay.classList.contains("visible") && currentLabelPosition === "right"
      ? "left"
      : currentLabelPosition;

  switch (effectiveLabelPosition) {
    case "left":         x = cx - distance;          y = cy;                sphereInfoLabel.classList.add("pos-left");         break;
    case "right":        x = cx + distance;          y = cy;                sphereInfoLabel.classList.add("pos-right");        break;
    case "top":          x = cx;                     y = cy - distance;     sphereInfoLabel.classList.add("pos-top");          break;
    case "bottom":       x = cx;                     y = cy + distance;     sphereInfoLabel.classList.add("pos-bottom");       break;
    case "top-left":     x = cx - distance * 0.78;  y = cy - distance * 0.78; sphereInfoLabel.classList.add("pos-top-left");  break;
    case "top-right":    x = cx + distance * 0.78;  y = cy - distance * 0.78; sphereInfoLabel.classList.add("pos-top-right"); break;
    case "bottom-left":  x = cx - distance * 0.78;  y = cy + distance * 0.78; sphereInfoLabel.classList.add("pos-bottom-left"); break;
    case "bottom-right": x = cx + distance * 0.78;  y = cy + distance * 0.78; sphereInfoLabel.classList.add("pos-bottom-right"); break;
  }

  x = clamp(x, 24, width - 24);
  y = clamp(y, 24, height - 24);
  sphereInfoLabel.style.left = `${x}px`;
  sphereInfoLabel.style.top  = `${y}px`;
  sphereInfoLabel.classList.toggle("hidden", !showInfoLabel || warpActive);
}

// ─── Input events ─────────────────────────────────────────────────────────────

function eventToCanvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function isPointOnSphere(e) {
  const p = eventToCanvasPoint(e);
  const dx = p.x - sphereScreen.cx, dy = p.y - sphereScreen.cy;
  return dx * dx + dy * dy <= sphereScreen.radius * sphereScreen.radius;
}

function onPointerDown(e) {
  if (e.target.closest(".overlay")) return;
  if (autoWarp) return;
  updateOverlayVisibility();

  if (e.button === 1) {
    e.preventDefault();
    const p   = eventToCanvasPoint(e);
    const idx = findStarNear(p.x, p.y);
    if (idx >= 0) startWarp(idx, p.x, p.y);
    return;
  }

  if (e.button === 0 && isPointOnSphere(e)) {
    dragMode      = "sphere";
    dragPointerId = e.pointerId;
    lastPointerX  = e.clientX;
    lastPointerY  = e.clientY;
    sphereAngularVelocity = [0, 0, 0];
    canvas.classList.add("dragging-sphere");
    canvas.setPointerCapture(e.pointerId);
    return;
  }

  if (e.button === 2) {
    dragMode      = "view";
    dragPointerId = e.pointerId;
    lastPointerX  = e.clientX;
    lastPointerY  = e.clientY;
    canvas.classList.add("dragging-view");
    canvas.setPointerCapture(e.pointerId);
  }
}

function onPointerMove(e) {
  updateOverlayVisibility();
  pointerClientX = e.clientX;
  pointerClientY = e.clientY;
  cursorAngle += 2.2;
  updateCustomCursor();

  // Update star hover highlight
  if (dragMode === "none" && !warpActive) {
    const p   = eventToCanvasPoint(e);
    const idx = findStarNear(p.x, p.y);
    if (idx !== hoveredStarIdx) {
      hoveredStarIdx = idx;
      if (idx >= 0) {
        const pos = starScreenPos(stars[idx], cachedCanvasWidth || canvas.clientWidth, cachedCanvasHeight || canvas.clientHeight);
        if (pos) {
          starLabel.textContent   = `⊕ ${stars[idx].name} — middle-click to warp`;
          starLabel.style.left    = `${pos.x}px`;
          starLabel.style.top     = `${pos.y}px`;
          starLabel.style.opacity = "1";
        }
      } else {
        starLabel.style.opacity = "0";
      }
    }
  }

  if (dragMode === "none" || e.pointerId !== dragPointerId) return;

  const dx = e.clientX - lastPointerX;
  const dy = e.clientY - lastPointerY;
  lastPointerX = e.clientX;
  lastPointerY = e.clientY;
  const rect = canvas.getBoundingClientRect();
  const nx   = dx / Math.max(1, rect.width);
  const ny   = dy / Math.max(1, rect.height);

  if (dragMode === "sphere") {
    const yaw   = -nx * Math.PI * 1.8;
    const pitch =  ny * Math.PI * 1.8;
    const vi    = transposeMatrix(viewRotation);
    sphereRotation = multiplyMatrices(rotationMatrixFromAxisAngle(multiplyMatrixVector(vi, [0, 1, 0]), yaw), sphereRotation);
    sphereRotation = multiplyMatrices(rotationMatrixFromAxisAngle(multiplyMatrixVector(vi, [1, 0, 0]), pitch), sphereRotation);
    sphereRotation = orthonormalizeMatrix(sphereRotation);
    const dtA = 1 / 60;
    sphereAngularVelocity = [pitch / dtA, yaw / dtA, 0];
  } else if (dragMode === "view") {
    const yaw   = -nx * Math.PI * 1.6;
    const pitch =  ny * Math.PI * 1.6;
    viewRotation = multiplyMatrices(rotationMatrixFromAxisAngle([0, 1, 0], yaw), viewRotation);
    viewRotation = multiplyMatrices(rotationMatrixFromAxisAngle([1, 0, 0], pitch), viewRotation);
    viewRotation = orthonormalizeMatrix(viewRotation);
    if (!counterRotateStars) starViewRotation = viewRotation;
  }
  render();
}

function endDrag(e) {
  if (dragMode === "none" || e.pointerId !== dragPointerId) return;
  dragMode = "none";
  dragPointerId = null;
  canvas.classList.remove("dragging-sphere", "dragging-view");
  updateOverlayVisibility();
}

function onWheel(e) {
  if (autoWarp) return;
  e.preventDefault();
  updateOverlayVisibility();
  zoom = clamp(zoom * Math.exp(-e.deltaY * 0.0012), minZoom, maxZoom);
  syncInputFromZoom();
  updateLabels();
  render();
}

function onDoubleClick(e) {
  if (autoWarp) return;
  if (isPointOnSphere(e)) { resetSphereOrientation(); updateOverlayVisibility(); }
}

// ─── Animation loop ───────────────────────────────────────────────────────────

function animate(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min(0.04, (timestamp - lastTime) / 1000);
  lastTime = timestamp;

  if (dt > 0) {
    const f = 1 / dt;

    fpsSmoothed = fpsSmoothed === 0 ? f : fpsSmoothed * 0.9 + f * 0.1;
    fpsGraphSmoothed = fpsGraphSmoothed === 0 ? f : fpsGraphSmoothed * 0.965 + f * 0.035;

    fpsGraphHistory.push(fpsGraphSmoothed);
    if (fpsGraphHistory.length > fpsGraphHistoryMax) fpsGraphHistory.shift();

    if (++_fpsUpdateCounter >= 10) {
      _fpsUpdateCounter = 0;
      fpsVal.textContent = String(Math.round(fpsSmoothed));
    }
  }

  if (warpActive) {
    tickWarp(dt);
    updateLabels();
  }

  tickAutoWarpZoomDrift(dt);

  if (autoWarp && !paused && !warpActive && dragMode === "none") {
    autoWarpTimer += dt;
    if (autoWarpTimer >= getAutoWarpIntervalSeconds()) {
      autoWarpTimer = 0;
      triggerAutoWarp();
    }
  }

  if (counterRotateStars && !paused && !warpActive) {
    const starOmega = scaleVector(sphereAngularVelocity, -starCounterRotateStrength);
    starfieldRotation = applyAngularVelocity(starfieldRotation, starOmega, dt);
  }

  if (!paused && dragMode !== "sphere" && !warpActive) {
    const target = getPresetAngularVelocity();
    const diff   = subtractVectors(target, sphereAngularVelocity);
    sphereAngularVelocity = addVectors(
      sphereAngularVelocity,
      scaleVector(diff, clamp(autoReturnStrength * dt, 0, 1))
    );
    const damping = Math.exp(-inertiaDamping * dt);
    sphereAngularVelocity = addVectors(
      target,
      scaleVector(subtractVectors(sphereAngularVelocity, target), damping)
    );
    sphereRotation = applyAngularVelocity(sphereRotation, sphereAngularVelocity, dt);
    ringRotation   = applyAngularVelocity(ringRotation, scaleVector(sphereAngularVelocity, ringSpeedFactor), dt);
  }

  cursorAngle += 1;
  updateCustomCursor();
  render();
  requestAnimationFrame(animate);
}

// ─── Event listeners ──────────────────────────────────────────────────────────

[speedInput, axisXInput, axisYInput, axisZInput].forEach(i => {
  i.addEventListener("input", () => { updateLabels(); updateOverlayVisibility(); render(); });
});

zoomInput.addEventListener("input", () => { syncZoomFromInput(); updateLabels(); updateOverlayVisibility(); render(); });

[latCountInput, lonCountInput].forEach(i => {
  i.addEventListener("input", () => {
    i.value = String(clamp(Number(i.value) || 0, 0, 16));
    updateLabels(); updateOverlayVisibility(); render();
  });
});

hueInput.addEventListener("input", () => {
  sphereHue = Number(hueInput.value);
  updateLabels(); updateOverlayVisibility(); render();
});

pauseBtn.addEventListener("click", () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  showPlayPauseOverlay(paused);
  updateOverlayVisibility();
  render();
});

resetSphereBtn.addEventListener("click", () => { resetSphereOrientation(); updateOverlayVisibility(); });
resetBtn.addEventListener("click",       () => { resetView();              updateOverlayVisibility(); });
fullscreenBtn.addEventListener("click",  () => { toggleFullscreen();       updateOverlayVisibility(); });

showFpsInput.addEventListener("change",     () => { setFpsVisible(showFpsInput.checked);        updateOverlayVisibility(); });
showCompassInput.addEventListener("change", () => { setCompassVisible(showCompassInput.checked); updateOverlayVisibility(); render(); });
starDensityInput.addEventListener("input",  () => { buildStars(); updateLabels();                updateOverlayVisibility(); render(); });

sphereGlowAmountInput.addEventListener("input", () => { updateLabels(); updateOverlayVisibility(); render(); });
starGlowAmountInput.addEventListener("input",   () => { updateLabels(); updateOverlayVisibility(); render(); });

starBrightnessInput.addEventListener("input", () => {
  updateLabels();
  cacheStarColors();
  updateOverlayVisibility();
  render();
});

showGlowInput.addEventListener("change",     () => { showGlow     = showGlowInput.checked;     updateOverlayVisibility(); render(); });
showStarGlowInput.addEventListener("change", () => { showStarGlow = showStarGlowInput.checked; updateOverlayVisibility(); render(); });

counterRotateStarsInput.addEventListener("change", () => {
  const currentStarViewRotation = orthonormalizeMatrix(getCurrentStarViewRotation());
  const nextState = counterRotateStarsInput.checked;
  if (nextState) {
    starfieldRotation = orthonormalizeMatrix(multiplyMatrices(orthonormalizeMatrix(viewRotation), currentStarViewRotation));
  } else {
    starViewRotation = currentStarViewRotation;
  }
  counterRotateStars = nextState;
  updateOverlayVisibility();
  render();
});

sceneBrightnessInput.addEventListener("input", () => { updateLabels(); updateOverlayVisibility(); render(); });
sceneContrastInput.addEventListener("input",   () => { updateLabels(); updateOverlayVisibility(); render(); });

autoWarpInput.addEventListener("change", () => {
  autoWarp = autoWarpInput.checked;
  autoWarpTimer = 0;
  setControlsDisabled(autoWarp);
  updateOverlayVisibility();
  render();
});

autoWarpIntervalInput.addEventListener("input", () => {
  autoWarpIntervalInput.value = String(clamp(Number(autoWarpIntervalInput.value) || 12, 2, 120));
  autoWarpTimer = 0;
  updateOverlayVisibility();
});

document.addEventListener("fullscreenchange", () => {
  updateFullscreenButtonState();
  resizeCanvas();
  render();
});

stageHueInput.addEventListener("input", () => {
  updateLabels(); randomStageBackground(); updateOverlayVisibility(); render();
});

stageIntensityInput.addEventListener("input", () => {
  updateLabels(); updateStageIntensity(); randomStageBackground(); updateOverlayVisibility(); render();
});

stageBrightnessInput.addEventListener("input", () => {
  updateLabels(); updateStageBrightness(); updateOverlayVisibility(); render();
});

showInfoLabelInput.addEventListener("change", () => {
  showInfoLabel = showInfoLabelInput.checked;
  updateOverlayVisibility();
  render();
});

sphereRadiusInput.addEventListener("input", () => {
  syncSphereRadiusFromInput(); updateLabels(); updateOverlayVisibility(); render();
});

window.addEventListener("resize",      () => { resizeCanvas(); render(); });
window.addEventListener("pointermove", (e) => {
  pointerClientX = e.clientX;
  pointerClientY = e.clientY;
  cursorAngle += 1.4;
  updateCustomCursor();
  updateOverlayVisibility();
}, { passive: true });
window.addEventListener("keydown", (event) => {
  updateOverlayVisibility();

  const tag = document.activeElement?.tagName;
  const isTyping = tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable;

  if (event.code === "Space" && !isTyping) {
    event.preventDefault();
    paused = !paused;
    pauseBtn.textContent = paused ? "Resume" : "Pause";
    showPlayPauseOverlay(paused);
    render();
  }

  if (event.key === "F11") {
    setTimeout(() => { updateFullscreenButtonState(); resizeCanvas(); render(); }, 100);
  }
});
openMenuBtn.addEventListener("click",  () => { openMenu();  updateOverlayVisibility(); });
closeMenuBtn.addEventListener("click", () => { closeMenu(); updateOverlayVisibility(); });

ringEnabledInput.addEventListener("change",     () => { syncRingInputs(); updateOverlayVisibility(); render(); });
ringInnerRadiusInput.addEventListener("input",  () => { syncRingInputs(); updateOverlayVisibility(); render(); });
ringOuterRadiusInput.addEventListener("input",  () => { syncRingInputs(); updateOverlayVisibility(); render(); });

pixelationInput.addEventListener("input", () => {
  pixelationStrength = Number(pixelationInput.value);
  pixelateEnabled    = pixelationStrength > 1;
  updateLabels(); updateOverlayVisibility(); render();
});

window.addEventListener("wheel",        updateOverlayVisibility, { passive: true });
canvas.addEventListener("pointerdown",  onPointerDown);
canvas.addEventListener("pointermove",  onPointerMove);
canvas.addEventListener("pointerup",    endDrag);
canvas.addEventListener("pointercancel", endDrag);
canvas.addEventListener("pointerleave", endDrag);
canvas.addEventListener("wheel",        onWheel, { passive: false });
canvas.addEventListener("dblclick",     onDoubleClick);
document.addEventListener("contextmenu", e => e.preventDefault());
canvas.addEventListener("mousedown",    e => { if (e.button === 1) e.preventDefault(); });

// ─── Init ─────────────────────────────────────────────────────────────────────

showGlow           = showGlowInput.checked;
showStarGlow       = showStarGlowInput.checked;
counterRotateStars = counterRotateStarsInput.checked;
sphereGlowAmount   = clamp(Number(sphereGlowAmountInput.value) / 100, 0, 3);
starGlowAmount     = clamp(Number(starGlowAmountInput.value) / 100, 0, 3);
starBrightness     = clamp(Number(starBrightnessInput.value) / 100, 0.2, 2);
sceneBrightness    = clamp(Number(sceneBrightnessInput.value) / 100, 0.4, 1.8);
sceneContrast      = clamp(Number(sceneContrastInput.value) / 100, 0.4, 1.8);
autoWarp           = autoWarpInput.checked;
stageHue           = Number(stageHueInput.value);
stageIntensity     = getStageIntensity();
stageBrightness    = getStageBrightness();
ringEnabled        = ringEnabledInput.checked;
sphereRadiusScale  = getSphereRadiusScale();
showInfoLabel      = showInfoLabelInput.checked;

updateStageBrightness();
chooseNextLabelPosition();
syncRingInputs();
syncZoomFromInput();
updateLabels();
updateSceneFilter();
resizeCanvas();
updateStageIntensity();
randomStageBackground();
setCompassVisible(showCompassInput.checked);
resetView();
openMenu();
updateOverlayVisibility();
setFpsVisible(showFpsInput.checked);
updateFullscreenButtonState();
setControlsDisabled(autoWarp);
updateCustomCursor();
requestAnimationFrame(animate);
 
