/* ══════════════════════════════════════════════════════
   WOLF TERRITORY — Scrollable Animated Website + 3D Game
   ═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   PART 1 · WEBSITE LAYER (the scroll experience)
   ───────────────────────────────────────────── */

// ── Preloader ──
window.addEventListener("load", () => {
    const pre = document.getElementById("preloader");
    if (!pre) return;
    setTimeout(() => {
        pre.classList.add("done");
        setTimeout(() => pre.remove(), 800);
    }, 500);
});
// Safety net — never trap the visitor behind the loader
setTimeout(() => {
    const pre = document.getElementById("preloader");
    if (pre) {
        pre.classList.add("done");
        setTimeout(() => pre.remove(), 800);
    }
}, 4500);

// ── Navbar state, scroll progress & hero parallax ──
const navbar = document.getElementById("navbar");
const progressBar = document.getElementById("scrollProgressBar");
const heroBg = document.getElementById("heroBg");
const heroMoon = document.getElementById("heroMoon");
const heroContent = document.getElementById("heroContent");
const toTopBtn = document.getElementById("toTop");

let scrollTicking = false;
function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

        if (navbar) navbar.classList.toggle("scrolled", y > 40);
        if (progressBar) progressBar.style.width = `${Math.min(100, (y / max) * 100)}%`;

        // Hero parallax — layers move at different speeds
        if (y < window.innerHeight * 1.3) {
            if (heroBg) heroBg.style.transform = `translateY(${y * 0.35}px) scale(1.08)`;
            if (heroMoon) heroMoon.style.transform = `translateY(${y * 0.55}px)`;
            if (heroContent) {
                heroContent.style.transform = `translateY(${y * 0.22}px)`;
                heroContent.style.opacity = Math.max(0, 1 - y / (window.innerHeight * 0.85));
            }
        }
        if (toTopBtn) toTopBtn.classList.toggle("show", y > 650);
        scrollTicking = false;
    });
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (toTopBtn) toTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ── Mobile navigation ──
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");
        navToggle.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            navToggle.classList.remove("open");
        });
    });
}

// ── Footer year ──
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
// ── Scroll reveal animations ──
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale")
    .forEach(el => revealObserver.observe(el));

// Staggered children inside .stagger groups
document.querySelectorAll(".stagger").forEach(group => {
    Array.from(group.children).forEach((child, i) => {
        child.style.transitionDelay = `${i * 0.12}s`;
    });
});

// ── Animated counters ──
const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const duration = 1600;
        const start = performance.now();
        (function step(now) {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(step);
        })(start);
        counterObserver.unobserve(el);
    });
}, { threshold: 0.6 });

document.querySelectorAll("[data-count]").forEach(el => counterObserver.observe(el));

// ── Active nav link while scrolling ──
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        document.querySelectorAll(".nav-link").forEach(link =>
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`)
        );
    });
}, { rootMargin: "-42% 0px -54% 0px" });

document.querySelectorAll("header.hero, section.section, section.stats-strip")
    .forEach(sec => { if (sec.id) sectionObserver.observe(sec); });

// ── Hero firefly particles ──
(function heroParticles() {
    const canvas = document.getElementById("heroParticles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0;
    const parts = [];

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 70; i++) {
        parts.push({
            x: Math.random(), y: Math.random(),
            r: 0.8 + Math.random() * 2.2,
            vx: (Math.random() - 0.5) * 0.0006,
            vy: -0.0004 - Math.random() * 0.0009,
            phase: Math.random() * Math.PI * 2,
            speed: 0.008 + Math.random() * 0.02
        });
    }

    function frame(t) {
        if (window.scrollY < window.innerHeight * 1.1 && W > 0) {
            ctx.clearRect(0, 0, W, H);
            parts.forEach(p => {
                p.x += p.vx + Math.sin(t * 0.001 + p.phase) * 0.0004;
                p.y += p.vy;
                if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
                if (p.x < -0.05) p.x = 1.05;
                if (p.x > 1.05) p.x = -0.05;
                const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(t * p.speed + p.phase));
                ctx.beginPath();
                ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(245, 226, 160, ${0.75 * twinkle})`;
                ctx.shadowBlur = 12;
                ctx.shadowColor = "rgba(245, 215, 150, 0.9)";
                ctx.fill();
                ctx.shadowBlur = 0;
            });
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
})();

/* ─────────────────────────────────────────────
   PART 2 · 3D GAME ENGINE (Three.js)
   ───────────────────────────────────────────── */

// ── Global game state ──
const state = {
    day: 1,
    energy: 100,
    water: 85,
    health: 100,
    territory: 45,
    pack: 7,
    score: 0,
    speed: 0,
    isSprinting: false,
    isMoving: false,
    weatherIndex: 0,
    howlUntil: 0,
    restUntil: 0,
    gatherUntil: 0,
    keys: { w: false, a: false, s: false, d: false, Shift: false },
    joystickVector: { x: 0, y: 0, magnitude: 0 }
};

const WORLD_SIZE = 300;   // terrain plane size
const WORLD_EDGE = 138;   // playable radius

const weatherTypes = [
    { name: "Northern Ridge (Day)", icon: "☀️", sky: 0x87ceeb, fog: 0xcce0ff, light: 0xfffaed, hemi: 0.65 },
    { name: "Misty River Valley", icon: "🌫️", sky: 0xa0b0a0, fog: 0x90a090, light: 0xddeedd, hemi: 0.55 },
    { name: "Amber Sunset Heights", icon: "🌅", sky: 0xd97736, fog: 0xe89b6b, light: 0xffaa55, hemi: 0.45 },
    { name: "Aurora Midnight", icon: "🌌", sky: 0x050e1a, fog: 0x0a1c30, light: 0x88bbee, hemi: 0.3 }
];

const logMessages = [
    "🌲 The wolf pack gathers on the northern ridge.",
    "🦌 Fresh elk tracks observed near the winding river.",
    "🍃 Crisp mountain air energizes the pack.",
    "🌙 A soft howling echoes across the deep pine valley."
];

