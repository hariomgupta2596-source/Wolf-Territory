# 🐺 Wolf Territory

An animated, scrollable open-world wolf adventure built with **vanilla JavaScript and Three.js** — no framework, no bundler, no build step. Open `index.html` in a browser and you're in.

A survival-scene built around scroll: the story moves as you move, and a live 3D scene runs underneath the page at the same time.

## ✨ What's in it

- **Scrollable 3D world** — a Three.js scene rendered into its own canvas (`#game3d`) that reacts to scroll position alongside the DOM narrative.
- **Preloader with a paw trail** — staged entrance before the world renders.
- **Day and terrain system** — the HUD tracks the current day number and terrain name as you travel.
- **Weather layer** — icon-driven weather state on top of the scene.
- **Hunt mechanics** — prey tracking, a prey HUD, a pack HUD for companion wolves, and a running score.
- **Howling** — howl actions wired into the game loop, not just decorative text.
- **Virtual joystick** — pointer-driven joystick base and knob for movement instead of keyboard-only input.
- **Minimap** — live positional overview of the territory.
- **Progress and log board** — scroll progress bar plus an in-world event log.
- **Fully responsive** — collapsible navbar, mobile nav toggle, back-to-top control.

## 🧱 Project structure

```
Wolf-Territory/
├── index.html      # markup, HUD, and the 3D canvas
├── style.css       # world, HUD and animation styling
├── script.js       # ~1,500 lines: Three.js scene, game state, scroll orchestration
├── wolf.jpg        # hero art
└── Entry_Background.png
```

## ▶️ Running it

```bash
git clone https://github.com/hariomgupta2596-source/Wolf-Territory.git
cd Wolf-Territory
# just open the file
open index.html        # macOS
xdg-open index.html    # Linux
```

Or serve it locally if you prefer clean paths:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

No install, no dependencies, no environment variables.

## 🛠️ Built with

`JavaScript (vanilla)` · `Three.js (r128, CDN)` · `CSS3` · `HTML5`

## 💡 What this project taught me

Writing 1,500 lines of game logic without a framework forces you to be honest about structure. Keeping state, animation frames, input and DOM updates in one readable file is harder than scaffolding a React app — and it made me much more deliberate about naming, sectioning and render order. It's also my clearest example of performance thinking: a live 3D scene plus scroll-driven animation needs to stay smooth on a phone.
