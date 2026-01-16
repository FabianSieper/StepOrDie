package domain

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

type Game struct {
	Width  int `json:"width"`
	Height int `json:"height"`

	Grid [][]TileType `json:"grid"`

	// Domain game objects contains two states, while the http response object only contains one
	InitialState GameState `json:"initialState"`
	SavedState   GameState `json:"SavedState"`
}

type GameState struct {
	Player  Player  `json:"player"`
	Enemies []Enemy `json:"enemies"`
}
