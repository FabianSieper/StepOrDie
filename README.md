# Overview

Step or Die is a small top-down dungeon crawler. The backend drives the turn-based game logic, while the frontend renders the grid, includes the level editor, and animates the sprites.

# Project Structure

- `backend/`: Go service that exposes REST endpoints such as `GET /gamestate` and `POST /move`, persists the game board data, and runs the turn-based engine.
- `frontend/`: Angular app that talks to the Go API, renders the tile grid, hosts the level editor, and animates the characters.

# Local Development

## Prerequisites

- Go 1.25+
- Node 22 (ships with npm 11) and the Angular CLI (`npm install -g @angular/cli`)
- [Taskfile](https://taskfile.dev) for the helper scripts
- Docker (optional, only needed for the full stack containers)

Copy `.env.example` to `.env` if you plan to run the backend locally. It contains the expected secrets for the Notion integration (`NOTION_FEEDBACK_INTEGRATION_SECRET`, `NOTION_FEEDBACK_DATABASE_ID`, etc.).

## Running the backend

```bash
task run-backend-dev
# or manually:
cd backend
go run main.go
```

The API listens on `http://localhost:8081`. Helper commands live in the `Taskfile`, so run `task --list` to discover quick ways to hit the local API.

## Running the frontend

```bash
task run-frontend-dev
# or manually:
cd frontend
ng serve
```

The Angular dev server runs on `http://localhost:4200` and proxies API calls to the Go backend.

## Full stack via Docker

To boot the entire stack (frontend, backend, optional Cloudflare tunnel) in Docker containers:

```bash
task run
```

The command builds the images (`stepordiefrontend` and `stepordiebackend`) and starts the compose stack. Run `task stop` to tear everything down.

# Future Feature Ideas

- Multiplayer - join a session based on a session id
- Store game state in a database
- a search to search for already loaded games based on ids
- fail if the pageid is already set so that the user can choose in the frontend if they want to overwrite or load the game state
