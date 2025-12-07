## Overview

NotionQuest is a small prototype for a browser-based, top-down dungeon crawler whose maps live on a public Notion page. The backend reads that page and drives the turn-based game logic, while the frontend will render the grid and sprites.

## Project Structure

- `backend/`: Go service that downloads the Notion map (via the unofficial `github.com/kjk/notionapi` client), parses it into a grid, and will expose REST endpoints such as `GET /gamestate` and `POST /move`.
- `frontend/`: Angular app (currently scaffolded) that will call the Go API, render the tile grid, and animate the characters.

## Local Development

We rely on [Taskfile](https://taskfile.dev) for simple automation. After installing it, run `task run-backend` to execute `go run main.go` inside `backend/` with the expected environment variables. Further tasks will be added as the API and frontend evolve.
