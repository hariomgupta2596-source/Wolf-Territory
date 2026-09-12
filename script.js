const state = {
  day: 1,
  energy: 84,
  water: 56,
  trees: 18,
  health: 78,
  wildlife: 42,
  score: 0
};

const logs = [
  "The forest wakes up with a quiet hum.",
  "A dry wind rolls over the valley.",
  "Birdsong echoes across the canopy.",
  "The riverbank glows in the morning light."
];

const actionNames = {
  plant: "Plant a new tree",
  water: "Water seedlings",
  scout: "Scout the valley",
  clean: "Clean the habitat"
};

const actionCooldown = {
  plant: 3,
  water: 2,
  scout: 2,
  clean: 2
};

const actionRules = {
  plant: () => {
    state.trees += 2;
    state.energy = clamp(state.energy + 2);
    state.water = clamp(state.water - 8);
    state.health = clamp(state.health + 5);
    state.wildlife = clamp(state.wildlife + 3);
    state.score += 25;
    addLog("You plant two young trees.");
  },
  water: () => {
    state.water = clamp(state.water + 10);
    state.health = clamp(state.health + 4);
    state.wildlife = clamp(state.wildlife + 2);
    state.score += 15;
    addLog("You carry water to the green zone.");
  },
  scout: () => {
    const wildlifeGain = randomInt(1, 5);
    state.wildlife = clamp(state.wildlife + wildlifeGain);
    state.energy = clamp(state.energy - 4);
    state.health = clamp(state.health + 2);
    state.score += 10 + wildlifeGain;
    addLog("A scouting team reports more birds and tracks.");
  },
  clean: () => {
    state.health = clamp(state.health + 8);
    state.energy = clamp(state.energy + 2);
    state.wildlife = clamp(state.wildlife + 4);
    state.score += 20;
    addLog("You remove litter and restore the trail.");
  }
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function updateUI() {
  document.getElementById("dayNumber").textContent = state.day;
  document.getElementById("scoreNumber").textContent = state.score;
  document.getElementById("energyValue").textContent = `${state.energy}%`;
  document.getElementById("waterValue").textContent = `${state.water}%`;
  document.getElementById("treesValue").textContent = state.trees;
  document.getElementById("healthValue").textContent = `${state.health}%`;
  document.getElementById("wildlifeValue").textContent = `${state.wildlife}%`;

  const healthMeter = document.getElementById("healthMeter");
  const energyMeter = document.getElementById("energyMeter");
  const waterMeter = document.getElementById("waterMeter");

  energyMeter.style.width = `${state.energy}%`;
  waterMeter.style.width = `${state.water}%`;
  healthMeter.style.width = `${state.health}%`;

  const forestMap = document.getElementById("forestMap");
  const treeCount = clamp(state.trees, 8, 40);
  forestMap.innerHTML = "";

  for (let i = 0; i < treeCount; i++) {
    const tree = document.createElement("span");
    tree.className = "tree-icon";
    tree.textContent = i % 4 === 0 ? "🌲" : "🌳";
    forestMap.appendChild(tree);
  }
}

function addLog(text) {
  const log = document.getElementById("eventLog");
  const li = document.createElement("li");
  li.textContent = text;
  log.insertBefore(li, log.firstChild);

  while (log.children.length > 6) {
    log.removeChild(log.lastChild);
  }
}

function runAction(type) {
  if (actionRules[type]) {
    actionRules[type]();

    if (state.energy < 10 || state.health < 8) {
      addLog("The habitat is fragile. Careful planning is needed.");
    }

    if (state.health > 90 && state.wildlife > 75) {
      state.score += 50;
      addLog("The ecosystem enters a strong growth cycle.");
    }

    if (state.energy <= 0) {
      state.energy = 50;
      state.health = clamp(state.health - 5);
      addLog("A tough rhythm drains your reserves.");
    }

    if (state.water <= 5) {
      state.health = clamp(state.health - 8);
      state.wildlife = clamp(state.wildlife - 4);
      addLog("Water reserves are running low.");
    }

    state.day += 1;
    state.energy = clamp(state.energy - randomInt(1, 4));
    state.water = clamp(state.water - randomInt(1, 2));
    state.health = clamp(state.health + randomInt(-2, 2));
    state.wildlife = clamp(state.wildlife + randomInt(-2, 2));

    if (state.day % 4 === 0) {
      const weather = ["Rain", "Sun", "Wind", "Mist"];
      const w = weather[randomInt(0, weather.length - 1)];
      document.getElementById("weatherName").textContent = w;
    }

    updateUI();
  }
}

function bindEvents() {
  document.getElementById("plantBtn").addEventListener("click", () => runAction("plant"));
  document.getElementById("waterBtn").addEventListener("click", () => runAction("water"));
  document.getElementById("scoutBtn").addEventListener("click", () => runAction("scout"));
  document.getElementById("cleanBtn").addEventListener("click", () => runAction("clean"));

  document.getElementById("nextDayBtn").addEventListener("click", () => {
    state.day += 1;
    state.energy = clamp(state.energy - 3);
    state.water = clamp(state.water - 2);
    state.health = clamp(state.health + randomInt(-1, 2));
    state.wildlife = clamp(state.wildlife + randomInt(-2, 3));
    addLog("A new day begins over the forest.");
    updateUI();
  });
}

function seedGame() {
  const logList = document.getElementById("eventLog");
  logs.forEach((text, i) => {
    const li = document.createElement("li");
    li.textContent = text;
    if (i === 0) li.style.fontWeight = "700";
    logList.appendChild(li);
  });

  updateUI();
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  seedGame();
});
