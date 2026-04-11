const canvas = document.getElementById("sphereCanvas");
const ctx = canvas.getContext("2d");

const compassCanvas = document.getElementById("compassCanvas");
const compassCtx = compassCanvas.getContext("2d");

const stage = document.getElementById("stage");
const overlay = document.getElementById("overlay");

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
const showGlowInput = document.getElementById("showGlow");

const counterRotateStarsInput = document.getElementById("counterRotateStars");

let showGlow = true;

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

function identityMatrix() {
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function lengthVector(v) {
  return Math.hypot(v[0], v[1], v[2]);
}

function normalizeVector(v) {
  const len = lengthVector(v);
  if (len < 1e-10) {
    return [0, 0, 0];
  }
  return [v[0] / len, v[1] / len, v[2] / len];
}

function multiplyMatrices(a, b) {
  return [
    [
      a[0][0] * b[0][0] + a[0][1] * b[1][0] + a[0][2] * b[2][0],
      a[0][0] * b[0][1] + a[0][1] * b[1][1] + a[0][2] * b[2][1],
      a[0][0] * b[0][2] + a[0][1] * b[1][2] + a[0][2] * b[2][2]
    ],
    [
      a[1][0] * b[0][0] + a[1][1] * b[1][0] + a[1][2] * b[2][0],
      a[1][0] * b[0][1] + a[1][1] * b[1][1] + a[1][2] * b[2][1],
      a[1][0] * b[0][2] + a[1][1] * b[1][2] + a[1][2] * b[2][2]
    ],
    [
      a[2][0] * b[0][0] + a[2][1] * b[1][0] + a[2][2] * b[2][0],
      a[2][0] * b[0][1] + a[2][1] * b[1][1] + a[2][2] * b[2][1],
      a[2][0] * b[0][2] + a[2][1] * b[1][2] + a[2][2] * b[2][2]
    ]
  ];
}

function multiplyMatrixVector(m, v) {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]
  ];
}

function transposeMatrix(m) {
  return [
    [m[0][0], m[1][0], m[2][0]],
    [m[0][1], m[1][1], m[2][1]],
    [m[0][2], m[1][2], m[2][2]]
  ];
}