// ── Small helpers ──
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function lerpAngle(a, b, t) {
    let diff = (b - a) % (Math.PI * 2);
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    return a + diff * t;
}

function riverXAt(z) { return Math.sin(z * 0.02) * 20; }

function getTerrainHeight(x, z) {
    const hill1 = Math.sin(x * 0.03) * Math.cos(z * 0.03) * 4;
    const hill2 = Math.sin(x * 0.08 + z * 0.05) * 1.5;
    const distFromCenter = Math.sqrt(x * x + z * z);
    let mountainBorder = 0;
    if (distFromCenter > 110) {
        mountainBorder = Math.pow((distFromCenter - 110) * 0.35, 1.8);
    }
    return hill1 + hill2 + mountainBorder;
}

// ── Web Audio synth engine ──
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
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
    gain.gain.linearRampToValueAtTime(0.32, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.4);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(now); osc.stop(now + 3.5);
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
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(now); osc.stop(now + 0.5);
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
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(now); osc.stop(now + 0.09);
    }
}

function playBlip(freq, type) {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || "triangle";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.6, now + 0.18);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(now); osc.stop(now + 0.32);
}

function playMarkSound() { playBlip(320, "square"); }
function playRestSound() { playBlip(160, "sine"); }
// ── Three.js engine handles ──
let scene, camera, renderer, clock;
let player = null;
let packWolves = [];
let preyList = [];
let clouds = [];
let dustPool = [];
let flags = [];
let sunLight, hemiLight, riverMesh;
let uiTimer = 0;

function init3D() {
    const container = document.getElementById("game3d");
    if (!container) return;
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 560;

    scene = new THREE.Scene();
    const initialWeather = weatherTypes[0];
    scene.background = new THREE.Color(initialWeather.sky);
    scene.fog = new THREE.FogExp2(initialWeather.fog, 0.007);

    camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 700);
    camera.position.set(0, 10, -18);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    hemiLight = new THREE.HemisphereLight(0xffffff, 0x334433, 0.65);
    scene.add(hemiLight);

    sunLight = new THREE.DirectionalLight(0xfffaed, 0.95);
    sunLight.position.set(60, 100, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 320;
    const d = 110;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    createTerrain();
    createRiver();
    createEnvironment();
    createClouds();
    createDustPool();

    // Player wolf
    player = createWolfModel(0x3e3b36, 0x8a7f72);
    player.group.position.set(0, getTerrainHeight(0, 0), 0);
    scene.add(player.group);

    createPackWolves();
    createWildlife();

    window.addEventListener("resize", onWindowResize);
}

function createTerrain() {
    const geometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 90, 90);
    geometry.rotateX(-Math.PI / 2);

    const posAttr = geometry.attributes.position;
    const colors = [];

    for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        const y = getTerrainHeight(x, z);
        posAttr.setY(i, y);

        const color = new THREE.Color();
        if (y > 22) {
            color.setHex(0xefefef);                        // snow peak
        } else if (y > 10) {
            color.setHex(0x5c4d3c);                        // rock / dirt
        } else if (Math.abs(x - riverXAt(z)) < 12) {
            color.setHex(0x423829);                        // riverbank mud
        } else {
            const greenVar = 0.2 + (Math.sin(x * 0.1) + Math.cos(z * 0.1)) * 0.05;
            color.setRGB(0.18 + greenVar * 0.2, 0.32 + greenVar * 0.4, 0.15);
        }
        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0.1 });
    const terrain = new THREE.Mesh(geometry, material);
    terrain.receiveShadow = true;
    scene.add(terrain);
}

function createRiver() {
    const riverGeo = new THREE.PlaneGeometry(16, WORLD_SIZE, 8, 60);
    riverGeo.rotateX(-Math.PI / 2);

    const pos = riverGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const z = pos.getZ(i);
        const curveX = riverXAt(z);
        pos.setX(i, pos.getX(i) + curveX);
        pos.setY(i, getTerrainHeight(curveX, z) + 0.2);
    }

    const riverMat = new THREE.MeshStandardMaterial({
        color: 0x3a8ebd, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.72
    });
    riverMesh = new THREE.Mesh(riverGeo, riverMat);
    scene.add(riverMesh);
}
function createEnvironment() {
    // Pine trees
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.9 });
    const foliageGeo = new THREE.ConeGeometry(2.5, 6, 6);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1e381b, roughness: 0.9 });

    for (let i = 0; i < 90; i++) {
        const x = (Math.random() - 0.5) * 240;
        const z = (Math.random() - 0.5) * 240;
        if (Math.abs(x - riverXAt(z)) < 14) continue;   // keep the river clear

        const y = getTerrainHeight(x, z);
        const tree = new THREE.Group();

        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.5;
        trunk.castShadow = true;

        const foliage1 = new THREE.Mesh(foliageGeo, foliageMat);
        foliage1.position.y = 4.5;
        foliage1.castShadow = true;

        const foliage2 = new THREE.Mesh(foliageGeo, foliageMat);
        foliage2.position.y = 6.5;
        foliage2.scale.set(0.75, 0.75, 0.75);
        foliage2.castShadow = true;

        tree.add(trunk, foliage1, foliage2);
        tree.position.set(x, y, z);
        const s = 0.8 + Math.random() * 0.6;
        tree.scale.set(s, s, s);
        scene.add(tree);
    }

    // Rocks
    const rockGeo = new THREE.DodecahedronGeometry(1.2, 1);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x6e6e6e, roughness: 0.95 });

    for (let i = 0; i < 45; i++) {
        const x = (Math.random() - 0.5) * 250;
        const z = (Math.random() - 0.5) * 250;
        const y = getTerrainHeight(x, z);

        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(x, y + 0.4, z);
        const r = 0.6 + Math.random() * 1.2;
        rock.scale.set(r, r * (0.6 + Math.random() * 0.4), r);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        rock.castShadow = true;
        scene.add(rock);
    }
}

