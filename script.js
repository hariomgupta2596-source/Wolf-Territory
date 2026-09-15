// ----------------------------------------------------
// Wolf Simulation Game Engine - 3D Open World & Joystick
// ----------------------------------------------------

// Global Game State
const state = {
  day: 1,
  energy: 100,
  water: 85,
  health: 100,
  hunger: 20,
  territory: 45,
  pack: 7,
  score: 0,
  speed: 0,
  isSprinting: false,
  weatherIndex: 0,
  wolfPos: { x: 0, y: 0, z: 0 },
  wolfRotation: 0,
  joystickVector: { x: 0, y: 0, magnitude: 0 },
  keys: { w: false, a: false, s: false, d: false, Shift: false }
};

const weatherTypes = [
  { name: "Northern Ridge (Day)", icon: "☀️", sky: 0x87ceeb, fog: 0xcce0ff, light: 0xffffff },
  { name: "Misty River Valley", icon: "🌫️", sky: 0xa0b0a0, fog: 0x90a090, light: 0xddeedd },
  { name: "Amber Sunset Heights", icon: "🌅", sky: 0xd97736, fog: 0xe89b6b, light: 0xffaa55 },
  { name: "Aurora Midnight", icon: "🌌", sky: 0x050e1a, fog: 0x091c30, light: 0x4488aa }
];

const logMessages = [
  "The wolf pack gathers on the northern ridge.",
  "Fresh elk tracks observed near the winding river.",
  "Crisp mountain air energizes the pack.",
  "A soft howling echoes across the deep pine valley."
];

// Audio Synthesizer Engine (Web Audio API)
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playSynthHowl() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.8);
  osc.frequency.exponentialRampToValueAtTime(380, now + 2.0);
  osc.frequency.exponentialRampToValueAtTime(180, now + 3.2);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.6);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 3.4);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 3.5);
}

function playHuntSound() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.5);
}

function playDrinkSound() {
  initAudio();
  if (!audioCtx) return;

  for (let i = 0; i < 3; i++) {
    const now = audioCtx.currentTime + i * 0.12;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600 + i * 80, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }
}

// Three.js 3D Engine Variables
let scene, camera, renderer;
let wolfGroup, wolfLegs = [], wolfTail;
let packWolves = [];
let preyList = [];
let terrainMesh, riverMesh;
let sunLight, hemiLight;

function getTerrainHeight(x, z) {
  const hill1 = Math.sin(x * 0.03) * Math.cos(z * 0.03) * 4;
  const hill2 = Math.sin(x * 0.08 + z * 0.05) * 1.5;
  // Mountains at border
  const distFromCenter = Math.sqrt(x * x + z * z);
  let mountainBorder = 0;
  if (distFromCenter > 110) {
    mountainBorder = Math.pow((distFromCenter - 110) * 0.35, 1.8);
  }
  return hill1 + hill2 + mountainBorder;
}

function init3D() {
  const container = document.getElementById("game3d");
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 500;

  // Scene
  scene = new THREE.Scene();
  const initialWeather = weatherTypes[0];
  scene.background = new THREE.Color(initialWeather.sky);
  scene.fog = new THREE.FogExp2(initialWeather.fog, 0.007);

  // Camera
  camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 600);
  camera.position.set(0, 12, 22);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lighting
  hemiLight = new THREE.HemisphereLight(0xffffff, 0x334433, 0.6);
  scene.add(hemiLight);

  sunLight = new THREE.DirectionalLight(0xfffaed, 0.9);
  sunLight.position.set(60, 100, 40);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 300;
  const d = 100;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  scene.add(sunLight);

  // Terrain
  createTerrain();

  // River
  createRiver();

  // Environment Objects (Trees & Rocks)
  createEnvironment();

  // Create Player Wolf 3D Model
  wolfGroup = createWolfModel(0x3e3b36, 0x8a7f72);
  scene.add(wolfGroup);

  // Create Pack Companions
  createPackWolves();

  // Create Prey (Deer & Rabbits)
  createWildlife();

  window.addEventListener("resize", onWindowResize);
}

