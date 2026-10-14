# 🧪 Alchemist's Cauldron

A browser potion-brewing mini-game built for the RS School qualifying stage.

Mix ingredients from a limited shelf, move three cauldron values — **Temperature**, **Density** and
**Magic Power** — into the target ranges of a random recipe, and brew potions before the time or the
lives run out.

## Game goal

- Pick ingredients from the shelf. Every ingredient changes the three cauldron values.
- Each ingredient has a limited random stock (2–15 portions) that is never refilled.
- Press **Brew** when all three values fit the recipe ranges (with tolerance).
- A correct brew gives score and bonus time, a wrong brew costs a life.
- The game ends when the time is over, all lives are lost, or the ingredients run out.

## Task set

The task is split into stories, each delivered in its own branch:

| Stage            | Branch    | Content                                                         |
| ---------------- | --------- | --------------------------------------------------------------- |
| Precondition 1   | `story-1` | Repository, tooling, folder structure and quality checks        |
| Level 1 — Basic  | `story-1` | Shelf, cauldron, bars, recipes, brewing, timer, pause, Top-10   |
| Level 2 — Extend | `story-2` | Difficulty selection, auto-save and Continue Game               |
| Level 3 — Full   | `story-3` | Drag & drop, tooltip, reactions, Pour Out, shortcuts, animation |

Task description:
[Alchemist's Cauldron](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/game-alchemists-cauldron/README.md)

## Project structure

Game rules live outside the DOM code: `data`, `logic`, `state` and `storage` never touch the page,
only `ui` renders and listens to events.

```text
src/
  assets/    static game assets (SVG icons)
  data/      fixed tables: ingredients, recipes, difficulty settings
  logic/     pure game rules: cauldron sums, stock, recipe picking, brew check, timer
  state/     the game state object and the actions that change it
  storage/   localStorage helpers: leaderboard and saves
  styles/    CSS
  types/     shared TypeScript types and interfaces
  ui/        DOM rendering and event handling
public/      files copied to the build as they are
```

## Tech stack

- TypeScript (no frameworks, no game engines, no UI libraries)
- Vite as the bundler
- Plain CSS for the layout, SVG and CSS for icons