function createClouds() {
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, roughness: 1 });
    for (let i = 0; i < 8; i++) {
        const cloud = new THREE.Group();
        const puffs = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < puffs; j++) {
            const puff = new THREE.Mesh(new THREE.SphereGeometry(4 + Math.random() * 3, 8, 6), mat);
            puff.position.set(j * 5 - puffs * 2.2, Math.random() * 1.5, Math.random() * 3);
            puff.scale.y = 0.55;
            cloud.add(puff);
        }
        cloud.position.set((Math.random() - 0.5) * 320, 48 + Math.random() * 18, (Math.random() - 0.5) * 320);
        scene.add(cloud);
        clouds.push({ mesh: cloud, speed: 0.8 + Math.random() * 1.2 });
    }
}

function createDustPool() {
    for (let i = 0; i < 36; i++) {
        const mat = new THREE.SpriteMaterial({ color: 0xcbb489, transparent: true, opacity: 0 });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.setScalar(0.8);
        sprite.visible = false;
        scene.add(sprite);
        dustPool.push({ sprite: sprite, life: 0 });
    }
}

function spawnDust(x, y, z) {
    const d = dustPool.find(item => item.life <= 0);
    if (!d) return;
    d.life = 1;
    d.sprite.visible = true;
    d.sprite.position.set(x + (Math.random() - 0.5) * 0.9, y + 0.3, z + (Math.random() - 0.5) * 0.9);
    d.sprite.scale.setScalar(0.5 + Math.random() * 0.5);
}

function updateDust(dt) {
    dustPool.forEach(d => {
        if (d.life <= 0) return;
        d.life -= dt * 1.8;
        d.sprite.position.y += dt * 2.2;
        d.sprite.scale.multiplyScalar(1 + dt * 1.6);
        d.sprite.material.opacity = Math.max(0, d.life * 0.5);
        if (d.life <= 0) d.sprite.visible = false;
    });
}
// ── Procedural wolf model with animated legs, tail and ears ──
function createWolfModel(bodyColor, faceColor, scale) {
    const s = scale || 1;
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.8 });
    const faceMat = new THREE.MeshStandardMaterial({ color: faceColor, roughness: 0.8 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.6 });

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.3, 1.2), bodyMat);
    body.position.y = 1.55;
    body.castShadow = true;
    group.add(body);

    // Chest / shoulders
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.45, 1.35), bodyMat);
    chest.position.set(1.15, 1.6, 0);
    chest.castShadow = true;
    group.add(chest);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 0.7, 8), bodyMat);
    neck.position.set(1.75, 2.05, 0);
    neck.rotation.z = -0.5;
    neck.castShadow = true;
    group.add(neck);

    // Head group (so it can look around)
    const head = new THREE.Group();
    head.position.set(2.35, 2.5, 0);
    head.rotation.y = -0.18;

    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.75, 0.75), bodyMat);
    skull.castShadow = true;
    head.add(skull);

    const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.42, 0.45), faceMat);
    muzzle.position.set(0.78, -0.12, 0);
    muzzle.castShadow = true;
    head.add(muzzle);

    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.22), darkMat);
    nose.position.set(1.24, -0.12, 0);
    head.add(nose);

    // Eyes
    [-0.22, 0.22].forEach(z => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xffc93c, emissive: 0x995500, emissiveIntensity: 0.7 }));
        eye.position.set(0.42, 0.18, z);
        head.add(eye);
    });

    // Ears
    const earGeo = new THREE.ConeGeometry(0.2, 0.5, 4);
    const earL = new THREE.Mesh(earGeo, bodyMat);
    earL.position.set(-0.18, 0.55, -0.24);
    earL.rotation.z = -0.22;
    const earR = new THREE.Mesh(earGeo, bodyMat);
    earR.position.set(-0.18, 0.55, 0.24);
    earR.rotation.z = -0.22;
    head.add(earL, earR);
    group.add(head);

    // Legs — pivots at the hip so they can swing
    const legGeo = new THREE.BoxGeometry(0.32, 1.05, 0.32);
    const legPositions = [
        [0.95, 0.55, -0.44], [0.95, 0.55, 0.44],
        [-0.95, 0.55, -0.44], [-0.95, 0.55, 0.44]
    ];
    const legs = legPositions.map(p => {
        const pivot = new THREE.Group();
        pivot.position.set(p[0], p[1] + 0.5, p[2]);
        const leg = new THREE.Mesh(legGeo, bodyMat);
        leg.position.y = -0.52;
        leg.castShadow = true;
        pivot.add(leg);
        group.add(pivot);
        return pivot;
    });

    // Tail — pivots at the rear
    const tailPivot = new THREE.Group();
    tailPivot.position.set(-1.35, 1.8, 0);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 1.2, 6), bodyMat);
    tail.rotation.z = Math.PI / 2 + 0.4;
    tail.position.set(-0.45, 0.25, 0);
    tail.castShadow = true;
    tailPivot.add(tail);
    group.add(tailPivot);

    // Re-orient the model so the nose points down the group's local +Z axis,
    // which is the forward axis used by the movement, camera and radar math.
    const facing = new THREE.Group();
    facing.rotation.y = -Math.PI / 2;
    group.children.slice().forEach(part => facing.add(part));
    group.add(facing);

    group.scale.setScalar(s);
    group.traverse(obj => { if (obj.isMesh) obj.castShadow = true; });

    return { group: group, head: head, tailPivot: tailPivot, legs: legs, tail: tail };
}
function createPackWolves() {
    const bodyColors = [0x4a4640, 0x35322d, 0x554e45, 0x2b2925, 0x474139, 0x3f3a33];
    const faceColors = [0x9b9083, 0x8a7f72, 0xa89c8b, 0x7d7367, 0x94897b, 0x8f8579];

    for (let i = 0; i < 6; i++) {
        const wolf = createWolfModel(bodyColors[i], faceColors[i], 0.82 + Math.random() * 0.1);
        const angle = (i / 6) * Math.PI * 2;
        const radius = 9 + Math.random() * 7;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        wolf.group.position.set(x, getTerrainHeight(x, z), z);
        wolf.group.rotation.y = Math.atan2(-x, -z);

        scene.add(wolf.group);
        packWolves.push({
            model: wolf,
            home: new THREE.Vector3(x, 0, z),
            target: new THREE.Vector3(x, 0, z),
            wanderTimer: Math.random() * 3,
            gaitTime: Math.random() * 10
        });
    }
}

