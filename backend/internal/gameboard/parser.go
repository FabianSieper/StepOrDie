package gameboard

import (
	"fmt"
	"strings"

	"github.com/FabianSieper/NotionQuest/internal/models"
)

var playGroundSize = 20

// ParseScenario interprets the textual board pulled from Notion, for example:
// ####################
// #S.................#
// #...####...M.......#
// #...#......##......#
// #...#..M...........#
// #..............M...#
// #...####...........#
// #...#..Z...........#
// ####################
func ParseScenario(raw string) (*models.GameState, error) {
	rows := strings.Split(raw, "\n")
	amountRows, amountCols, err := getAmountRowsAndCols(rows)

	if err != nil {
		return &models.GameState{}, err
	}

	grid, err := parseGrid(rows)

	if err != nil {
		return &models.GameState{}, err
	}

	playerPosition, err := getPlayerPosition(rows)

	if err != nil {
		return &models.GameState{}, err
	}

	return &models.GameState{
		Width:  amountCols,
		Height: amountRows,
		Grid:   grid,
		Player: models.Player{
			Position: playerPosition,
			HP:       10,
		},
		Monsters: []models.Monster{},
		Status:   "PLAYING",
	}, nil
}

func getPlayerPosition(rows []string) (models.Position, error) {
	for y, row := range rows {
		for x, char := range row {
			if char == 'S' {
				return models.Position{X: x, Y: y}, nil
			}
		}
	}

	return models.Position{}, fmt.Errorf("player start position 'S' not found")
}

func parseGrid(rows []string) ([][]models.TileType, error) {

	var grid [][]models.TileType

	for _, row := range rows {
		var gridRow []models.TileType

		for _, char := range row {
			tile, err := parseTile(char)

			if err != nil {
				return [][]models.TileType{}, err
			}
			gridRow = append(gridRow, tile)
		}
		grid = append(grid, gridRow)
	}

	return grid, nil
}

var tileMappings = map[rune]models.TileType{
	'#': models.TileWall,
	'.': models.TileFloor,
	'Z': models.TileGoal,
	'S': models.TileFloor, // start position is represented as floor on the static grid
	'M': models.TileFloor, // monster spawn points become floor on the static grid
}

func parseTile(char rune) (models.TileType, error) {
	if tile, ok := tileMappings[char]; ok {
		return tile, nil
	}
	return models.TileUnknown, fmt.Errorf("invalid tile character: %c", char)
}

func getAmountRowsAndCols(rows []string) (int, int, error) {
	amountRows := len(rows)

	if amountRows < 2 {
		return 0, 0, fmt.Errorf("the amount of rows is too small: %d. The minimum is 2", amountRows)
	}

	if !allRowsSameLength(rows) {
		return 0, 0, fmt.Errorf("not all rows have the same length")
	}

	amountCols := len(rows[0])

	if amountRows != amountCols {
		return 0, 0, fmt.Errorf("the board is not square, but should be: %d rows vs %d columns", amountRows, amountCols)
	}

	if playGroundSize != amountRows {
		return 0, 0, fmt.Errorf("the board size is incorrect: got %d but expected %d", amountRows, playGroundSize)
	}

	return amountRows, amountCols, nil
}

func allRowsSameLength(rows []string) bool {
	for _, row := range rows {
		if len(row) != len(rows[0]) {
			return false
		}
	}
	return true
}
