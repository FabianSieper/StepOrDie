package request

type StoreGameStateRequestBody struct {
	GameId string    `json:"gameId"`
	State  GameState `json:"state"`
}
type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type Player struct {
	Position Position `json:"position"`
}

type EnemyType string

const (
	EnemyTypeMonster EnemyType = "MONSTER"
)

type Enemy struct {
	ID       string    `json:"id"`
	Position Position  `json:"position"`
	Type     EnemyType `json:"type"`
}

type GameState struct {
	Player  Player  `json:"player"`
	Enemies []Enemy `json:"enemies"`
}