function createTerrain() {
  const size = 300;
  const segments = 90;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const posAttr = geometry.attributes.position;
  const colors = [];

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const y = getTerrainHeight(x, z);
    posAttr.setY(i, y);

    // Color vertices based on height and position
    let color = new THREE.Color();
    if (y > 22) {
      color.setHex(0xefefef); // Snow mountain peak
    } else if (y > 10) {
      color.setHex(0x5c4d3c); // Rock/dirt
    } else if (Math.abs(x - (Math.sin(z * 0.02) * 20)) < 12) {
      color.setHex(0x423829); // Riverbank mud
    } else {
      // Grass green variation
      const greenVar = 0.2 + (Math.sin(x * 0.1) + Math.cos(z * 0.1)) * 0.05;
      color.setRGB(0.18 + greenVar * 0.2, 0.32 + greenVar * 0.4, 0.15);
    }
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.1
  });

  terrainMesh = new THREE.Mesh(geometry, material);
  terrainMesh.receiveShadow = true;
  scene.add(terrainMesh);
}

function createRiver() {
  const shape = new THREE.Shape();
  const riverWidth = 14;

  const points = [];
  for (let z = -150; z <= 150; z += 5) {
    const x = Math.sin(z * 0.02) * 20;
    points.push(new THREE.Vector3(x, getTerrainHeight(x, z) + 0.4, z));
  }

  const riverGeo = new THREE.PlaneGeometry(16, 300, 8, 60);
  riverGeo.rotateX(-Math.PI / 2);

  const pos = riverGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    const curveX = Math.sin(z * 0.02) * 20;
    pos.setX(i, pos.getX(i) + curveX);
    pos.setY(i, getTerrainHeight(curveX, z) + 0.2);
  }

  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x3a8ebd,
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.75
  });

  riverMesh = new THREE.Mesh(riverGeo, riverMat);
  scene.add(riverMesh);
}

function createEnvironment() {
  // Trees
  const treeTrunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 6);
  const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3d271d });

  const treeFoliageGeo = new THREE.ConeGeometry(2.5, 6, 6);
  const treeFoliageMat = new THREE.MeshStandardMaterial({ color: 0x1e381b, roughness: 0.9 });

  for (let i = 0; i < 90; i++) {
    const x = (Math.random() - 0.5) * 240;
    const z = (Math.random() - 0.5) * 240;
    const riverX = Math.sin(z * 0.02) * 20;

    // Avoid planting in middle of river
    if (Math.abs(x - riverX) < 14) continue;

    const y = getTerrainHeight(x, z);

    const treeGroup = new THREE.Group();
    const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
    trunk.position.y = 1.5;
    trunk.castShadow = true;

    const foliage1 = new THREE.Mesh(treeFoliageGeo, treeFoliageMat);
    foliage1.position.y = 4.5;
    foliage1.castShadow = true;

    const foliage2 = new THREE.Mesh(treeFoliageGeo, treeFoliageMat);
    foliage2.position.y = 6.5;
    foliage2.scale.set(0.75, 0.75, 0.75);
    foliage2.castShadow = true;

    treeGroup.add(trunk, foliage1, foliage2);
    treeGroup.position.set(x, y, z);
    const scale = 0.8 + Math.random() * 0.6;
    treeGroup.scale.set(scale, scale, scale);
    scene.add(treeGroup);
  }

  // Rocks
  const rockGeo = new THREE.DodecahedronGeometry(1.2, 1);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x6e6e6e, roughness: 0.9 });

  for (let i = 0; i < 45; i++) {
    const x = (Math.random() - 0.5) * 250;
    const z = (Math.random() - 0.5) * 250;
    const y = getTerrainHeight(x, z);

    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(x, y + 0.4, z);
    const rScale = 0.6 + Math.random() * 1.2;
    rock.scale.set(rScale, rScale * (0.6 + Math.random() * 0.4), rScale);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.castShadow = true;
    scene.add(rock);
  }
}

