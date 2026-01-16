package mapper

import (
	"github.com/FabianSieper/StepOrDie/internal/domain"
	"github.com/FabianSieper/StepOrDie/internal/transport/http/request"
	"github.com/FabianSieper/StepOrDie/internal/transport/http/response"
)

func GameFromDomain(game domain.Game) response.Game {
	return response.Game{
		Width:  game.Width,
		Height: game.Height,
		Grid:   mapGrid(game.Grid),
		State:  mapGameState(game.SavedState), // Always return saved state
	}
}

func GameToDomain(game request.Game) domain.Game {
	state := MapResponseGameState(game.State)
	return domain.Game{
		Width:        game.Width,
		Height:       game.Height,
		Grid:         mapResponseGrid(game.Grid),
		InitialState: state,
		SavedState:   state,
	}
}

func mapGameState(state domain.GameState) response.GameState {
	enemies := make([]response.Enemy, 0, len(state.Enemies))
	for _, enemy := range state.Enemies {
		enemies = append(enemies, mapEnemy(enemy))
	}

	return response.GameState{
		Player:  response.Player{Position: mapPosition(state.Player.Position)},
		Enemies: enemies,
	}
}

func mapEnemy(enemy domain.Enemy) response.Enemy {
	return response.Enemy{
		ID:       enemy.ID,
		Position: mapPosition(enemy.Position),
		Type:     response.EnemyType(enemy.Type),
	}
}

func mapPosition(position domain.Position) response.Position {
	return response.Position{
		X: position.X,
		Y: position.Y,
	}
}

func mapGrid(grid [][]domain.TileType) [][]response.TileType {
	mapped := make([][]response.TileType, 0, len(grid))
	for _, row := range grid {
		mappedRow := make([]response.TileType, 0, len(row))
		for _, tile := range row {
			mappedRow = append(mappedRow, response.TileType(tile))
		}
		mapped = append(mapped, mappedRow)
	}

	return mapped
}

func MapResponseGameState(state request.GameState) domain.GameState {
	enemies := make([]domain.Enemy, 0, len(state.Enemies))
	for _, enemy := range state.Enemies {
		enemies = append(enemies, mapResponseEnemy(enemy))
	}

	return domain.GameState{
		Player:  domain.Player{Position: mapResponsePosition(state.Player.Position)},
		Enemies: enemies,
	}
}

func mapResponseEnemy(enemy request.Enemy) domain.Enemy {
	return domain.Enemy{
		ID:       enemy.ID,
		Position: mapResponsePosition(enemy.Position),
		Type:     domain.EnemyType(enemy.Type),
	}
}

func mapResponsePosition(position request.Position) domain.Position {
	return domain.Position{
		X: position.X,
		Y: position.Y,
	}
}

func mapResponseGrid(grid [][]request.TileType) [][]domain.TileType {
	mapped := make([][]domain.TileType, 0, len(grid))
	for _, row := range grid {
		mappedRow := make([]domain.TileType, 0, len(row))
		for _, tile := range row {
			mappedRow = append(mappedRow, domain.TileType(tile))
		}
		mapped = append(mapped, mappedRow)
	}

	return mapped
}