function createWildlife() {
    const kinds = [
        { name: "deer", color: 0xa9743f, scale: 1, speed: 10, reward: 26 },
        { name: "deer", color: 0x8b5a2b, scale: 0.95, speed: 11, reward: 26 },
        { name: "rabbit", color: 0xb9b2a4, scale: 0.55, speed: 13, reward: 12 }
    ];

    for (let i = 0; i < 14; i++) {
        const kind = kinds[i % kinds.length];
        const angle = Math.random() * Math.PI * 2;
        const radius = 25 + Math.random() * 90;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const group = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: kind.color, roughness: 0.85 });
        const bodyH = kind.name === "deer" ? 1.1 : 0.7;
        const bodyL = kind.name === "deer" ? 2.2 : 1.1;

        const body = new THREE.Mesh(new THREE.BoxGeometry(bodyL, bodyH, bodyH * 0.8), mat);
        body.position.y = bodyH * 0.95;
        body.castShadow = true;
        group.add(body);

        const head = new THREE.Mesh(new THREE.BoxGeometry(bodyH * 0.7, bodyH * 0.7, bodyH * 0.6), mat);
        head.position.set(bodyL * 0.6, bodyH * 1.5, 0);
        head.castShadow = true;
        group.add(head);

        if (kind.name === "deer") {
            const antlerGeo = new THREE.ConeGeometry(0.07, 0.7, 5);
            const antlerMat = new THREE.MeshStandardMaterial({ color: 0x6b5333 });
            [-0.2, 0.2].forEach(zz => {
                const a = new THREE.Mesh(antlerGeo, antlerMat);
                a.position.set(bodyL * 0.6, bodyH * 2.1, zz);
                a.rotation.z = -0.28;
                group.add(a);
            });
        }

        const legGeo = new THREE.BoxGeometry(0.16, bodyH * 0.9, 0.16);
        const legPivots = [];
        [[bodyL * 0.35, 0.3], [bodyL * 0.35, -0.3], [-bodyL * 0.35, 0.3], [-bodyL * 0.35, -0.3]].forEach(p => {
            const pivot = new THREE.Group();
            pivot.position.set(p[0], bodyH * 0.95, p[1]);
            const leg = new THREE.Mesh(legGeo, mat);
            leg.position.y = -bodyH * 0.45;
            pivot.add(leg);
            group.add(pivot);
            legPivots.push(pivot);
        });

        // Nose points along the group's local +Z axis (matches the movement math)
        const facing = new THREE.Group();
        facing.rotation.y = -Math.PI / 2;
        group.children.slice().forEach(part => facing.add(part));
        group.add(facing);

        group.scale.setScalar(kind.scale);
        group.position.set(x, getTerrainHeight(x, z), z);

        scene.add(group);
        preyList.push({
            group: group,
            head: head,
            legs: legPivots,
            kind: kind,
            alive: true,
            respawnTimer: 0,
            home: new THREE.Vector3(x, 0, z),
            target: new THREE.Vector3(x, 0, z),
            wanderTimer: Math.random() * 4,
            gaitTime: Math.random() * 10,
            fleeTime: 0
        });
    }
}
// ── Movement seeking ──
function seekTarget(animal, target, dt, maxSpeed, turnRate) {
    const dx = target.x - animal.group.position.x;
    const dz = target.z - animal.group.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 0.25) return 0;

    const desiredAngle = Math.atan2(dx, dz);
    const current = animal.group.rotation.y;
    animal.group.rotation.y = lerpAngle(current, desiredAngle, Math.min(1, turnRate * dt));

    const step = Math.min(dist, maxSpeed * dt);
    animal.group.position.x += (dx / dist) * step;
    animal.group.position.z += (dz / dist) * step;
    animal.group.position.y = getTerrainHeight(animal.group.position.x, animal.group.position.z);
    return maxSpeed;
}

function animateLegs(model, gaitTime, speedFactor) {
    const swing = 0.75 * speedFactor;
    model.legs.forEach((leg, i) => {
        const phase = gaitTime * 9 + (i === 0 || i === 3 ? 0 : Math.PI);
        leg.rotation.z = Math.sin(phase) * swing;
    });
    model.tailPivot.rotation.y = Math.sin(gaitTime * 3.1) * 0.28;
    model.tailPivot.rotation.z = Math.sin(gaitTime * 2.2) * 0.14 - 0.08;
    // Head pitch (rotation.z tips the muzzle up or down in model space)
    if (model.head) {
        model.head.rotation.z = Math.sin(gaitTime * 5.4) * 0.05 * speedFactor;
    }
}