function createWolfModel(bodyColorHex, furColorHex) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColorHex, roughness: 0.7 });
  const furMat = new THREE.MeshStandardMaterial({ color: furColorHex, roughness: 0.8 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

  // Body Torso
  const torsoGeo = new THREE.BoxGeometry(1.4, 1.4, 2.8);
  const torso = new THREE.Mesh(torsoGeo, bodyMat);
  torso.position.y = 1.8;
  torso.castShadow = true;
  group.add(torso);

  // Chest Fur
  const chestGeo = new THREE.BoxGeometry(1.45, 1.3, 1.2);
  const chest = new THREE.Mesh(chestGeo, furMat);
  chest.position.set(0, 1.9, -0.8);
  chest.castShadow = true;
  group.add(chest);

  // Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.6, -1.4);

  const headGeo = new THREE.BoxGeometry(1.1, 1.0, 1.2);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.castShadow = true;

  const snoutGeo = new THREE.BoxGeometry(0.6, 0.5, 0.9);
  const snout = new THREE.Mesh(snoutGeo, furMat);
  snout.position.set(0, -0.2, -0.8);

  const noseGeo = new THREE.BoxGeometry(0.3, 0.25, 0.2);
  const noseMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.position.set(0, -0.1, -1.26);

  // Ears
  const earGeo = new THREE.ConeGeometry(0.3, 0.6, 4);
  const earL = new THREE.Mesh(earGeo, bodyMat);
  earL.position.set(0.35, 0.7, -0.1);
  const earR = earL.clone();
  earR.position.x = -0.35;

  // Eyes
  const eyeGeo = new THREE.BoxGeometry(0.12, 0.12, 0.1);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(0.4, 0.2, -0.55);
  const eyeR = eyeL.clone();
  eyeR.position.x = -0.4;

  headGroup.add(head, snout, nose, earL, earR, eyeL, eyeR);
  group.add(headGroup);

  // Legs (FL, FR, BL, BR)
  const legGeo = new THREE.BoxGeometry(0.45, 1.6, 0.45);

  const legPositions = [
    { x: 0.55, y: 0.8, z: -1.0 },  // Front Left
    { x: -0.55, y: 0.8, z: -1.0 }, // Front Right
    { x: 0.55, y: 0.8, z: 1.0 },   // Back Left
    { x: -0.55, y: 0.8, z: 1.0 }   // Back Right
  ];

  const legsArr = [];
  legPositions.forEach(p => {
    const legPivot = new THREE.Group();
    legPivot.position.set(p.x, p.y + 0.8, p.z);
    const legMesh = new THREE.Mesh(legGeo, furMat);
    legMesh.position.y = -0.8;
    legMesh.castShadow = true;
    legPivot.add(legMesh);
    group.add(legPivot);
    legsArr.push(legPivot);
  });

  if (group === wolfGroup || !wolfLegs.length) {
    wolfLegs = legsArr;
  }

  // Tail
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 2.2, 1.4);
  const tailGeo = new THREE.CylinderGeometry(0.2, 0.35, 1.6, 6);
  const tail = new THREE.Mesh(tailGeo, furMat);
  tail.position.set(0, -0.7, 0.3);
  tail.rotation.x = 0.4;
  tail.castShadow = true;
  tailGroup.add(tail);
  group.add(tailGroup);

  if (group === wolfGroup || !wolfTail) {
    wolfTail = tailGroup;
  }

  group.scale.set(1.2, 1.2, 1.2);
  return group;
}

function createPackWolves() {
  for (let i = 0; i < 4; i++) {
    const packWolf = createWolfModel(0x524b43, 0x9c9183);
    const angle = (i / 4) * Math.PI * 2;
    const offsetDist = 5 + Math.random() * 4;
    packWolf.position.set(Math.sin(angle) * offsetDist, 0, Math.cos(angle) * offsetDist);
    scene.add(packWolf);
    packWolves.push({
      mesh: packWolf,
      offset: { x: (Math.random() - 0.5) * 8, z: 3 + i * 2.5 }
    });
  }
}

