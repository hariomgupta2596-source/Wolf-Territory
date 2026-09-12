const state = {
  day: 1,
  energy: 84,
  water: 62,
  health: 80,
  hunger: 32,
  territory: 48,
  pack: 7,
  score: 0,
  x: 50,
  y: 54,
  world: {
    terrain: "Northern Ridge"
  }
};

const terrainNames = [
  "Northern Ridge",
  "River Bend",
  "Heather Range",
  "Foxglove Valley",
  "Deep Pine Line"
];

const logMessages = [
  "The wolf pack crosses the northern ridge.",
  "Fresh tracks appear near the river.",
  "A snow dusting covers the old spruce line.",
  "The forest valley begins to stir at dawn."
];

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateUI() {
  document.getElementById("dayNumber").textContent = String(state.day).padStart(2, "0");
  document.getElementById("scoreNumber").textContent = state.score;
  document.getElementById("energyValue").textContent = `${state.energy}%`;
  document.getElementById("hungerValue").textContent = `${state.hunger}%`;
  document.getElementById("healthValue").textContent = `${state.health}%`;
  document.getElementById("waterValue").textContent = `${state.water}%`;
  document.getElementById("territoryValue").textContent = `${state.territory}%`;
  document.getElementById("packValue").textContent = state.pack;

  document.getElementById("energyMeter").style.width = `${state.energy}%`;
  document.getElementById("waterMeter").style.width = `${state.water}%`;
  document.getElementById("healthMeter").style.width = `${state.health}%`;
  document.getElementById("territoryMeter").style.width = `${state.territory}%`;

  const terrain = terrainNames[state.day % terrainNames.length];
  document.getElementById("terrainName").textContent = terrain;
  document.getElementById("wolfMarker").style.left = `${state.x}%`;
  document.getElementById("wolfMarker").style.top = `${state.y}%`;
}

function addLog(text) {
  const log = document.getElementById("eventLog");
  const item = document.createElement("li");
  item.textContent = text;
  log.insertBefore(item, log.firstChild);

  while (log.children.length > 7) {
    log.removeChild(log.lastChild);
  }
}

function moveWolf(direction) {
  const step = 5;

  if (direction === "up") {
    state.y = clamp(state.y - step);
  }
  if (direction === "down") {
    state.y = clamp(state.y + step);
  }
  if (direction === "left") {
    state.x = clamp(state.x - step);
  }
  if (direction === "right") {
    state.x = clamp(state.x + step);
  }

  state.energy = clamp(state.energy - 3);
  state.water = clamp(state.water - 2);
  state.hunger = clamp(state.hunger + 2);
  state.score += 3;

  if (state.x < 12 || state.y < 12) {
    addLog("The pack moves through the quiet tree line.");
  } else if (state.y > 80) {
    addLog("The wolves track the riverbank scent trail.");
  } else {
    addLog("The pack keeps a steady open-world pace.");
  }

  if (state.water < 10) {
    state.health = clamp(state.health - 8);
    addLog("Water scarcity slows the hunting rhythm.");
  }

  updateUI();
}

function hunt() {
  const success = Math.random() > 0.18;

  if (success) {
    state.hunger = clamp(state.hunger - 18);
    state.energy = clamp(state.energy + 7);
    state.territory = clamp(state.territory + 5);
    state.score += 35;
    addLog("The pack makes a successful hunt near the valley.");
  } else {
    state.energy = clamp(state.energy - 5);
    state.hunger = clamp(state.hunger + 5);
    addLog("The hunt is difficult but the pack remains patient.");
  }

  updateUI();
}

function forage() {
  state.energy = clamp(state.energy + 4);
  state.water = clamp(state.water - 4);
  state.health = clamp(state.health + 5);
  state.score += 15;
  addLog("The pack scouts berries and camas along the ridge.");
  updateUI();
}

function rest() {
  state.energy = clamp(state.energy + 10);
  state.health = clamp(state.health + 6);
  state.hunger = clamp(state.hunger + 3);
  state.score += 8;
  addLog("The pack rests safely inside the den boundary.");
  updateUI();
}

function nextDay() {
  state.day += 1;
  state.energy = clamp(state.energy - 8);
  state.water = clamp(state.water - 6);
  state.health = clamp(state.health + randomInt(-2, 3));
  state.hunger = clamp(state.hunger + 6);
  state.territory = clamp(state.territory + randomInt(-2, 3));
  state.score += 10;

  addLog("The valley settles into another day of movement.");

  if (state.day % 3 === 0) {
    state.pack = clamp(state.pack + randomInt(-1, 2), 2, 15);
  }

  updateUI();
}

function bindEvents() {
  document.getElementById("upBtn").addEventListener("click", () => moveWolf("up"));
  document.getElementById("downBtn").addEventListener("click", () => moveWolf("down"));
  document.getElementById("leftBtn").addEventListener("click", () => moveWolf("left"));
  document.getElementById("rightBtn").addEventListener("click", () => moveWolf("right"));

  document.getElementById("huntBtn").addEventListener("click", hunt);
  document.getElementById("forageBtn").addEventListener("click", forage);
  document.getElementById("restBtn").addEventListener("click", rest);
  document.getElementById("nextDayBtn").addEventListener("click", nextDay);
}

function seedLogs() {
  const log = document.getElementById("eventLog");

  for (let i = 0; i < 4; i++) {
    const item = document.createElement("li");
    item.textContent = logMessages[i];
    log.appendChild(item);
  }
}

function initGame() {
  bindEvents();
  seedLogs();
  updateUI();
}

document.addEventListener("DOMContentLoaded", initGame);
