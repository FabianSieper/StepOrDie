package request

type SendFeedback struct {
	Name     string `json:"name"`
	Feedback string `json:"feedback"`
}
