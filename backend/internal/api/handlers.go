package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/FabianSieper/NotionQuest/internal/gameboard"
	"github.com/FabianSieper/NotionQuest/internal/notion"
)

func LoadNotionGameHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, fmt.Sprintf("only POST method is allowed: received %s", r.Method), http.StatusMethodNotAllowed)
		return
	}

	var requestBody LoadNotionGameRequestBody

	err := json.NewDecoder(r.Body).Decode(&requestBody)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to read request body: %v", err), http.StatusInternalServerError)
		return
	}

	resp, err := notion.GetPublicNotionPageContent(requestBody.NotionUrl)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to load Notion page: %v", err), http.StatusInternalServerError)
		return
	}
	fmt.Printf("INFO - Successfully loaded Notion page content")

	parsedGameField, err := gameboard.ParseScenario(resp)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to parse Notion page content into game field: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(parsedGameField)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to encode response: %v", err), http.StatusInternalServerError)
		return
	}

}