// ── Player movement ─
function updatePlayer(dt, t) {
    if (!player) return;
    const now = performance.now();

    let moveX = 0;
    let moveZ = 0;
    if (state.keys.w) moveZ += 1;
    if (state.keys.s) moveZ -= 1;
    if (state.keys.a) moveX -= 1;
    if (state.keys.d) moveX += 1;

    if (state.joystickVector.magnitude > 0.06) {
        moveX += state.joystickVector.x;
        moveZ += -state.joystickVector.y;
    }

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    const resting = now < state.restUntil;

    let speed = 0;
    if (len > 0.06 && !resting) {
        moveX /= len;
        moveZ /= len;

        const sprinting = (state.keys.Shift || state.isSprinting) && state.energy > 8;
        const maxSpeed = sprinting ? 22 : 11;
        speed = maxSpeed;

        player.group.position.x += moveX * maxSpeed * dt;
        player.group.position.z += moveZ * maxSpeed * dt;

        const targetAngle = Math.atan2(moveX, moveZ);
        player.group.rotation.y = lerpAngle(player.group.rotation.y, targetAngle, Math.min(1, 8 * dt));

        if (sprinting) {
            state.energy -= 13 * dt;
            if (Math.random() < 0.5) spawnDust(player.group.position.x, player.group.position.y, player.group.position.z);
        } else {
            state.energy -= 3.4 * dt;
        }
        state.water -= 1.7 * dt;
    } else {
        state.energy += 5.5 * dt;
        state.water -= 0.35 * dt;
    }

    // Keep the wolf inside the world
    player.group.position.x = clamp(player.group.position.x, -WORLD_EDGE, WORLD_EDGE);
    player.group.position.z = clamp(player.group.position.z, -WORLD_EDGE, WORLD_EDGE);
    player.group.position.y = getTerrainHeight(player.group.position.x, player.group.position.z);

    state.energy = clamp(state.energy, 0, 100);
    state.water = clamp(state.water, 0, 100);
    state.speed = speed;
    state.isMoving = speed > 0;

    if (state.isMoving) player.gaitTime = (player.gaitTime || 0) + dt;
    const speedFactor = speed > 16 ? 1.35 : (speed > 0 ? 1 : 0);
    animateLegs(player, player.gaitTime || 0, speedFactor + (speed > 0 ? 0.15 : 0));

    // Howling pose + resting pose (rotation.z pitches the muzzle up / down)
    if (now < state.howlUntil) {
        player.head.rotation.z = 0.62 + Math.sin(t * 0.02) * 0.05;
    } else if (resting) {
        player.group.position.y -= 0.35;
        player.head.rotation.z = -0.32;
    } else {
        player.head.rotation.z *= 0.9;
    }
    player.group.rotation.z = resting ? 0.22 : 0;

    // Thirst / exhaustion damage
    if (state.water <= 0) state.health -= 3.5 * dt;
    if (state.energy <= 0 && state.isMoving) state.health -= 2.5 * dt;
    state.health = clamp(state.health, 0, 100);
    if (state.health <= 0) reviveWolf();
}

function reviveWolf() {
    state.health = 60;
    state.energy = 60;
    state.water = 50;
    if (player) player.group.position.set(0, getTerrainHeight(0, 0), 0);
    pushLog("💤 The pack revives you at the den. Stay hydrated, alpha.");
}

// ── Camera follow ──
function updateCamera(dt) {
    if (!player) return;
    const p = player.group.position;
    const offX = -Math.sin(player.group.rotation.y) * 13;
    const offZ = -Math.cos(player.group.rotation.y) * 13;

    const targetX = p.x + offX;
    const targetZ = p.z + offZ;
    const targetY = p.y + 7.5;

    camera.position.x += (targetX - camera.position.x) * Math.min(1, 3.4 * dt);
    camera.position.y += (targetY - camera.position.y) * Math.min(1, 3.4 * dt);
    camera.position.z += (targetZ - camera.position.z) * Math.min(1, 3.4 * dt);

    camera.lookAt(p.x, p.y + 2.4, p.z);

    // Follow light keeps shadows crisp around the player
    sunLight.position.set(p.x + 60, p.y + 100, p.z + 40);
    sunLight.target.position.set(p.x, p.y, p.z);
    sunLight.target.updateMatrixWorld();
}
// ── Pack behaviour: gather when howled, otherwise wander near the alpha ──
function updatePack(dt, t) {
    const now = performance.now();
    const rallying = now < state.howlUntil;
    const gatherPoint = new THREE.Vector3(0, 0, 0);

    packWolves.forEach((wolf, i) => {
        const pos = wolf.model.group.position;
        wolf.wanderTimer -= dt;

        if (rallying) {
            // Ring formation around the alpha
            const angle = (i / packWolves.length) * Math.PI * 2 + t * 0.0004;
            const radius = 3.4 + (i % 3) * 1.1;
            gatherPoint.set(
                player.group.position.x + Math.cos(angle) * radius,
                0,
                player.group.position.z + Math.sin(angle) * radius
            );
            wolf.target.copy(gatherPoint);
        } else if (wolf.wanderTimer <= 0) {
            wolf.wanderTimer = 3.5 + Math.random() * 4;
            const p = player.group.position;
            const angle = Math.random() * Math.PI * 2;
            const radius = 7 + Math.random() * 18;
            wolf.target.set(
                clamp(p.x + Math.cos(angle) * radius, -WORLD_EDGE, WORLD_EDGE),
                0,
                clamp(p.z + Math.sin(angle) * radius, -WORLD_EDGE, WORLD_EDGE)
            );
        }

        const dist = Math.sqrt(
            Math.pow(wolf.target.x - pos.x, 2) + Math.pow(wolf.target.z - pos.z, 2)
        );

        if (dist > 0.4) {
            const maxSpeed = rallying ? 24 : 13;
            const moved = seekTarget(wolf.model, wolf.target, dt, maxSpeed, rallying ? 7 : 3.5);
            wolf.model.group.position.y = getTerrainHeight(pos.x, pos.z);
            wolf.gaitTime += dt;
            animateLegs(wolf.model, wolf.gaitTime, moved > 18 ? 1.3 : 0.85);
            if (rallying && Math.random() < 0.12) {
                spawnDust(pos.x, wolf.model.group.position.y, pos.z);
            }
        } else {
            // Idle: sniff around, tail sway, occasional sit
            animateLegs(wolf.model, (wolf.gaitTime += dt * 0.3), 0.12);
            wolf.model.head.rotation.y = Math.sin(t * 0.0012 + i) * 0.5;
        }
    });
}

