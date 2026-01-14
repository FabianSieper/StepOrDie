package request

type StoreGameStateRequestBody struct {
	GameId       string `json:"gameId"`
	PlayingBoard string `json:"playingBoard"`
	Overwrite    bool   `json:"overwrite"`
}