function createWildlife() {
  // Deer (6)
  const deerBodyGeo = new THREE.BoxGeometry(1.2, 1.3, 2.2);
  const deerMat = new THREE.MeshStandardMaterial({ color: 0x9e6038, roughness: 0.8 });

  for (let i = 0; i < 6; i++) {
    const deerGroup = new THREE.Group();
    const body = new THREE.Mesh(deerBodyGeo, deerMat);
    body.position.y = 1.8;
    body.castShadow = true;

    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 0.7), deerMat);
    neck.position.set(0, 2.6, -0.9);
    neck.rotation.x = -0.3;

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 1.0), deerMat);
    head.position.set(0, 3.2, -1.3);

    deerGroup.add(body, neck, head);

    const x = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;
    deerGroup.position.set(x, getTerrainHeight(x, z), z);

    scene.add(deerGroup);
    preyList.push({ type: "Deer", mesh: deerGroup, speed: 0.12, alive: true });
  }

  // Rabbits (8)
  const rabbitGeo = new THREE.SphereGeometry(0.6, 8, 8);
  const rabbitMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });

  for (let i = 0; i < 8; i++) {
    const rabbit = new THREE.Mesh(rabbitGeo, rabbitMat);
    const x = (Math.random() - 0.5) * 220;
    const z = (Math.random() - 0.5) * 220;
    rabbit.position.set(x, getTerrainHeight(x, z) + 0.5, z);
    rabbit.castShadow = true;
    scene.add(rabbit);
    preyList.push({ type: "Rabbit", mesh: rabbit, speed: 0.16, alive: true });
  }
}

function onWindowResize() {
  const container = document.getElementById("game3d");
  if (!container || !renderer || !camera) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// Analog Joystick Logic
function initJoystick() {
  const base = document.getElementById("joystickBase");
  const knob = document.getElementById("joystickKnob");
  if (!base || !knob) return;

  let isDragging = false;
  let baseRect = null;
  const maxRadius = 40;

  function handleStart(e) {
    initAudio();
    isDragging = true;
    baseRect = base.getBoundingClientRect();
    handleMove(e);
  }

  function handleMove(e) {
    if (!isDragging || !baseRect) return;

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const centerX = baseRect.left + baseRect.width / 2;
    const centerY = baseRect.top + baseRect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    const clampedDist = Math.min(dist, maxRadius);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    knob.style.transform = `translate(${knobX}px, ${knobY}px)`;

    state.joystickVector.x = knobX / maxRadius;
    state.joystickVector.y = knobY / maxRadius;
    state.joystickVector.magnitude = clampedDist / maxRadius;
  }

  function handleEnd() {
    isDragging = false;
    knob.style.transform = `translate(0px, 0px)`;
    state.joystickVector.x = 0;
    state.joystickVector.y = 0;
    state.joystickVector.magnitude = 0;
  }

  base.addEventListener("mousedown", handleStart);
  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleEnd);

  base.addEventListener("touchstart", handleStart, { passive: true });
  window.addEventListener("touchmove", handleMove, { passive: true });
  window.addEventListener("touchend", handleEnd);
}

// Keyboard Input Binding
function initKeyboard() {
  window.addEventListener("keydown", e => {
    initAudio();
    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") state.keys.w = true;
    if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") state.keys.s = true;
    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") state.keys.a = true;
    if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") state.keys.d = true;
    if (e.key === "Shift") state.keys.Shift = true;

    if (e.code === "Space") howlAction();
    if (e.key === "e" || e.key === "E") huntAction();
    if (e.key === "f" || e.key === "F") drinkAction();
    if (e.key === "r" || e.key === "R") restAction();
    if (e.key === "m" || e.key === "M") markAction();
  });

  window.addEventListener("keyup", e => {
    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") state.keys.w = false;
    if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") state.keys.s = false;
    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") state.keys.a = false;
    if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") state.keys.d = false;
    if (e.key === "Shift") state.keys.Shift = false;
  });
}

// Game Actions
function howlAction() {
  playSynthHowl();
  state.score += 25;
  state.territory = Math.min(100, state.territory + 3);
  addLog("🐺 <strong>Howl!</strong> Pack voices echo across the ridge.");
  updateUI();
}