// ── Wildlife: wander, graze, flee from the wolf, respawn after a hunt ──
function updatePrey(dt, t) {
    preyList.forEach(prey => {
        if (!prey.alive) {
            prey.respawnTimer -= dt;
            if (prey.respawnTimer <= 0) {
                prey.alive = true;
                prey.group.visible = true;
                const angle = Math.random() * Math.PI * 2;
                const radius = 45 + Math.random() * 80;
                const x = clamp(player.group.position.x + Math.cos(angle) * radius, -WORLD_EDGE, WORLD_EDGE);
                const z = clamp(player.group.position.z + Math.sin(angle) * radius, -WORLD_EDGE, WORLD_EDGE);
                prey.group.position.set(x, getTerrainHeight(x, z), z);
                prey.home.set(x, 0, z);
                prey.target.set(x, 0, z);
            }
            return;
        }

        const pos = prey.group.position;
        const dx = pos.x - player.group.position.x;
        const dz = pos.z - player.group.position.z;
        const distToPlayer = Math.sqrt(dx * dx + dz * dz);
        const panicRadius = prey.kind.name === "deer" ? 17 : 11;

        let speedFactor = 0;

        if (distToPlayer < panicRadius) {
            // Flee directly away from the wolf
            prey.fleeTime = 1.4;
            const fleeX = clamp(pos.x + (dx / (distToPlayer || 1)) * 26, -WORLD_EDGE, WORLD_EDGE);
            const fleeZ = clamp(pos.z + (dz / (distToPlayer || 1)) * 26, -WORLD_EDGE, WORLD_EDGE);
            prey.target.set(fleeX, 0, fleeZ);
            speedFactor = seekTarget(prey, prey.target, dt, prey.kind.speed * 1.9, 8);
        } else {
            if (prey.fleeTime > 0) prey.fleeTime -= dt;

            prey.wanderTimer -= dt;
            if (prey.wanderTimer <= 0) {
                prey.wanderTimer = 4 + Math.random() * 5;
                const angle = Math.random() * Math.PI * 2;
                const radius = 6 + Math.random() * 20;
                prey.target.set(
                    clamp(prey.home.x + Math.cos(angle) * radius, -WORLD_EDGE, WORLD_EDGE),
                    0,
                    clamp(prey.home.z + Math.sin(angle) * radius, -WORLD_EDGE, WORLD_EDGE)
                );
            }
            const d = Math.sqrt(Math.pow(prey.target.x - pos.x, 2) + Math.pow(prey.target.z - pos.z, 2));
            if (d > 0.5) speedFactor = seekTarget(prey, prey.target, dt, prey.kind.speed, 3);
        }

        prey.group.position.y = getTerrainHeight(pos.x, pos.z);
        prey.gaitTime += dt * (speedFactor > 0 ? 1 : 0.4);
        const swing = speedFactor > 0 ? 0.85 : 0.05;
        prey.legs.forEach((leg, i) => {
            leg.rotation.z = Math.sin(prey.gaitTime * 10 + (i % 2 ? Math.PI : 0)) * swing;
        });
        // Grazing: muzzle drops toward the grass when idle
        if (prey.head) {
            prey.head.rotation.z = speedFactor > 0 ? 0 : -0.28 + Math.sin(t * 0.002 + pos.x) * 0.07;
        }
    });
}

// ── Territory flags ──
function plantFlag() {
    if (!player) return;
    const x = player.group.position.x;
    const z = player.group.position.z;
    const y = getTerrainHeight(x, z);

    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 4.4, 6),
        new THREE.MeshStandardMaterial({ color: 0x6b5333 })
    );
    pole.position.set(x, y + 2.2, z);
    pole.castShadow = true;

    const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(1.7, 1.05, 8, 5),
        new THREE.MeshStandardMaterial({ color: 0xf5d796, side: THREE.DoubleSide, roughness: 0.7 })
    );
    cloth.position.set(x + 0.85, y + 3.6, z);

    scene.add(pole, cloth);
    flags.push({ cloth: cloth, phase: Math.random() * 6 });
}
// ── Actions ──
function doHowl() {
    if (!player) return;
    state.howlUntil = performance.now() + 2600;
    state.pack = packWolves.length + 1;   // the alpha plus every companion answering
    state.territory = clamp(state.territory + 1.5, 0, 100);
    state.score += 12;
    playSynthHowl();
    pushLog("🐺 A long howl rolls across the valley — the pack answers and rallies.");
    pulseButton("howlBtn");
}

function doHunt() {
    if (!player) return;
    let nearest = null;
    let nearestDist = Infinity;

    preyList.forEach(prey => {
        if (!prey.alive) return;
        const dx = prey.group.position.x - player.group.position.x;
        const dz = prey.group.position.z - player.group.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < nearestDist) { nearestDist = dist; nearest = prey; }
    });

    if (!nearest || nearestDist > 10) {
        pushLog("🌿 No prey in striking range — close the distance and try again.");
        return;
    }

    nearest.alive = false;
    nearest.group.visible = false;
    nearest.respawnTimer = 22 + Math.random() * 10;

    const reward = nearest.kind.reward;
    state.score += reward;
    state.energy = clamp(state.energy - 12, 0, 100);
    state.health = clamp(state.health + 9, 0, 100);
    state.territory = clamp(state.territory + 3.5, 0, 100);

    playHuntSound();
    spawnDust(nearest.group.position.x, nearest.group.position.y, nearest.group.position.z);
    pushLog(`🥩 Your pack brings down a ${nearest.kind.name}! +${reward} XP · territory grows.`);
    pulseButton("huntBtn");
}

function doDrink() {
    if (!player) return;
    const p = player.group.position;
    const riverDist = Math.abs(p.x - riverXAt(p.z));

    if (riverDist < 12) {
        state.water = clamp(state.water + 34, 0, 100);
        state.energy = clamp(state.energy + 5, 0, 100);
        state.score += 4;
        playDrinkSound();
        pushLog("💧 You lap the cold river water — refreshed and ready to roam.");
    } else {
        state.water = clamp(state.water + 8, 0, 100);
        playDrinkSound();
        pushLog("💧 Only a trickle here. Follow the radar to the river for a real drink.");
    }
    pulseButton("drinkBtn");
}

function doRest() {
    state.restUntil = performance.now() + 3000;
    playRestSound();
    pushLog("⛺ You settle into the grass. Energy returns as the valley drifts by.");
    pulseButton("restBtn");
}

function doMark() {
    if (!player) return;
    state.territory = clamp(state.territory + 6, 0, 100);
    state.score += 15;
    plantFlag();
    playMarkSound();
    pushLog("🚩 Scent mark planted — your territory now stretches further across the ridge.");
    pulseButton("markBtn");
}

