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

const showCompassInput = document.getElementById("showCompass");
const compassBox = document.getElementById("compassBox");

const starDensityInput = document.getElementById("starDensity");
const starDensityVal = document.getElementById("starDensityVal");
const sphereGlowAmountInput = document.getElementById("sphereGlowAmount");
const sphereGlowAmountVal = document.getElementById("sphereGlowAmountVal");
const starGlowAmountInput = document.getElementById("starGlowAmount");
const starGlowAmountVal = document.getElementById("starGlowAmountVal");
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

// ─── State ────────────────────────────────────────────────────────────────────

let showGlow = true;
let showStarGlow = true;
let sphereGlowAmount = 1;
let starGlowAmount = 1;
let paused = false;

let lastTime = 0;

let sphereRotation = identityMatrix();
let viewRotation = identityMatrix();

let zoom = 1;
const minZoom = 0.15;
const maxZoom = 2.4;

let dragMode = "none";
let dragPointerId = null;
let lastPointerX = 0;
let lastPointerY = 0;

let pointerClientX = window.innerWidth * 0.5;
let pointerClientY = window.innerHeight * 0.5;
let cursorAngle = 0;

let sphereAngularVelocity = [0, 0, 0];
const inertiaDamping = 2.4;
const autoReturnStrength = 2.8;

let fpsSmoothed = 0;
let inactivityTimer = null;
const overlayTimeoutMs = 5000;

let sphereScreen = { cx: 0, cy: 0, radius: 0 };
let stars = [];
let counterRotateStars = false;
const starCounterRotateStrength = 0.1;
let starfieldRotation = identityMatrix();
let sphereHue = 210;
let starViewRotation = identityMatrix();

let sceneBrightness = 1;
let sceneContrast = 1;

let autoWarp = false;
let autoWarpTimer = 0;

// Warp state
let warpActive = false;
let warpProgress = 0;
const warpDuration = 1.6;
let warpStarIdx = -1;
let warpStartZoom = 1;
let warpTargetZoom = 2.2;
let warpTargetHue = 210;
let warpTargetAxisX = 30;
let warpTargetAxisY = 100;
let warpTargetAxisZ = 10;
let warpTargetBrightness = 1;
let warpTargetContrast = 1;
let warpTargetSpeed = 120;
let warpSphereAlpha = 1;
let hoveredStarIdx = -1;
let warpSphereOffsetX = 0;
let warpSphereOffsetY = 0;
let warpDriftDirX = 0;
let warpDriftDirY = 0;
let warpStartViewRotation = identityMatrix();
let warpTargetViewRotation = identityMatrix();
let warpCounterRotateWasActive = false;

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
  return multiplyMatrices(rotationMatrixFromAxisAngle(scaleVector(omega, 1 / mag), mag * dt), r);
}