function rotationMatrixFromAxisAngle(axis, angle) {
  const [x, y, z] = normalizeVector(axis);

  if (Math.hypot(x, y, z) < 1e-10 || Math.abs(angle) < 1e-10) {
    return identityMatrix();
  }

  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;

  return [
    [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
    [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
    [t * x * z - s * y, t * y * z + s * x, t * z * z + c]
  ];
}

function applyAngularVelocity(rotationMatrix, omega, dt) {
  const magnitude = lengthVector(omega);

  if (magnitude < 1e-10) {
    return rotationMatrix;
  }

  const axis = scaleVector(omega, 1 / magnitude);
  const angle = magnitude * dt;
  const step = rotationMatrixFromAxisAngle(axis, angle);

  return multiplyMatrices(step, rotationMatrix);
}

function randomUnitVector() {
  const u = Math.random() * 2 - 1;
  const a = Math.random() * Math.PI * 2;
  const r = Math.sqrt(1 - u * u);
  return [Math.cos(a) * r, u, Math.sin(a) * r];
}

function buildStars() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const area = width * height;
  const densityFactor = clamp(Number(starDensityInput.value) / 100, 0.25, 3);
  const count = clamp(Math.floor((area / 4500) * densityFactor), 80, 3200);
  stars = [];

  for (let i = 0; i < count; i += 1) {
    const dir = randomUnitVector();
    const distance = 3.8 + Math.random() * 4.4;
    const radius = 0.4 + Math.random() * 1.8;
    const alpha = 0.12 + Math.random() * 0.42;
    const tint = Math.random();

    stars.push({ dir, distance, radius, alpha, tint });
  }
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  const compassRect = compassCanvas.getBoundingClientRect();
  compassCanvas.width = Math.max(1, Math.round(compassRect.width * dpr));
  compassCanvas.height = Math.max(1, Math.round(compassRect.height * dpr));
  compassCtx.setTransform(1, 0, 0, 1, 0, 0);
  compassCtx.scale(dpr, dpr);

  buildStars();
}

function getAxisWeights() {
  return [
    Number(axisXInput.value) / 100,
    Number(axisYInput.value) / 100,
    Number(axisZInput.value) / 100
  ];
}

function getPresetAngularVelocity() {
  const speedRad = Number(speedInput.value) * Math.PI / 180;
  const [x, y, z] = getAxisWeights();

  return [
    x * speedRad,
    y * speedRad,
    z * speedRad
  ];
}

function getLatCount() {
  return clamp(Number(latCountInput.value) || 0, 0, 16);
}

function getLonCount() {
  return clamp(Number(lonCountInput.value) || 0, 0, 16);
}

function syncZoomFromInput() {
  zoom = clamp(Number(zoomInput.value) / 100, minZoom, maxZoom);
}

function syncInputFromZoom() {
  zoomInput.value = String(Math.round(zoom * 100));
}

function updateLabels() {
  const [x, y, z] = getAxisWeights();
  const density = clamp(Number(starDensityInput.value) / 100, 0.25, 3);
  starDensityVal.textContent = `${density.toFixed(2)}×`;
  speedVal.textContent = `${speedInput.value} °/s`;
  zoomVal.textContent = `${zoom.toFixed(2)}×`;
  axisXVal.textContent = x.toFixed(2);
  axisYVal.textContent = y.toFixed(2);
  axisZVal.textContent = z.toFixed(2);
  latCountVal.textContent = String(getLatCount());
  lonCountVal.textContent = String(getLonCount());
}

function projectPointNormalized(point, radius, cx, cy) {
  const camera = 3.4;
  const perspective = camera / (camera - point[2]);

  return {
    x: cx + point[0] * radius * perspective,
    y: cy - point[1] * radius * perspective,
    z: point[2]
  };
}

function transformSpherePoint(localPoint) {
  const spun = multiplyMatrixVector(sphereRotation, localPoint);
  return multiplyMatrixVector(viewRotation, spun);
}

function drawVisiblePolyline(points, predicate, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  let drawing = false;
  ctx.beginPath();

  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    const visible = predicate(p);

    if (visible && !drawing) {
      ctx.moveTo(p.x, p.y);
      drawing = true;
    } else if (visible && drawing) {
      ctx.lineTo(p.x, p.y);
    } else if (!visible && drawing) {
      ctx.stroke();
      ctx.beginPath();
      drawing = false;
    }
  }

  if (drawing) {
    ctx.stroke();
  }
}

function buildPlaneBasis(normal) {
  const n = normalizeVector(normal);
  const ref = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const u = normalizeVector(cross(n, ref));
  const v = normalizeVector(cross(n, u));
  return { n, u, v };
}

function drawSeamCircle(normal, offset, sphereRadius, cx, cy) {
  const { n, u, v } = buildPlaneBasis(normal);
  const circleRadius = Math.sqrt(Math.max(0, 1 - offset * offset));
  const center = scaleVector(n, offset);
  const steps = 320;
  const points = [];

  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Math.PI * 2;

    const localPoint = addVectors(
      center,
      addVectors(
        scaleVector(u, Math.cos(t) * circleRadius),
        scaleVector(v, Math.sin(t) * circleRadius)
      )
    );

    const worldPoint = transformSpherePoint(localPoint);
    points.push(projectPointNormalized(worldPoint, sphereRadius, cx, cy));
  }

  drawVisiblePolyline(
    points,
    (p) => p.z < 0,
    "rgba(8, 20, 28, 0.22)",
    sphereRadius * 0.018
  );

  drawVisiblePolyline(
    points,
    (p) => p.z >= 0,
    "rgba(128, 232, 255, 0.88)",
    sphereRadius * 0.012
  );
}