function huntAction() {
  playHuntSound();
  let caught = false;

  for (let prey of preyList) {
    if (!prey.alive) continue;
    const dist = wolfGroup.position.distanceTo(prey.mesh.position);
    if (dist < 14) {
      prey.alive = false;
      prey.mesh.visible = false;
      caught = true;
      addLog(`🥩 <strong>Successful Hunt!</strong> Pack caught a ${prey.type}.`);
      state.hunger = Math.max(0, state.hunger - 30);
      state.energy = Math.min(100, state.energy + 20);
      state.score += 60;
      break;
    }
  }

  if (!caught) {
    state.energy = Math.max(0, state.energy - 6);
    addLog("🥩 <strong>Pounce!</strong> Prey escaped into the thick foliage.");
  }
  updateUI();
}

function drinkAction() {
  const riverX = Math.sin(wolfGroup.position.z * 0.02) * 20;
  const distToRiver = Math.abs(wolfGroup.position.x - riverX);

  if (distToRiver < 18) {
    playDrinkSound();
    state.water = Math.min(100, state.water + 35);
    state.energy = Math.min(100, state.energy + 10);
    state.score += 15;
    addLog("💧 <strong>Water Restored!</strong> Drank from the clear mountain river.");
  } else {
    addLog("💧 River is too far! Follow the radar blue markers to find water.");
  }
  updateUI();
}

function restAction() {
  state.energy = Math.min(100, state.energy + 30);
  state.health = Math.min(100, state.health + 15);
  state.hunger = Math.min(100, state.hunger + 8);
  state.score += 10;
  addLog("⛺ <strong>Resting...</strong> The wolf pack recovers energy in den shadow.");
  updateUI();
}

function markAction() {
  state.territory = Math.min(100, state.territory + 8);
  state.score += 20;
  addLog("🚩 <strong>Territory Marked!</strong> Pack scent boundary expanded.");
  updateUI();
}

function advanceDay() {
  state.day += 1;
  state.weatherIndex = (state.weatherIndex + 1) % weatherTypes.length;
  const weather = weatherTypes[state.weatherIndex];

  // Update 3D Lighting & Fog
  if (scene) {
    scene.background.setHex(weather.sky);
    scene.fog.color.setHex(weather.fog);
    sunLight.color.setHex(weather.light);
  }

  document.getElementById("weatherIcon").textContent = weather.icon;
  document.getElementById("terrainName").textContent = weather.name;

  state.energy = Math.max(10, state.energy - 15);
  state.water = Math.max(10, state.water - 20);
  state.hunger = Math.min(100, state.hunger + 15);

  // Respawn prey
  preyList.forEach(prey => {
    prey.alive = true;
    prey.mesh.visible = true;
    const x = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;
    prey.mesh.position.set(x, getTerrainHeight(x, z), z);
  });

  addLog(`☀️ <strong>Day ${state.day} Dawn:</strong> Environment changed to ${weather.name}.`);
  updateUI();
}

