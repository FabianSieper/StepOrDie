package gameboard

import (
	"fmt"
	"strings"

	"github.com/FabianSieper/StepOrDie/internal/domain"
)

// ParseScenario interprets the textual board, for example:
// ####################
// #S.................#
// #...####...M.......#
// #...#......##......#
// #...#..M...........#
// #..............M...#
// #...####...........#
// #...#..Z...........#
// ####################
func ParseScenario(raw string) (*domain.Game, error) {
	rows := strings.Split(raw, "\n")
	// Rows come from top to bottom, so each string represents the Y axis,
	// while characters within the row walk along the X axis from left to right.

	amountRows, amountCols, err := getAmountRowsAndCols(rows)

	if err != nil {
		return &domain.Game{}, err
	}

	grid, err := parseGrid(rows)

	if err != nil {
		return &domain.Game{}, err
	}

	playerPosition, err := getPlayerPosition(rows)

	if err != nil {
		return &domain.Game{}, err
	}

	enemies := extractEnemies(rows)

	initialGameState := domain.GameState{
		Player:  domain.Player{Position: playerPosition},
		Enemies: enemies,
	}

	return &domain.Game{
		Width:        amountCols,
		Height:       amountRows,
		Grid:         grid,
		InitialState: initialGameState,
		SavedState:   initialGameState, // At the beginning, the saved game state is the same as the initial game state
	}, nil
}

func extractEnemies(rows []string) []domain.Enemy {
	enemies := make([]domain.Enemy, 0)
	index := 1
	for y, row := range rows {
		for x, char := range row {
			if char == 'M' {
				enemyId := fmt.Sprintf("enemy_%d", index)
				enemies = append(enemies, domain.Enemy{
					ID:       enemyId,
					Position: domain.Position{X: x, Y: y},
					Type:     domain.EnemyTypeMonster,
				})
				index++
			}
		}
	}

	return enemies
}

func getPlayerPosition(rows []string) (domain.Position, error) {
	var playerPosition domain.Position

	for y, row := range rows {
		for x, char := range row {
			if char == 'S' {
				if playerPosition != (domain.Position{}) {
					return domain.Position{}, fmt.Errorf("multiple occurences of character 'S' found. Only one is allowed.")
				}

				playerPosition = domain.Position{X: x, Y: y}
			}
		}
	}

	// If no player was found
	if playerPosition == (domain.Position{}) {
		return domain.Position{}, fmt.Errorf("player start position 'S' not found")
	}
	// Success, exactly one player position was found
	return playerPosition, nil

}

func parseGrid(rows []string) ([][]domain.TileType, error) {

	var grid [][]domain.TileType

	for _, row := range rows {
		var gridRow []domain.TileType

		for _, char := range row {
			tile, err := parseTile(char)

			if err != nil {
				return [][]domain.TileType{}, err
			}
			gridRow = append(gridRow, tile)
		}
		grid = append(grid, gridRow)
	}

	return grid, nil
}

var tileMappings = map[rune]domain.TileType{
	'#': domain.TileWall,
	'.': domain.TileFloor,
	'Z': domain.TileGoal,
	'S': domain.TileFloor, // start position is represented as floor on the static grid
	'M': domain.TileFloor, // monster spawn points become floor on the static grid
}

func parseTile(char rune) (domain.TileType, error) {
	if tile, ok := tileMappings[char]; ok {
		return tile, nil
	}
	return domain.TileUnknown, fmt.Errorf("invalid tile character: %c", char)
}

func getAmountRowsAndCols(rows []string) (int, int, error) {
	amountRows := len(rows)

	if amountRows < 2 {
		return 0, 0, fmt.Errorf("the amount of rows is too small: %d. The minimum is 2", amountRows)
	}

	if err := ensureRowsSameLength(rows); err != nil {
		return 0, 0, err
	}

	amountCols := len(rows[0])

	if amountRows != amountCols {
		return 0, 0, fmt.Errorf("the board is not square, but should be: %d rows vs %d columns", amountRows, amountCols)
	}

	return amountRows, amountCols, nil
}

func ensureRowsSameLength(rows []string) error {
	if len(rows) == 0 {
		return nil
	}
	expectedLength := len(rows[0])

	for idx, row := range rows {
		if len(row) != expectedLength {
			return fmt.Errorf("row %d (%q) has length %d, expected %d", idx, row, len(row), expectedLength)
		}
	}
	return nil
}