function drawBackground(width, height) {
  const centerX = width * 0.5;
  const centerY = height * 0.5;

  const glow = ctx.createRadialGradient(
    centerX,
    centerY,
    Math.min(width, height) * 0.08,
    centerX,
    centerY,
    Math.min(width, height) * 0.7
  );
  glow.addColorStop(0, "rgba(110, 225, 255, 0.045)");
  glow.addColorStop(0.45, "rgba(55, 170, 220, 0.02)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const viewForStars = counterRotateStars
    ? multiplyMatrices(transposeMatrix(viewRotation), starfieldRotation)
    : viewRotation;

  for (const star of stars) {
    const world = scaleVector(star.dir, star.distance);
    const rotated = multiplyMatrixVector(viewForStars, world);

    if (rotated[2] < -0.6) {
      continue;
    }

    const camera = 10;
    const perspective = camera / (camera - rotated[2]);
    const starZoom = 0.82 + zoom * 0.18;

    const x = centerX + rotated[0] * height * 0.24 * perspective * starZoom;
    const y = centerY - rotated[1] * height * 0.24 * perspective * starZoom;

    if (x < -20 || x > width + 20 || y < -20 || y > height + 20) {
      continue;
    }

    const red = 155 + Math.round((1 - star.tint) * 40);
    const green = 205 + Math.round(star.tint * 30);
    const blue = 220 + Math.round(star.tint * 25);

    ctx.beginPath();
    ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${star.alpha})`;
    ctx.arc(x, y, star.radius * perspective * (0.9 + zoom * 0.12), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSphere() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  ctx.clearRect(0, 0, width, height);
  drawBackground(width, height);

  const cx = width * 0.5;
  const cy = height * 0.5;
  const radius = Math.min(width, height) * 0.23 * zoom;

  sphereScreen = { cx, cy, radius };

  if (showGlow) {
    const glowRadius = Math.max(radius * 1.9, Math.min(width, height) * 0.34);

    const glow = ctx.createRadialGradient(
      cx,
      cy,
      radius * 0.30,
      cx,
      cy,
      glowRadius
    );

    glow.addColorStop(0, "rgba(110, 225, 255, 0.14)");
    glow.addColorStop(0.35, "rgba(55, 170, 220, 0.09)");
    glow.addColorStop(0.7, "rgba(30, 120, 170, 0.035)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  const shell = ctx.createRadialGradient(
    cx - radius * 0.36,
    cy - radius * 0.42,
    radius * 0.06,
    cx,
    cy,
    radius * 1.08
  );
  shell.addColorStop(0, "#d6f8ff");
  shell.addColorStop(0.12, "#9be9ff");
  shell.addColorStop(0.28, "#4fc4ef");
  shell.addColorStop(0.58, "#17648d");
  shell.addColorStop(0.82, "#0d2f4f");
  shell.addColorStop(1, "#071625");

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

  for (let i = 0; i < lonCount; i += 1) {
    const angle = (i / Math.max(1, lonCount)) * Math.PI;
    const normal = [Math.cos(angle), 0, Math.sin(angle)];
    drawSeamCircle(normal, 0, radius, cx, cy);
  }

  for (let i = 1; i <= latCount; i += 1) {
    const phi = -Math.PI / 2 + (i * Math.PI) / (latCount + 1);
    const offset = Math.sin(phi);
    drawSeamCircle([0, 1, 0], offset, radius, cx, cy);
  }

  const scan = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  scan.addColorStop(0, "rgba(255, 200, 110, 0.08)");
  scan.addColorStop(0.35, "rgba(255, 255, 255, 0.00)");
  scan.addColorStop(0.65, "rgba(120, 220, 255, 0.06)");
  scan.addColorStop(1, "rgba(255, 255, 255, 0.00)");
  ctx.fillStyle = scan;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  const light = ctx.createRadialGradient(
    cx - radius * 0.44,
    cy - radius * 0.48,
    radius * 0.04,
    cx - radius * 0.12,
    cy - radius * 0.14,
    radius * 1.1
  );
  light.addColorStop(0, "rgba(255,255,255,0.34)");
  light.addColorStop(0.2, "rgba(200,245,255,0.15)");
  light.addColorStop(0.5, "rgba(140,220,255,0.04)");
  light.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = light;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  const edgeShade = ctx.createRadialGradient(
    cx + radius * 0.35,
    cy + radius * 0.42,
    radius * 0.1,
    cx,
    cy,
    radius * 1.25
  );
  edgeShade.addColorStop(0, "rgba(0,0,0,0.02)");
  edgeShade.addColorStop(0.64, "rgba(0,0,0,0.14)");
  edgeShade.addColorStop(1, "rgba(0,0,0,0.44)");
  ctx.fillStyle = edgeShade;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  ctx.restore();

  ctx.strokeStyle = "rgba(179, 241, 255, 0.24)";
  ctx.lineWidth = radius * 0.01;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCompass() {
  const width = compassCanvas.clientWidth;
  const height = compassCanvas.clientHeight;

  compassCtx.clearRect(0, 0, width, height);

  if (compassBox.classList.contains("hidden")) {
    return;
  }

  const cx = width * 0.5;
  const cy = height * 0.5;
  const radius = Math.min(width, height) * 0.34;

  compassCtx.beginPath();
  compassCtx.strokeStyle = "rgba(125, 220, 255, 0.22)";
  compassCtx.lineWidth = 1.25;
  compassCtx.arc(cx, cy, radius, 0, Math.PI * 2);
  compassCtx.stroke();

  compassCtx.beginPath();
  compassCtx.strokeStyle = "rgba(255, 200, 110, 0.25)";
  compassCtx.lineWidth = 1;
  compassCtx.ellipse(cx, cy, radius, radius * 0.42, 0, 0, Math.PI * 2);
  compassCtx.stroke();

  const axisInfo = [
    { label: "X", vector: [1, 0, 0], color: "#ffad66" },
    { label: "Y", vector: [0, 1, 0], color: "#7ee7ff" },
    { label: "Z", vector: [0, 0, 1], color: "#b6c9ff" }
  ];

  for (const axis of axisInfo) {
    const transformed = multiplyMatrixVector(viewRotation, axis.vector);
    const x = cx + transformed[0] * radius * 0.88;
    const y = cy - transformed[1] * radius * 0.88;
    const alpha = 0.35 + Math.max(0, transformed[2]) * 0.65;

    compassCtx.beginPath();
    compassCtx.strokeStyle = hexToRgba(axis.color, alpha);
    compassCtx.lineWidth = 2;
    compassCtx.moveTo(cx, cy);
    compassCtx.lineTo(x, y);
    compassCtx.stroke();

    compassCtx.fillStyle = hexToRgba(axis.color, alpha);
    compassCtx.font = "12px Inter, system-ui, sans-serif";
    compassCtx.textAlign = "center";
    compassCtx.textBaseline = "middle";
    compassCtx.fillText(axis.label, x, y);
  }
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function render() {
  drawSphere();
  drawCompass();
}

function setUiVisible(visible) {
  overlay.classList.toggle("visible", visible);
  stage.classList.toggle("ui-hidden", !visible);
}

function updateOverlayVisibility() {
  setUiVisible(true);
  clearTimeout(inactivityTimer);

  inactivityTimer = setTimeout(() => {
    if (dragMode === "none") {
      setUiVisible(false);
    }
  }, overlayTimeoutMs);
}

function setFpsVisible(visible) {
  fpsBox.classList.toggle("hidden", !visible);
}

function setCompassVisible(visible) {
  compassBox.classList.toggle("hidden", !visible);
}

function resetSphereOrientation() {
  sphereRotation = identityMatrix();
  sphereAngularVelocity = getPresetAngularVelocity();
  render();
}

function resetView() {
  speedInput.value = 120;
  zoom = 1;
  syncInputFromZoom();

  axisXInput.value = 30;
  axisYInput.value = 100;
  axisZInput.value = 10;

  latCountInput.value = 4;
  lonCountInput.value = 4;

  sphereRotation = identityMatrix();
  viewRotation = identityMatrix();
  sphereAngularVelocity = getPresetAngularVelocity();
  starfieldRotation = identityMatrix();

  paused = false;
  pauseBtn.textContent = "Pause";

  updateLabels();
  render();
}

function eventToCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function isPointOnSphere(event) {
  const point = eventToCanvasPoint(event);
  const dx = point.x - sphereScreen.cx;
  const dy = point.y - sphereScreen.cy;
  return dx * dx + dy * dy <= sphereScreen.radius * sphereScreen.radius;
}

function onPointerDown(event) {
  if (event.target.closest(".overlay")) {
    return;
  }

  updateOverlayVisibility();

  if (event.button === 0 && isPointOnSphere(event)) {
    dragMode = "sphere";
    dragPointerId = event.pointerId;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    sphereAngularVelocity = [0, 0, 0];
    canvas.classList.add("dragging-sphere");
    canvas.setPointerCapture(event.pointerId);
    return;
  }

  if (event.button === 2) {
    dragMode = "view";
    dragPointerId = event.pointerId;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    canvas.classList.add("dragging-view");
    canvas.setPointerCapture(event.pointerId);
  }
}

function onPointerMove(event) {
  updateOverlayVisibility();

  if (dragMode === "none" || event.pointerId !== dragPointerId) {
    return;
  }

  const dx = event.clientX - lastPointerX;
  const dy = event.clientY - lastPointerY;

  lastPointerX = event.clientX;
  lastPointerY = event.clientY;

  const rect = canvas.getBoundingClientRect();
  const nx = dx / Math.max(1, rect.width);
  const ny = dy / Math.max(1, rect.height);

  if (dragMode === "sphere") {
    const yaw = -nx * Math.PI * 1.8;
    const pitch = ny * Math.PI * 1.8;

    const viewInverse = transposeMatrix(viewRotation);
    const axisYaw = multiplyMatrixVector(viewInverse, [0, 1, 0]);
    const axisPitch = multiplyMatrixVector(viewInverse, [1, 0, 0]);

    sphereRotation = multiplyMatrices(rotationMatrixFromAxisAngle(axisYaw, yaw), sphereRotation);
    sphereRotation = multiplyMatrices(rotationMatrixFromAxisAngle(axisPitch, pitch), sphereRotation);

    const dtAssumed = 1 / 60;
    sphereAngularVelocity = [
      pitch / dtAssumed,
      yaw / dtAssumed,
      0
    ];
  } else if (dragMode === "view") {
    const yaw = -nx * Math.PI * 1.6;
    const pitch = ny * Math.PI * 1.6;

    const yawMatrix = rotationMatrixFromAxisAngle([0, 1, 0], yaw);
    const pitchMatrix = rotationMatrixFromAxisAngle([1, 0, 0], pitch);

    viewRotation = multiplyMatrices(yawMatrix, viewRotation);
    viewRotation = multiplyMatrices(pitchMatrix, viewRotation);
  }

  render();
}

function endDrag(event) {
  if (dragMode === "none" || event.pointerId !== dragPointerId) {
    return;
  }

  dragMode = "none";
  dragPointerId = null;
  canvas.classList.remove("dragging-sphere", "dragging-view");
  updateOverlayVisibility();
}

function onWheel(event) {
  event.preventDefault();
  updateOverlayVisibility();

  const factor = Math.exp(-event.deltaY * 0.0012);
  zoom = clamp(zoom * factor, minZoom, maxZoom);
  syncInputFromZoom();
  updateLabels();
  render();
}

function onDoubleClick(event) {
  if (isPointOnSphere(event)) {
    resetSphereOrientation();
    updateOverlayVisibility();
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    stage.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function animate(timestamp) {
  if (!lastTime) {
    lastTime = timestamp;
  }

  const dt = Math.min(0.04, (timestamp - lastTime) / 1000);
  lastTime = timestamp;

  if (dt > 0) {
    const fpsCurrent = 1 / dt;
    fpsSmoothed = fpsSmoothed === 0 ? fpsCurrent : fpsSmoothed * 0.9 + fpsCurrent * 0.1;
    fpsVal.textContent = String(Math.round(fpsSmoothed));
  }

  if (counterRotateStars && !paused) {
    const starOmega = scaleVector(sphereAngularVelocity, -starCounterRotateStrength);
    starfieldRotation = applyAngularVelocity(starfieldRotation, starOmega, dt);
  }

  if (!paused && dragMode !== "sphere") {
    const target = getPresetAngularVelocity();
    const difference = subtractVectors(target, sphereAngularVelocity);

    sphereAngularVelocity = addVectors(
      sphereAngularVelocity,
      scaleVector(difference, clamp(autoReturnStrength * dt, 0, 1))
    );

    const damping = Math.exp(-inertiaDamping * dt);
    sphereAngularVelocity = addVectors(
      target,
      scaleVector(subtractVectors(sphereAngularVelocity, target), damping)
    );

    sphereRotation = applyAngularVelocity(sphereRotation, sphereAngularVelocity, dt);
  }

  render();
  requestAnimationFrame(animate);
}

[speedInput, axisXInput, axisYInput, axisZInput].forEach((input) => {
  input.addEventListener("input", () => {
    updateLabels();
    updateOverlayVisibility();
    render();
  });
});

zoomInput.addEventListener("input", () => {
  syncZoomFromInput();
  updateLabels();
  updateOverlayVisibility();
  render();
});

[latCountInput, lonCountInput].forEach((input) => {
  input.addEventListener("input", () => {
    input.value = String(clamp(Number(input.value) || 0, 0, 16));
    updateLabels();
    updateOverlayVisibility();
    render();
  });
});

pauseBtn.addEventListener("click", () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  updateOverlayVisibility();
});

resetSphereBtn.addEventListener("click", () => {
  resetSphereOrientation();
  updateOverlayVisibility();
});

resetBtn.addEventListener("click", () => {
  resetView();
  updateOverlayVisibility();
});

fullscreenBtn.addEventListener("click", () => {
  toggleFullscreen();
  updateOverlayVisibility();
});

showFpsInput.addEventListener("change", () => {
  setFpsVisible(showFpsInput.checked);
  updateOverlayVisibility();
});

showCompassInput.addEventListener("change", () => {
  setCompassVisible(showCompassInput.checked);
  updateOverlayVisibility();
  render();
});

starDensityInput.addEventListener("input", () => {
  buildStars();
  updateLabels();
  updateOverlayVisibility();
  render();
});

showGlowInput.addEventListener("change", () => {
  showGlow = showGlowInput.checked;
  updateOverlayVisibility();
  render();
});

counterRotateStarsInput.addEventListener("change", () => {
  counterRotateStars = counterRotateStarsInput.checked;
  updateOverlayVisibility();
  render();
});

document.addEventListener("fullscreenchange", () => {
  fullscreenBtn.textContent = document.fullscreenElement ? "Exit Fullscreen" : "Fullscreen";
  resizeCanvas();
  render();
});

window.addEventListener("resize", () => {
  resizeCanvas();
  render();
});

window.addEventListener("pointermove", updateOverlayVisibility, { passive: true });
window.addEventListener("keydown", updateOverlayVisibility);
window.addEventListener("wheel", updateOverlayVisibility, { passive: true });

canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);
canvas.addEventListener("pointerleave", endDrag);
canvas.addEventListener("wheel", onWheel, { passive: false });
canvas.addEventListener("dblclick", onDoubleClick);
canvas.addEventListener("contextmenu", (event) => event.preventDefault());

showGlow = showGlowInput.checked;

syncZoomFromInput();
updateLabels();
resizeCanvas();
setCompassVisible(showCompassInput.checked);
resetView();
setUiVisible(true);
updateOverlayVisibility();
setFpsVisible(showFpsInput.checked);
counterRotateStars = counterRotateStarsInput.checked;
requestAnimationFrame(animate);
