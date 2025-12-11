package gameboard

import (
	"fmt"
	"strings"
	"unicode"

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
	// Rows come from top to bottom, so each string represents the Y axis,
	// while characters within the row walk along the X axis from left to right.
	rows = sanitizeRows(rows)

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

func ExtractPageIdFromNotionUrl(notionUrl string) (models.LoadNotionResponseBody, error) {
	// TODO: https://fabiansieper.notion.site/Notion-Quest-2c25e55239fb80f78f9df3fa2c2d65d1?source=copy_link
	parts := strings.Split(notionUrl, "/")

	// Should at least be split into two parts
	if len(parts) < 2 {
		return models.LoadNotionResponseBody{PageId: ""}, fmt.Errorf("invalid Notion URL: %s", notionUrl)
	}

	// Remove query parameter at the end
	if strings.ContainsRune(parts[len(parts)-1], '?') {
		// select first part before ? of Notion-Quest-2c25e55239fb80f78f9df3fa2c2d65d1?source=copy_link
		subParts := strings.Split(parts[len(parts)-1], "?")
		return models.LoadNotionResponseBody{PageId: subParts[0]}, nil
	}

	return models.LoadNotionResponseBody{PageId: parts[len(parts)-1]}, nil
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

	if err := ensureRowsSameLength(rows); err != nil {
		return 0, 0, err
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

func sanitizeRows(rows []string) []string {
	cleaned := make([]string, 0, len(rows))
	for _, row := range rows {
		s := sanitizeRow(row)
		if s == "" {
			continue
		}
		cleaned = append(cleaned, s)
	}

	return cleaned
}

func sanitizeRow(row string) string {
	var cleaned strings.Builder
	cleaned.Grow(len(row))
	for _, r := range row {
		switch {
		case unicode.In(r, unicode.Cf):
			continue
		case r == '\r' || r == '\t':
			continue
		default:
			if _, ok := tileMappings[r]; ok {
				cleaned.WriteRune(r)
			}
		}
	}
	return cleaned.String()
}
