package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/FabianSieper/StepOrDie/internal/notion"
	"github.com/FabianSieper/StepOrDie/internal/transport/http/request"
)

func SendFeedbackToNotion(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, fmt.Sprintf("only POST method is allowed: received %s", r.Method), http.StatusMethodNotAllowed)
		return
	}

	var feedbackBody request.SendFeedback

	err := json.NewDecoder(r.Body).Decode(&feedbackBody)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to read request body: %v", err), http.StatusInternalServerError)
		return
	}

	err = notion.SendFeedbackToNotion(feedbackBody.Name, feedbackBody.Feedback)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to send feedback to Notion. Received error: %v\n", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)

}
