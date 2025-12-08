## 1. Technology Choices

**Framework & Language**
- Angular with Router.
- TypeScript with `strict` mode enabled.

**Rendering**
- HTML5 Canvas 2D rendered inside a single `<canvas>`.
- Simpler than WebGL/Phaser, fast enough for 20 x 20 tiles, and broadly supported even on a Raspberry Pi.

**State**
- Game engine implemented with plain TypeScript classes.
- Angular Signals reserved for UI-facing state (loading, errors, stats, etc.).

---

## 2. Project Structure

```
src/
  app/
    core-game/          <-- pure TS, no Angular dependencies
      game-engine.ts
      map.ts
      entity.ts
      player.ts
      npc.ts
      types.ts
    services/
      backend.service.ts
      session.service.ts   (optional)
    pages/
      start/
        start.component.ts   <-- start screen with URL input
      game/
        game.component.ts    <-- canvas + game loop
    app.routes.ts
    app.component.ts
```

`core-game` acts as the lightweight engine. Angular orchestrates it but does not render tiles itself.

---

## 3. Routes & UI Flow
1. `/` – start screen (`StartComponent`)
   - Full-screen layout with:
     - Input field for the backend URL.
     - “Start” button.
   - Flow:
     - Validate URL and load the level.
     - Obtain session ID from the backend (or generate it).
     - `router.navigate(['/game', sessionId])`.
2. `/game/:sessionId` – game screen (`GameComponent`)
   - Contains:
     - `<canvas>` for the playfield.
     - Optional HUD (e.g., “Session X” text).
   - Initializes the `GameEngine` with map and entities, then starts the `requestAnimationFrame` loop.

---

## 4. Services

**BackendService**
- Fetches, via the provided URL:
  - Tile data as `TileType[][]` (20 x 20).
  - Optional metadata (spawn positions, NPC definitions, etc.).

**SessionService (optional)**
- Stores the active session ID, URL, and possibly the player name.
- Passes data between the start and game screens.

---

## 5. Core Game (Pure TypeScript)

**Data Models**
- `enum TileType { Floor, Wall, ... }`
- `type TileMap = TileType[][]; // 20 x 20`
- `interface Entity { id; x; y; vx; vy; spriteId; ... }`
- `class Player implements Entity { ... }`
- `class Npc implements Entity { ... }`

**GameEngine**
- `class GameEngine {`
  - `map: TileMap`
  - `player: Player`
  - `npcs: Npc[]`
  - `update(dt: number, input: InputState)` → movement, collisions, interpolation.
  - `render(ctx: CanvasRenderingContext2D)` → draw tiles and sprites.
- The class is unaware of Angular; it only needs the canvas context.

**Input Handling**
- In `GameComponent`:
  - Register `keydown`/`keyup` listeners for WASD/arrow keys.
  - Maintain a simple object such as `{ up: boolean; down: boolean; left: boolean; right: boolean; }`.
  - Pass this object into `gameEngine.update(dt, input)`.

---

## 6. Game Loop in `GameComponent`

- `ngOnInit` (conceptually):
  - Grab the canvas context.
  - Instantiate `GameEngine`.
  - Register input listeners.
  - Call `startLoop()`.
- `startLoop()`:
  - `requestAnimationFrame(t => loop(t));`
  - Inside `loop`:
    - Compute `dt`.
    - `gameEngine.update(dt, input);`
    - `gameEngine.render(ctx);`
    - Schedule the next frame with `requestAnimationFrame(...)`.

Angular does not need to trigger change detection for every frame—the canvas handles drawing.

---

## 7. Extensibility

- New entities (NPCs, projectiles) live as new classes inside `core-game`.
- Additional screens (settings, credits) become new routes and components.
- Extra UI overlays stay within Angular templates without touching the engine.
- More status displays can be built with Signals that the engine feeds.