function randomUnitVector() {
  const u = Math.random() * 2 - 1;
  const a = Math.random() * Math.PI * 2;
  const r = Math.sqrt(1 - u * u);
  return [Math.cos(a) * r, u, Math.sin(a) * r];
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeInQuint(t) {
  return t * t * t * t * t;
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

function getViewRotationForStarCenter(starDir, currentViewRotation) {
  const currentDir = normalizeVector(multiplyMatrixVector(currentViewRotation, starDir));
  const targetDir = [0, 0, 1];

  const axis = cross(currentDir, targetDir);
  const axisLen = lengthVector(axis);
  const dotVal = clamp(
    currentDir[0] * targetDir[0] + currentDir[1] * targetDir[1] + currentDir[2] * targetDir[2],
    -1,
    1
  );

  if (axisLen < 1e-8) {
    if (dotVal > 0.9999) {
      return currentViewRotation;
    }
    const fallbackAxis = Math.abs(currentDir[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    return multiplyMatrices(
      rotationMatrixFromAxisAngle(fallbackAxis, Math.PI),
      currentViewRotation
    );
  }

  const angle = Math.acos(dotVal);
  const align = rotationMatrixFromAxisAngle(scaleVector(axis, 1 / axisLen), angle);
  return multiplyMatrices(align, currentViewRotation);
}

function getCurrentStarViewRotation() {
  const useCounterRotate = counterRotateStars && !warpActive;

  return useCounterRotate
    ? multiplyMatrices(transposeMatrix(viewRotation), starfieldRotation)
    : starViewRotation;
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function buildStars() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const df = clamp(Number(starDensityInput.value) / 100, 0.25, 3);
  const count = clamp(Math.floor((w * h / 4500) * df), 80, 3200);
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      dir: randomUnitVector(),
      distance: 3.8 + Math.random() * 4.4,
      radius: 0.4 + Math.random() * 1.8,
      alpha: 0.12 + Math.random() * 0.42,
      tint: Math.random(),
      name: `Star ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 999) + 1}`,
    });
  }
}

function starScreenPos(star, width, height) {
  const useCounterRotate = counterRotateStars && !warpActive;

  const viewForStars = useCounterRotate
    ? multiplyMatrices(transposeMatrix(viewRotation), starfieldRotation)
    : starViewRotation;
  const world = scaleVector(star.dir, star.distance);
  const rotated = multiplyMatrixVector(viewForStars, world);
  if (rotated[2] < -0.6) return null;
  const camera = 10, perspective = camera / (camera - rotated[2]);
  const starZoom = 0.82 + zoom * 0.18;
  const x = width * 0.5 + rotated[0] * height * 0.24 * perspective * starZoom;
  const y = height * 0.5 - rotated[1] * height * 0.24 * perspective * starZoom;
  if (x < -20 || x > width + 20 || y < -20 || y > height + 20) return null;
  return { x, y, r: star.radius * perspective * (0.9 + zoom * 0.12), rotated };
}

function findStarNear(mx, my) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
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

// ─── Canvas setup ─────────────────────────────────────────────────────────────

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  const cr = compassCanvas.getBoundingClientRect();
  compassCanvas.width = Math.max(1, Math.round(cr.width * dpr));
  compassCanvas.height = Math.max(1, Math.round(cr.height * dpr));
  compassCtx.setTransform(1, 0, 0, 1, 0, 0);
  compassCtx.scale(dpr, dpr);
  buildStars();
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

function getRandomVisibleStar() {
  if (!stars.length) return null;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  const attempts = Math.min(stars.length, 80);

  for (let i = 0; i < attempts; i++) {
    const idx = Math.floor(Math.random() * stars.length);
    const pos = starScreenPos(stars[idx], width, height);

    if (pos) {
      return { idx, pos };
    }
  }

  // Fallback: ersten sichtbaren Stern linear suchen
  for (let i = 0; i < stars.length; i++) {
    const pos = starScreenPos(stars[i], width, height);
    if (pos) {
      return { idx: i, pos };
    }
  }

  return null;
}

function setControlsDisabled(disabled) {
  const controls = [
    speedInput,
    zoomInput,
    axisXInput,
    axisYInput,
    axisZInput,
    latCountInput,
    lonCountInput,
    starDensityInput,
    sphereGlowAmountInput,
    starGlowAmountInput,
    hueInput,
    sceneBrightnessInput,
    sceneContrastInput
  ];

  controls.forEach((el) => {
    if (el) el.disabled = disabled;
  });

  autoWarpInput.disabled = false;
  autoWarpIntervalInput.disabled = false;
}

function triggerAutoWarp() {
  if (!autoWarp || warpActive || dragMode !== "none") return;

  const target = getRandomVisibleStar();
  if (!target) return;

  startWarp(target.idx, target.pos.x, target.pos.y);
}

function getLatCount() { return clamp(Number(latCountInput.value) || 0, 0, 16); }
function getLonCount() { return clamp(Number(lonCountInput.value) || 0, 0, 16); }
function syncZoomFromInput() { zoom = clamp(Number(zoomInput.value) / 100, minZoom, maxZoom); }
function syncInputFromZoom() { zoomInput.value = String(Math.round(zoom * 100)); }

// ─── Hue / color ─────────────────────────────────────────────────────────────

function hslColors(h) {
  return {
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
}

function updateHuePreview() {
  huePreview.style.background = `hsl(${sphereHue}, 85%, 65%)`;
  huePreview.style.boxShadow  = `0 0 6px 1px hsl(${sphereHue}, 80%, 60%)`;
}

function updateSceneFilter() {
  canvas.style.filter = `brightness(${sceneBrightness}) contrast(${sceneContrast})`;
}

function updateLabels() {
  const [x, y, z] = getAxisWeights();
  const density = clamp(Number(starDensityInput.value) / 100, 0.25, 3);
  sphereGlowAmount = clamp(Number(sphereGlowAmountInput.value) / 100, 0, 3);
  starGlowAmount = clamp(Number(starGlowAmountInput.value) / 100, 0, 3);

  starDensityVal.textContent = `${density.toFixed(2)}×`;
  sphereGlowAmountVal.textContent = `${sphereGlowAmount.toFixed(2)}×`;
  starGlowAmountVal.textContent = `${starGlowAmount.toFixed(2)}×`;
  sceneBrightness = clamp(Number(sceneBrightnessInput.value) / 100, 0.4, 1.8);
  sceneContrast = clamp(Number(sceneContrastInput.value) / 100, 0.4, 1.8);

  sceneBrightnessVal.textContent = `${sceneBrightness.toFixed(2)}×`;
  sceneContrastVal.textContent = `${sceneContrast.toFixed(2)}×`;
  updateSceneFilter();
  speedVal.textContent       = `${speedInput.value} °/s`;
  zoomVal.textContent        = `${zoom.toFixed(2)}×`;
  axisXVal.textContent       = x.toFixed(2);
  axisYVal.textContent       = y.toFixed(2);
  axisZVal.textContent       = z.toFixed(2);
  if (latCountVal) latCountVal.textContent = String(getLatCount());
  if (lonCountVal) lonCountVal.textContent = String(getLonCount());
  hueVal.textContent         = `${sphereHue}°`;
  updateHuePreview();
}

// ─── Drawing ──────────────────────────────────────────────────────────────────

function projectPointNormalized(point, radius, cx, cy) {
  const camera = 3.4, p = camera / (camera - point[2]);
  return { x: cx + point[0] * radius * p, y: cy - point[1] * radius * p, z: point[2] };
}

function transformSpherePoint(lp) {
  return multiplyMatrixVector(viewRotation, multiplyMatrixVector(sphereRotation, lp));
}

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

function drawSeamCircle(normal, offset, sphereRadius, cx, cy, c) {
  const { n, u, v } = buildPlaneBasis(normal);
  const cr = Math.sqrt(Math.max(0, 1 - offset * offset));
  const center = scaleVector(n, offset);
  const steps = 320, points = [];
  for (let i = 0; i <= steps; i++) {
    const t  = (i / steps) * Math.PI * 2;
    const lp = addVectors(center, addVectors(scaleVector(u, Math.cos(t) * cr), scaleVector(v, Math.sin(t) * cr)));
    points.push(projectPointNormalized(transformSpherePoint(lp), sphereRadius, cx, cy));
  }
  drawVisiblePolyline(points, p => p.z < 0,  c.seamDark, sphereRadius * 0.018);
  drawVisiblePolyline(points, p => p.z >= 0, c.seam,     sphereRadius * 0.012);
}

function drawBackground(width, height) {
  const cx = width * 0.5, cy = height * 0.5, minD = Math.min(width, height);

  const useCounterRotate = counterRotateStars && !warpActive;

  const viewForStars = useCounterRotate
    ? multiplyMatrices(transposeMatrix(viewRotation), starfieldRotation)
    : starViewRotation;

  for (let i = 0; i < stars.length; i++) {
    const star   = stars[i];
    const world  = scaleVector(star.dir, star.distance);
    const rotated = multiplyMatrixVector(viewForStars, world);
    if (rotated[2] < -0.6) continue;

    const camera      = 10;
    const perspective = camera / (camera - rotated[2]);
    const starZoom    = 0.82 + zoom * 0.18;
    const x           = cx + rotated[0] * height * 0.24 * perspective * starZoom;
    const y           = cy - rotated[1] * height * 0.24 * perspective * starZoom;
    if (x < -20 || x > width + 20 || y < -20 || y > height + 20) continue;

    const rv = 155 + Math.round((1 - star.tint) * 40);
    const gv = 205 + Math.round(star.tint * 30);
    const bv = 220 + Math.round(star.tint * 25);
    const sr = star.radius * perspective * (0.9 + zoom * 0.12);

    const isHovered     = i === hoveredStarIdx && !warpActive;
    const isWarpTarget  = i === warpStarIdx;

    let alphaScale = 1;
    if (warpActive) {
      alphaScale = isWarpTarget
        ? 1 + easeInQuint(warpProgress) * 2
        : Math.max(0, 1 - easeInOutCubic(warpProgress) * 0.7);
    }

    if (showStarGlow && starGlowAmount > 0 && (star.alpha > 0.3 || isHovered || isWarpTarget)) {
      const baseGlowR = isHovered || isWarpTarget ? sr * 7 : sr * 4;
      const glowR = baseGlowR * (0.45 + starGlowAmount * 0.55);
      const glowA = (isHovered ? star.alpha * 0.55 : star.alpha * 0.35) * starGlowAmount;
      const pulseR = isWarpTarget ? glowR * (1 + easeInQuint(warpProgress) * 3) : glowR;

      const glow = ctx.createRadialGradient(x, y, 0, x, y, pulseR);
      glow.addColorStop(0, `rgba(${rv}, ${gv}, ${bv}, ${glowA * alphaScale})`);
      glow.addColorStop(1, `rgba(${rv}, ${gv}, ${bv}, 0)`);

      ctx.beginPath();
      ctx.fillStyle = glow;
      ctx.arc(x, y, pulseR, 0, Math.PI * 2);
      ctx.fill();
    }

    const drawR = isHovered
      ? sr * 2
      : isWarpTarget ? sr * (1 + easeInQuint(warpProgress) * 4) : sr;

    ctx.beginPath();
    ctx.fillStyle = `rgba(${rv}, ${gv}, ${bv}, ${Math.min(1, star.alpha * alphaScale)})`;
    ctx.arc(x, y, drawR, 0, Math.PI * 2);
    ctx.fill();

    if (isHovered && !warpActive) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${rv}, ${gv}, ${bv}, 0.6)`;
      ctx.lineWidth   = 0.8;
      ctx.arc(x, y, sr * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawSphere(alpha) {
  if (alpha < 0.005) return;
  const width = canvas.clientWidth, height = canvas.clientHeight;
  const baseCx = width * 0.5;
  const baseCy = height * 0.5;
  const cx = baseCx + warpSphereOffsetX;
  const cy = baseCy + warpSphereOffsetY;
  const radius = Math.min(width, height) * 0.23 * zoom;
  sphereScreen = { cx, cy, radius };
  const c = hslColors(sphereHue);

  ctx.globalAlpha = alpha;

  if (showGlow && sphereGlowAmount > 0.02) {
    const glowRadiusFactor = 1 + sphereGlowAmount * 0.18;
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

  const shell = ctx.createRadialGradient(cx - radius * 0.36, cy - radius * 0.42, radius * 0.06, cx, cy, radius * 1.08);
  shell.addColorStop(0,    c.high);
  shell.addColorStop(0.12, c.mid1);
  shell.addColorStop(0.28, c.mid2);
  shell.addColorStop(0.58, c.mid3);
  shell.addColorStop(0.82, c.low1);
  shell.addColorStop(1,    c.deep);
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fillStyle = shell; ctx.fill();

  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.clip();

  const lonCount = getLonCount(), latCount = getLatCount();
  for (let i = 0; i < lonCount; i++) {
    const angle = (i / Math.max(1, lonCount)) * Math.PI;
    drawSeamCircle([Math.cos(angle), 0, Math.sin(angle)], 0, radius, cx, cy, c);
  }
  for (let i = 1; i <= latCount; i++) {
    const phi = -Math.PI / 2 + (i * Math.PI) / (latCount + 1);
    drawSeamCircle([0, 1, 0], Math.sin(phi), radius, cx, cy, c);
  }

  const scan = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  scan.addColorStop(0,    "rgba(255, 200, 110, 0.08)");
  scan.addColorStop(0.35, "rgba(255, 255, 255, 0.00)");
  scan.addColorStop(0.65, "rgba(120, 220, 255, 0.06)");
  scan.addColorStop(1,    "rgba(255, 255, 255, 0.00)");
  ctx.fillStyle = scan; ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  const light = ctx.createRadialGradient(cx - radius * 0.44, cy - radius * 0.48, radius * 0.04, cx - radius * 0.12, cy - radius * 0.14, radius * 1.1);
  light.addColorStop(0,   "rgba(255, 255, 255, 0.34)");
  light.addColorStop(0.2, "rgba(200, 245, 255, 0.15)");
  light.addColorStop(0.5, "rgba(140, 220, 255, 0.04)");
  light.addColorStop(1,   "rgba(255, 255, 255, 0)");
  ctx.fillStyle = light; ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  const edgeShade = ctx.createRadialGradient(cx + radius * 0.35, cy + radius * 0.42, radius * 0.1, cx, cy, radius * 1.25);
  edgeShade.addColorStop(0,    "rgba(0, 0, 0, 0.02)");
  edgeShade.addColorStop(0.64, "rgba(0, 0, 0, 0.14)");
  edgeShade.addColorStop(1,    "rgba(0, 0, 0, 0.44)");
  ctx.fillStyle = edgeShade; ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  ctx.restore();

  ctx.strokeStyle = c.rim; ctx.lineWidth = radius * 0.01;
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawCompass() {
  const width = compassCanvas.clientWidth, height = compassCanvas.clientHeight;
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
    compassCtx.fillStyle      = hexToRgba(axis.color, alpha);
    compassCtx.font           = "12px Inter, system-ui, sans-serif";
    compassCtx.textAlign      = "center";
    compassCtx.textBaseline   = "middle";
    compassCtx.fillText(axis.label, x, y);
  }
}

function hexToRgba(hex, alpha) {
  const v = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}, ${alpha})`;
}

function render() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  ctx.clearRect(0, 0, width, height);
  drawBackground(width, height);
  drawSphere(warpSphereAlpha);
  drawCompass();
}

// ─── Warp ─────────────────────────────────────────────────────────────────────

function startWarp(starIdx, flashX, flashY) {
  if (warpActive) return;
  autoWarpTimer    = 0;
  warpActive       = true;
  warpProgress     = 0;
  warpCounterRotateWasActive = counterRotateStars;
  counterRotateStars = false;
  warpStarIdx      = starIdx;
  warpStartZoom    = zoom;
  warpTargetZoom   = Math.min(1.22, zoom * 1.12 + 0.08);
  warpTargetHue    = Math.floor(Math.random() * 360);
  warpTargetAxisX  = Math.floor(Math.random() * 200) - 100;
  warpTargetAxisY  = Math.floor(Math.random() * 200) - 100;
  warpTargetAxisZ  = Math.floor(Math.random() * 200) - 100;
  warpTargetBrightness = randomizeAround(sceneBrightness, 0.18, 0.4, 1.8);
  warpTargetContrast   = randomizeAround(sceneContrast, 0.18, 0.4, 1.8);
  warpTargetSpeed  = Math.round(randomizeAround(Number(speedInput.value), 0.18, 0, 720));
  warpSphereAlpha  = 1;
  warpSphereAlpha  = 1;
  starLabel.style.opacity = "0";

  warpStartViewRotation = viewRotation;

  const starDir = stars[starIdx]?.dir || [0, 0, 1];
  warpTargetViewRotation = getViewRotationForStarCenter(starDir, viewRotation);

  const centerX = canvas.clientWidth * 0.5;
  const centerY = canvas.clientHeight * 0.5;
  const dirX = flashX - centerX;
  const dirY = flashY - centerY;
  const dirLen = Math.hypot(dirX, dirY) || 1;

  warpDriftDirX = -dirX / dirLen;
  warpDriftDirY = -dirY / dirLen;
  warpSphereOffsetX = 0;
  warpSphereOffsetY = 0;

  warpOverlay.style.setProperty("--wx", `${(flashX / canvas.clientWidth)  * 100}%`);
  warpOverlay.style.setProperty("--wy", `${(flashY / canvas.clientHeight) * 100}%`);
  warpOverlay.classList.add("flash");
  setTimeout(() => warpOverlay.classList.remove("flash"), 350);
}

function tickWarp(dt) {
  warpProgress = Math.min(1, warpProgress + dt / warpDuration);
  const t = easeInOutCubic(warpProgress);

  zoom = warpStartZoom + (warpTargetZoom - warpStartZoom) * t;
  syncInputFromZoom();

  const q1 = matToQuat(warpStartViewRotation);
  const q2 = matToQuat(warpTargetViewRotation);
  viewRotation = quatToMat(slerpQuat(q1, q2, t));

  if (!counterRotateStars) {
    starViewRotation = viewRotation;
  }

  const driftDistance = Math.max(canvas.clientWidth, canvas.clientHeight) * 0.9;
  const driftT = easeInOutCubic(warpProgress);

  warpSphereOffsetX = warpDriftDirX * driftDistance * driftT;
  warpSphereOffsetY = warpDriftDirY * driftDistance * driftT;

  warpSphereAlpha = Math.max(0, 1 - easeInOutCubic(Math.max(0, warpProgress * 2 - 0.35)));

if (warpProgress >= 1) {
  sphereHue      = warpTargetHue;
  hueInput.value = String(warpTargetHue);
  axisXInput.value = String(warpTargetAxisX);
  axisYInput.value = String(warpTargetAxisY);
  axisZInput.value = String(warpTargetAxisZ);

  sceneBrightnessInput.value = String(Math.round(warpTargetBrightness * 100));
  sceneContrastInput.value = String(Math.round(warpTargetContrast * 100));
  speedInput.value = String(warpTargetSpeed);

  sphereRotation = identityMatrix();
  sphereAngularVelocity = getPresetAngularVelocity();

  zoom = warpTargetZoom;
  syncInputFromZoom();

  warpSphereAlpha   = 1;
  warpSphereOffsetX = 0;
  warpSphereOffsetY = 0;
  warpDriftDirX = 0;
  warpDriftDirY = 0;

  if (warpCounterRotateWasActive) {
    starfieldRotation = multiplyMatrices(viewRotation, viewRotation);
  } else {
    starViewRotation = viewRotation;
  }

  if (warpStarIdx >= 0 && warpStarIdx < stars.length) {
    stars.splice(warpStarIdx, 1);
  }

  counterRotateStars = warpCounterRotateWasActive;
  counterRotateStarsInput.checked = counterRotateStars;
  warpCounterRotateWasActive = false;

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
  overlay.classList.toggle("visible", v);
  stage.classList.toggle("ui-hidden", !v);
  customCursor?.classList.toggle("hidden", !v);
}

function updateOverlayVisibility() {
  setUiVisible(true);
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => { if (dragMode === "none") setUiVisible(false); }, overlayTimeoutMs);
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
  sphereAngularVelocity = getPresetAngularVelocity();
  render();
}

function resetView() {
  speedInput.value  = 120;
  zoom              = 1;
  syncInputFromZoom();
  axisXInput.value  = 30;
  axisYInput.value  = 100;
  axisZInput.value  = 10;
  latCountInput.value = 4;
  lonCountInput.value = 4;
  hueInput.value    = 210;
  sphereHue         = 210;
  sceneBrightnessInput.value = 100;
  sceneContrastInput.value = 100;
  speedInput.value = 120;
  autoWarpTimer = 0;
  sphereRotation    = identityMatrix();
  viewRotation      = identityMatrix();
  sphereAngularVelocity = getPresetAngularVelocity();
  starfieldRotation = identityMatrix();
  starViewRotation  = viewRotation;
  paused            = false;
  pauseBtn.textContent = "Pause";
  warpActive        = false;
  warpStarIdx       = -1;
  warpSphereAlpha   = 1;
  warpSphereOffsetX = 0;
  warpSphereOffsetY = 0;
  warpDriftDirX = 0;
  warpDriftDirY = 0;
  warpStartViewRotation = identityMatrix();
  warpTargetViewRotation = identityMatrix();
  warpCounterRotateWasActive = false;
  updateLabels();
  updateSceneFilter();
  render();
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

  // Star hover
  if (dragMode === "none" && !warpActive) {
    const p   = eventToCanvasPoint(e);
    const idx = findStarNear(p.x, p.y);
    if (idx !== hoveredStarIdx) {
      hoveredStarIdx = idx;
      if (idx >= 0) {
        const pos = starScreenPos(stars[idx], canvas.clientWidth, canvas.clientHeight);
        if (pos) {
          starLabel.textContent    = `⊕ ${stars[idx].name} — middle-click to warp`;
          starLabel.style.left     = `${pos.x}px`;
          starLabel.style.top      = `${pos.y}px`;
          starLabel.style.opacity  = "1";
        }
      } else {
        starLabel.style.opacity = "0";
      }
    }
  }

  if (dragMode === "none" || e.pointerId !== dragPointerId) return;

  const dx  = e.clientX - lastPointerX;
  const dy  = e.clientY - lastPointerY;
  lastPointerX = e.clientX;
  lastPointerY = e.clientY;
  const rect = canvas.getBoundingClientRect();
  const nx   = dx / Math.max(1, rect.width);
  const ny   = dy / Math.max(1, rect.height);

  if (dragMode === "sphere") {
    const yaw   = -nx * Math.PI * 1.8;
    const pitch =  ny * Math.PI * 1.8;
    const vi    = transposeMatrix(viewRotation);
    sphereRotation = multiplyMatrices(rotationMatrixFromAxisAngle(multiplyMatrixVector(vi, [0, 1, 0]), yaw),   sphereRotation);
    sphereRotation = multiplyMatrices(rotationMatrixFromAxisAngle(multiplyMatrixVector(vi, [1, 0, 0]), pitch),  sphereRotation);
    const dtA = 1 / 60;
    sphereAngularVelocity = [pitch / dtA, yaw / dtA, 0];
  } else if (dragMode === "view") {
    const yaw   = -nx * Math.PI * 1.6;
    const pitch =  ny * Math.PI * 1.6;
    viewRotation = multiplyMatrices(rotationMatrixFromAxisAngle([0, 1, 0], yaw),   viewRotation);
    viewRotation = multiplyMatrices(rotationMatrixFromAxisAngle([1, 0, 0], pitch),  viewRotation);

    if (!counterRotateStars) {
      starViewRotation = viewRotation;
    }
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

function toggleFullscreen() {
  if (!document.fullscreenElement) stage.requestFullscreen?.();
  else document.exitFullscreen?.();
}

function updateFullscreenButtonState() {
  const isFullscreen = !!document.fullscreenElement;
  fullscreenBtn.textContent = isFullscreen ? "Exit Fullscreen" : "Fullscreen";
  fullscreenBtn.classList.toggle("active", isFullscreen);
}

// ─── Animation loop ───────────────────────────────────────────────────────────

function animate(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min(0.04, (timestamp - lastTime) / 1000);
  lastTime = timestamp;

  if (dt > 0) {
    const f = 1 / dt;
    fpsSmoothed = fpsSmoothed === 0 ? f : fpsSmoothed * 0.9 + f * 0.1;
    fpsVal.textContent = String(Math.round(fpsSmoothed));
  }

  if (warpActive) {
    tickWarp(dt);
    updateLabels();
  }

  if (autoWarp && !warpActive && dragMode === "none") {
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
    sphereAngularVelocity = addVectors(sphereAngularVelocity, scaleVector(diff, clamp(autoReturnStrength * dt, 0, 1)));
    const damping = Math.exp(-inertiaDamping * dt);
    sphereAngularVelocity = addVectors(target, scaleVector(subtractVectors(sphereAngularVelocity, target), damping));
    sphereRotation = applyAngularVelocity(sphereRotation, sphereAngularVelocity, dt);
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
  updateOverlayVisibility();
});

resetSphereBtn.addEventListener("click", () => { resetSphereOrientation(); updateOverlayVisibility(); });
resetBtn.addEventListener("click",       () => { resetView();              updateOverlayVisibility(); });
fullscreenBtn.addEventListener("click",  () => { toggleFullscreen();       updateOverlayVisibility(); });

showFpsInput.addEventListener("change",     () => { setFpsVisible(showFpsInput.checked);         updateOverlayVisibility(); });
showCompassInput.addEventListener("change", () => { setCompassVisible(showCompassInput.checked);  updateOverlayVisibility(); render(); });
starDensityInput.addEventListener("input",  () => { buildStars(); updateLabels();                 updateOverlayVisibility(); render(); });
sphereGlowAmountInput.addEventListener("input", () => {
  updateLabels();
  updateOverlayVisibility();
  render();
});

starGlowAmountInput.addEventListener("input", () => {
  updateLabels();
  updateOverlayVisibility();
  render();
});
showGlowInput.addEventListener("change",    () => { showGlow     = showGlowInput.checked;         updateOverlayVisibility(); render(); });
showStarGlowInput.addEventListener("change",() => { showStarGlow = showStarGlowInput.checked;     updateOverlayVisibility(); render(); });

counterRotateStarsInput.addEventListener("change", () => {
  const currentStarViewRotation = getCurrentStarViewRotation();
  const nextState = counterRotateStarsInput.checked;

  if (nextState) {
    starfieldRotation = multiplyMatrices(viewRotation, currentStarViewRotation);
  } else {
    starViewRotation = currentStarViewRotation;
  }

  counterRotateStars = nextState;
  updateOverlayVisibility();
  render();
});

sceneBrightnessInput.addEventListener("input", () => {
  updateLabels();
  updateOverlayVisibility();
  render();
});

sceneContrastInput.addEventListener("input", () => {
  updateLabels();
  updateOverlayVisibility();
  render();
});

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

window.addEventListener("resize",       () => { resizeCanvas(); render(); });
window.addEventListener("pointermove", (e) => {
  pointerClientX = e.clientX;
  pointerClientY = e.clientY;
  cursorAngle += 1.4;
  updateCustomCursor();
  updateOverlayVisibility();
}, { passive: true });
window.addEventListener("keydown", (event) => {
  updateOverlayVisibility();

  if (event.key === "F11") {
    setTimeout(() => {
      updateFullscreenButtonState();
      resizeCanvas();
      render();
    }, 100);
  }
});
window.addEventListener("wheel",        updateOverlayVisibility, { passive: true });

canvas.addEventListener("pointerdown",  onPointerDown);
canvas.addEventListener("pointermove",  onPointerMove);
canvas.addEventListener("pointerup",    endDrag);
canvas.addEventListener("pointercancel",endDrag);
canvas.addEventListener("pointerleave", endDrag);
canvas.addEventListener("wheel",        onWheel, { passive: false });
canvas.addEventListener("dblclick",     onDoubleClick);
canvas.addEventListener("contextmenu",  e => e.preventDefault());
canvas.addEventListener("mousedown",    e => { if (e.button === 1) e.preventDefault(); });

// ─── Init ─────────────────────────────────────────────────────────────────────

showGlow        = showGlowInput.checked;
showStarGlow    = showStarGlowInput.checked;
counterRotateStars = counterRotateStarsInput.checked;
sphereGlowAmount = clamp(Number(sphereGlowAmountInput.value) / 100, 0, 3);
starGlowAmount = clamp(Number(starGlowAmountInput.value) / 100, 0, 3);
sceneBrightness = clamp(Number(sceneBrightnessInput.value) / 100, 0.4, 1.8);
sceneContrast = clamp(Number(sceneContrastInput.value) / 100, 0.4, 1.8);
autoWarp = autoWarpInput.checked;
syncZoomFromInput();
updateLabels();
updateSceneFilter();
resizeCanvas();
setCompassVisible(showCompassInput.checked);
resetView();
setUiVisible(true);
updateOverlayVisibility();
setFpsVisible(showFpsInput.checked);
updateFullscreenButtonState();
setControlsDisabled(autoWarp);
updateCustomCursor();
requestAnimationFrame(animate);