function pulseButton(id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.remove("pulse");
    void btn.offsetWidth;
    btn.classList.add("pulse");
}

// ── Weather / day cycle ──
function applyWeather(index) {
    const w = weatherTypes[index % weatherTypes.length];
    state.weatherIndex = index % weatherTypes.length;

    scene.background.setHex(w.sky);
    scene.fog.color.setHex(w.fog);
    hemiLight.intensity = w.hemi;
    sunLight.color.setHex(w.light);
    sunLight.intensity = 0.55 + w.hemi * 0.6;

    const iconEl = document.getElementById("weatherIcon");
    const nameEl = document.getElementById("terrainName");
    if (iconEl) iconEl.textContent = w.icon;
    if (nameEl) nameEl.textContent = w.name;
}

function advanceDay() {
    state.day += 1;
    applyWeather(state.day - 1);
    state.energy = clamp(state.energy + 22, 0, 100);
    state.water = clamp(state.water - 10, 0, 100);
    state.score += 20;
    pushLog(`${weatherTypes[state.weatherIndex].icon} Day ${state.day} dawns — ${weatherTypes[state.weatherIndex].name}.`);
    playBlip(520, "triangle");
}

// ── Log ──
function pushLog(message) {
    const board = document.getElementById("logBoard");
    if (!board) return;

    const item = document.createElement("article");
    item.className = "log-item log-new";
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    item.innerHTML = `<span class="log-time">Day ${String(state.day).padStart(2, "0")} · ${time}</span><p>${message}</p>`;
    board.prepend(item);

    while (board.children.length > 6) board.removeChild(board.lastChild);
}
// ── HUD + minimap ──
function updateHUD() {
    const dayEl = document.getElementById("dayNumber");
    if (dayEl) dayEl.textContent = String(state.day).padStart(2, "0");

    const scoreEl = document.getElementById("scoreNumber");
    if (scoreEl) scoreEl.textContent = state.score;

    const set = (id, val, unit) => {
        const el = document.getElementById(id);
        if (el) el.textContent = `${Math.round(val)}${unit || "%"}`;
    };
    set("energyValue", state.energy);
    set("waterValue", state.water);
    set("healthValue", state.health);
    set("territoryValue", state.territory);

    const bar = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.style.width = `${clamp(val, 0, 100)}%`;
    };
    bar("energyMeter", state.energy);
    bar("waterMeter", state.water);
    bar("healthMeter", state.health);
    bar("territoryMeter", state.territory);

    set("speedHud", state.speed * 3.6 / 3, "");
    const packEl = document.getElementById("packHud");
    if (packEl) packEl.textContent = state.pack;

    let nearby = 0;
    if (player) {
        preyList.forEach(prey => {
            if (!prey.alive) return;
            const dx = prey.group.position.x - player.group.position.x;
            const dz = prey.group.position.z - player.group.position.z;
            if (Math.sqrt(dx * dx + dz * dz) < 40) nearby++;
        });
    }
    const preyEl = document.getElementById("preyHud");
    if (preyEl) preyEl.textContent = nearby;
}

function drawMinimap() {
    const canvas = document.getElementById("minimap");
    if (!canvas || !player) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const range = 130;   // world units shown across the radar

    ctx.clearRect(0, 0, size, size);

    // Grid
    ctx.strokeStyle = "rgba(245, 215, 150, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        const p = (i / 4) * size;
        ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
    }

    const toRadar = (wx, wz) => ({
        x: size / 2 + ((wx - player.group.position.x) / range) * size,
        y: size / 2 + ((wz - player.group.position.z) / range) * size
    });

    // River band
    ctx.strokeStyle = "rgba(100, 181, 246, 0.85)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let wz = player.group.position.z - range; wz <= player.group.position.z + range; wz += 4) {
        const pt = toRadar(riverXAt(wz), wz);
        if (wz === player.group.position.z - range) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // Territory flags
    ctx.fillStyle = "rgba(245, 215, 150, 0.95)";
    flags.forEach(f => {
        const pt = toRadar(f.cloth.position.x, f.cloth.position.z);
        if (pt.x < 0 || pt.x > size || pt.y < 0 || pt.y > size) return;
        ctx.fillRect(pt.x - 2.5, pt.y - 2.5, 5, 5);
    });

    // Pack
    ctx.fillStyle = "rgba(200, 200, 200, 0.85)";
    packWolves.forEach(w => {
        const pt = toRadar(w.model.group.position.x, w.model.group.position.z);
        if (pt.x < 0 || pt.x > size || pt.y < 0 || pt.y > size) return;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 2.4, 0, Math.PI * 2); ctx.fill();
    });

    // Prey
    ctx.fillStyle = "rgba(255, 183, 77, 0.95)";
    preyList.forEach(p => {
        if (!p.alive) return;
        const pt = toRadar(p.group.position.x, p.group.position.z);
        if (pt.x < 0 || pt.x > size || pt.y < 0 || pt.y > size) return;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 2.6, 0, Math.PI * 2); ctx.fill();
    });

    // Player + facing cone
    const c = size / 2;
    ctx.save();
    ctx.translate(c, c);
    ctx.rotate(Math.PI - player.group.rotation.y);
    ctx.fillStyle = "rgba(245, 215, 150, 0.28)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 22, -Math.PI / 2 - 0.6, -Math.PI / 2 + 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#f5d796";
    ctx.beginPath(); ctx.arc(c, c, 4.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(9, 16, 10, 0.9)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

// ── Ambient world animation ──
function updateAmbient(dt, t) {
    clouds.forEach(c => {
        c.mesh.position.x += c.speed * dt;
        if (c.mesh.position.x > 190) c.mesh.position.x = -190;
    });

    flags.forEach(f => {
        const posAttr = f.cloth.geometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            posAttr.setZ(i, Math.sin(t * 0.006 + x * 2.2 + f.phase) * 0.16 * (x + 0.9));
        }
        posAttr.needsUpdate = true;
        f.cloth.geometry.computeVertexNormals();
    });

    if (riverMesh) {
        riverMesh.material.opacity = 0.62 + Math.sin(t * 0.0016) * 0.1;
    }
    updateDust(dt);
}