// Minimap Radar Render Loop
function updateMinimap() {
  const canvas = document.getElementById("minimap");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const scale = 0.4;

  ctx.clearRect(0, 0, w, h);

  // Center radar on Wolf position
  const cx = w / 2;
  const cy = h / 2;

  // River line
  ctx.strokeStyle = "#4fc3f7";
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let rz = -80; rz <= 80; rz += 10) {
    const rx = Math.sin((state.wolfPos.z + rz) * 0.02) * 20;
    const mapX = cx + (rx - state.wolfPos.x) * scale;
    const mapY = cy + (rz) * scale;
    if (rz === -80) ctx.moveTo(mapX, mapY);
    else ctx.lineTo(mapX, mapY);
  }
  ctx.stroke();

  // Pack members
  ctx.fillStyle = "#aed581";
  packWolves.forEach(pw => {
    const mx = cx + (pw.mesh.position.x - state.wolfPos.x) * scale;
    const my = cy + (pw.mesh.position.z - state.wolfPos.z) * scale;
    ctx.beginPath();
    ctx.arc(mx, my, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Prey
  ctx.fillStyle = "#ff8a65";
  let preyNearbyCount = 0;
  preyList.forEach(p => {
    if (!p.alive) return;
    const dist = wolfGroup.position.distanceTo(p.mesh.position);
    if (dist < 35) preyNearbyCount++;

    const mx = cx + (p.mesh.position.x - state.wolfPos.x) * scale;
    const my = cy + (p.mesh.position.z - state.wolfPos.z) * scale;
    if (mx >= 0 && mx <= w && my >= 0 && my <= h) {
      ctx.beginPath();
      ctx.arc(mx, my, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  document.getElementById("preyHud").textContent = preyNearbyCount;

  // Player Wolf Dot (Yellow)
  ctx.fillStyle = "#ffe082";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Direction pointer line
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(
    cx + Math.sin(state.wolfRotation) * 10,
    cy - Math.cos(state.wolfRotation) * 10
  );
  ctx.strokeStyle = "#ffe082";
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Main Game Animation Loop
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // Calculate Movement Vector from Joystick & Keys
  let moveX = state.joystickVector.x;
  let moveZ = state.joystickVector.y;

  if (state.keys.a) moveX -= 1;
  if (state.keys.d) moveX += 1;
  if (state.keys.w) moveZ -= 1;
  if (state.keys.s) moveZ += 1;

  // Normalize
  const moveLen = Math.sqrt(moveX * moveX + moveZ * moveZ);
  let currentSpeed = 0;

  if (moveLen > 0.05) {
    const dirX = moveX / moveLen;
    const dirZ = moveZ / moveLen;

    const baseSpeed = state.keys.Shift ? 0.35 : 0.18;
    currentSpeed = baseSpeed * Math.min(1.2, moveLen);

    // Rotation angle towards movement direction
    const targetAngle = Math.atan2(dirX, dirZ);

    // Lerp rotation smoothly
    let diff = targetAngle - wolfGroup.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    wolfGroup.rotation.y += diff * 0.15;

    // Advance position
    wolfGroup.position.x += Math.sin(wolfGroup.rotation.y) * currentSpeed * 60 * delta;
    wolfGroup.position.z += Math.cos(wolfGroup.rotation.y) * currentSpeed * 60 * delta;

    // Clamp inside terrain bounds
    wolfGroup.position.x = Math.max(-130, Math.min(130, wolfGroup.position.x));
    wolfGroup.position.z = Math.max(-130, Math.min(130, wolfGroup.position.z));

    // Leg walking animation
    if (wolfLegs.length >= 4) {
      const stride = Math.sin(time * (state.keys.Shift ? 18 : 12)) * 0.5;
      wolfLegs[0].rotation.x = stride;
      wolfLegs[1].rotation.x = -stride;
      wolfLegs[2].rotation.x = -stride;
      wolfLegs[3].rotation.x = stride;
    }
  } else {
    // Idle legs
    if (wolfLegs.length >= 4) {
      wolfLegs.forEach(l => (l.rotation.x *= 0.8));
    }
  }

  // Tail wagging
  if (wolfTail) {
    wolfTail.rotation.y = Math.sin(time * 3) * 0.25;
  }

  // Set Wolf Y position according to terrain height
  wolfGroup.position.y = getTerrainHeight(wolfGroup.position.x, wolfGroup.position.z);

  // Sync state
  state.wolfPos.x = wolfGroup.position.x;
  state.wolfPos.y = wolfGroup.position.y;
  state.wolfPos.z = wolfGroup.position.z;
  state.wolfRotation = wolfGroup.rotation.y;
  state.speed = (currentSpeed * 70).toFixed(1);
  document.getElementById("speedHud").textContent = state.speed;

  // Smooth Camera Follow
  const camDist = 18;
  const camHeight = 11;
  const targetCamX = wolfGroup.position.x - Math.sin(wolfGroup.rotation.y) * camDist;
  const targetCamZ = wolfGroup.position.z - Math.cos(wolfGroup.rotation.y) * camDist;
  const targetCamY = wolfGroup.position.y + camHeight;

  camera.position.x += (targetCamX - camera.position.x) * 0.08;
  camera.position.y += (targetCamY - camera.position.y) * 0.08;
  camera.position.z += (targetCamZ - camera.position.z) * 0.08;
  camera.lookAt(wolfGroup.position.x, wolfGroup.position.y + 2.5, wolfGroup.position.z);

  // Pack Companions AI (Follow Player Wolf)
  packWolves.forEach((pw, idx) => {
    const followAngle = wolfGroup.rotation.y + Math.PI + (idx - 1.5) * 0.5;
    const targetX = wolfGroup.position.x + Math.sin(followAngle) * (6 + idx * 2);
    const targetZ = wolfGroup.position.z + Math.cos(followAngle) * (6 + idx * 2);

    pw.mesh.position.x += (targetX - pw.mesh.position.x) * 0.05;
    pw.mesh.position.z += (targetZ - pw.mesh.position.z) * 0.05;
    pw.mesh.position.y = getTerrainHeight(pw.mesh.position.x, pw.mesh.position.z);
    pw.mesh.rotation.y = wolfGroup.rotation.y;
  });

  // Wildlife AI (Deer & Rabbits Roaming & Fleeing)
  preyList.forEach(prey => {
    if (!prey.alive) return;
    const distToWolf = prey.mesh.position.distanceTo(wolfGroup.position);

    if (distToWolf < 22) {
      // Flee away from wolf
      const fleeX = prey.mesh.position.x - wolfGroup.position.x;
      const fleeZ = prey.mesh.position.z - wolfGroup.position.z;
      const fleeLen = Math.sqrt(fleeX * fleeX + fleeZ * fleeZ) || 1;
      prey.mesh.position.x += (fleeX / fleeLen) * prey.speed * 1.8;
      prey.mesh.position.z += (fleeZ / fleeLen) * prey.speed * 1.8;
    } else {
      // Random wander
      prey.mesh.position.x += (Math.sin(time + prey.mesh.id) * 0.2) * prey.speed;
      prey.mesh.position.z += (Math.cos(time + prey.mesh.id) * 0.2) * prey.speed;
    }

    prey.mesh.position.y = getTerrainHeight(prey.mesh.position.x, prey.mesh.position.z) + (prey.type === "Rabbit" ? 0.4 : 0);
  });

  // Render 3D Scene
  renderer.render(scene, camera);

  // Render Minimap Radar
  updateMinimap();
}

function updateUI() {
  document.getElementById("dayNumber").textContent = String(state.day).padStart(2, "0");
  document.getElementById("scoreNumber").textContent = state.score;
  document.getElementById("energyValue").textContent = `${state.energy}%`;
  document.getElementById("waterValue").textContent = `${state.water}%`;
  document.getElementById("healthValue").textContent = `${state.health}%`;
  document.getElementById("territoryValue").textContent = `${state.territory}%`;
  document.getElementById("packHud").textContent = state.pack;

  document.getElementById("energyMeter").style.width = `${state.energy}%`;
  document.getElementById("waterMeter").style.width = `${state.water}%`;
  document.getElementById("healthMeter").style.width = `${state.health}%`;
  document.getElementById("territoryMeter").style.width = `${state.territory}%`;
}

function addLog(text) {
  const log = document.getElementById("eventLog");
  if (!log) return;
  const item = document.createElement("li");
  item.innerHTML = text;
  log.insertBefore(item, log.firstChild);

  while (log.children.length > 6) {
    log.removeChild(log.lastChild);
  }
}

function seedLogs() {
  for (let i = 0; i < logMessages.length; i++) {
    addLog(logMessages[i]);
  }
}

function bindEvents() {
  document.getElementById("howlBtn").addEventListener("click", howlAction);
  document.getElementById("huntBtn").addEventListener("click", huntAction);
  document.getElementById("drinkBtn").addEventListener("click", drinkAction);
  document.getElementById("restBtn").addEventListener("click", restAction);
  document.getElementById("markBtn").addEventListener("click", markAction);
  document.getElementById("nextDayBtn").addEventListener("click", advanceDay);
}

function initGame() {
  init3D();
  initJoystick();
  initKeyboard();
  bindEvents();
  seedLogs();
  updateUI();
  animate();
}

document.addEventListener("DOMContentLoaded", initGame);
