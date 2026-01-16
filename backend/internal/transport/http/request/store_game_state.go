package request

type StoreGameStateRequestBody struct {
	GameId string `json:"gameId"`
	Game   Game   `json:"game"`
}
type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type TileType string

const (
	TileWall    TileType = "WALL"    // #
	TileFloor   TileType = "FLOOR"   // .
	TileGoal    TileType = "GOAL"    // Z
	TileUnknown TileType = "UNKNOWN" // used for parsing errors
)

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

	State GameState `json:"state"`
}

type GameState struct {
	Player  Player  `json:"player"`
	Enemies []Enemy `json:"enemies"`
}