// ── Main loop ──
function animate() {
    requestAnimationFrame(animate);
    if (!scene || !player) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = performance.now();

    updatePlayer(dt, t);
    updatePack(dt, t);
    updatePrey(dt, t);
    updateCamera(dt);
    updateAmbient(dt, t);

    uiTimer += dt;
    if (uiTimer > 0.12) {
        uiTimer = 0;
        updateHUD();
        drawMinimap();
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById("game3d");
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}
// ─────────────────────────────────────────────
// PART 3 · CONTROLS & BOOT
// ─────────────────────────────────────────────

function bindControls() {
    // Keyboard
    window.addEventListener("keydown", e => {
        const k = e.key;
        const lower = k.toLowerCase();

        if (["w", "a", "s", "d", " "].includes(lower)) e.preventDefault();

        if (lower === "w" || k === "ArrowUp") state.keys.w = true;
        if (lower === "a" || k === "ArrowLeft") state.keys.a = true;
        if (lower === "s" || k === "ArrowDown") state.keys.s = true;
        if (lower === "d" || k === "ArrowRight") state.keys.d = true;
        if (k === "Shift") state.keys.Shift = true;

        if (e.repeat) return;
        if (lower === " ") doHowl();
        if (lower === "e") doHunt();
        if (lower === "f") doDrink();
        if (lower === "r") doRest();
        if (lower === "m") doMark();
    });

    window.addEventListener("keyup", e => {
        const k = e.key;
        const lower = k.toLowerCase();
        if (lower === "w" || k === "ArrowUp") state.keys.w = false;
        if (lower === "a" || k === "ArrowLeft") state.keys.a = false;
        if (lower === "s" || k === "ArrowDown") state.keys.s = false;
        if (lower === "d" || k === "ArrowRight") state.keys.d = false;
        if (k === "Shift") state.keys.Shift = false;
    });

    // Quickbar buttons
    const wire = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", fn);
    };
    wire("howlBtn", doHowl);
    wire("huntBtn", doHunt);
    wire("drinkBtn", doDrink);
    wire("restBtn", doRest);
    wire("markBtn", doMark);
    wire("nextDayBtn", advanceDay);

    // Mouse-drag look-around over the 3D viewport
    const viewport = document.getElementById("viewportContainer");
    if (viewport) {
        let dragging = false;
        let lastX = 0;

        viewport.addEventListener("mousedown", e => {
            if (e.target.closest && e.target.closest(".joystick-wrapper, .action-quickbar, .quick-btn")) return;
            dragging = true;
            lastX = e.clientX;
        });
        window.addEventListener("mouseup", () => { dragging = false; });
        window.addEventListener("mousemove", e => {
            if (!dragging || !player) return;
            const delta = e.clientX - lastX;
            lastX = e.clientX;
            player.group.rotation.y -= delta * 0.006;
        });
    }

    // Unlock audio on the first interaction
    ["click", "keydown", "touchstart"].forEach(evt =>
        window.addEventListener(evt, initAudio, { once: true })
    );
}
// ── Virtual analog joystick (touch + mouse + pen via pointer events) ──
function bindJoystick() {
    const base = document.getElementById("joystickBase");
    const knob = document.getElementById("joystickKnob");
    if (!base || !knob) return;

    const maxRadius = 34;
    let active = false;
    let pointerId = null;

    function updateFromPoint(clientX, clientY) {
        const rect = base.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = clientX - cx;
        let dy = clientY - cy;

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxRadius) {
            dx = (dx / dist) * maxRadius;
            dy = (dy / dist) * maxRadius;
        }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        state.joystickVector.x = dx / maxRadius;
        state.joystickVector.y = dy / maxRadius;
        state.joystickVector.magnitude = Math.min(1, dist / maxRadius);
        state.isSprinting = state.joystickVector.magnitude > 0.88;
    }

    function resetJoystick() {
        active = false;
        pointerId = null;
        knob.style.transform = "translate(0px, 0px)";
        state.joystickVector.x = 0;
        state.joystickVector.y = 0;
        state.joystickVector.magnitude = 0;
        state.isSprinting = false;
    }

    function start(e) {
        active = true;
        pointerId = e.pointerId !== undefined ? e.pointerId : null;
        if (pointerId !== null && base.setPointerCapture) {
            try { base.setPointerCapture(pointerId); } catch (err) { /* not supported */ }
        }
        updateFromPoint(e.clientX, e.clientY);
    }

    function move(e) {
        if (!active || (pointerId !== null && e.pointerId !== undefined && e.pointerId !== pointerId)) return;
        if (e.preventDefault) e.preventDefault();
        updateFromPoint(e.clientX, e.clientY);
    }

    base.addEventListener("pointerdown", start);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", resetJoystick);
    window.addEventListener("pointercancel", resetJoystick);

    // Touch fallbacks for browsers without pointer events
    base.addEventListener("touchstart", e => {
        if (e.touches[0]) start({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY, pointerId: undefined });
        e.preventDefault();
    }, { passive: false });
    base.addEventListener("touchmove", e => {
        if (e.touches[0]) updateFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
    }, { passive: false });
    base.addEventListener("touchend", resetJoystick);
    base.addEventListener("touchcancel", resetJoystick);
}

// ─ Boot ──
function boot() {
    if (typeof THREE === "undefined") {
        const container = document.getElementById("game3d");
        if (container) {
            container.innerHTML =
                '<div style="display:flex;height:100%;align-items:center;justify-content:center;' +
                'color:#f5d796;font-family:Inter,sans-serif;font-weight:700;text-align:center;padding:30px">' +
                "⚠️ The 3D engine could not load.<br>Connect to the internet and refresh to enter the wild." +
                "</div>";
        }
        return;
    }

    init3D();
    scene.add(sunLight.target);   // shadows follow the alpha
    applyWeather(0);
    bindControls();
    bindJoystick();
    updateHUD();
    drawMinimap();
    animate();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}