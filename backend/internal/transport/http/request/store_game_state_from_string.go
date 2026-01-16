package request

type StoreGameFromStringRequestBody struct {
	GameId       string `json:"gameId"`
	PlayingBoard string `json:"playingBoard"`
	Overwrite    bool   `json:"overwrite"`
}
