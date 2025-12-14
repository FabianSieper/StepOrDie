package models

// 1. Basic building blocks
// ---------------------------------------------------------

// Position keeps x/y pairs easy to pass around.
type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
}

// TileType describes what the ground is on a given cell.
// Use strings so the JSON is easier to debug than with raw numbers.
type TileType string

const (
	TileWall    TileType = "WALL"    // #
	TileFloor   TileType = "FLOOR"   // .
	TileGoal    TileType = "GOAL"    // Z
	TileUnknown TileType = "UNKNOWN" // used for parsing errors
)

// 2. The entities
// ---------------------------------------------------------

type Player struct {
	Position Position `json:"position"`
}

type EnemyType string

const (
	EnemyTypeMonster EnemyType = "MONSTER"
)

type Enemy struct {
	ID       string    `json:"id"` // Needed for Angular trackBy (e.g. "enemy_1")
	Position Position  `json:"position"`
	Type     EnemyType `json:"type"`
}

// 3. The full picture (game state)
// ---------------------------------------------------------

// GameState is the object returned by the API endpoint.
type GameState struct {
	// Metadata
	Width  int `json:"width"`
	Height int `json:"height"`

	// Layer 0: the static map
	// Represented as a 2D array of strings.
	// IMPORTANT: there are no 'S' or 'M' characters here anymore.
	// Cells that currently hold monsters are still just "FLOOR".
	Grid [][]TileType `json:"grid"`

	// Layer 1: dynamic actors
	Player  Player  `json:"player"`
	Enemies []Enemy `json:"enemies"`
}
