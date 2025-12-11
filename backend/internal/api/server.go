package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/FabianSieper/NotionQuest/internal/cache"
	"github.com/FabianSieper/NotionQuest/internal/gameboard"
	"github.com/FabianSieper/NotionQuest/internal/models"
	"github.com/FabianSieper/NotionQuest/internal/notion"
)

type Server struct {
	Cache *cache.GameCache
}

func NewServer(cache *cache.GameCache) *Server {
	return &Server{
		Cache: cache,
	}
}

func (s *Server) LoadNotionGameHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, fmt.Sprintf("only POST method is allowed: received %s", r.Method), http.StatusMethodNotAllowed)
		return
	}

	var requestBody models.LoadNotionGameRequestBody

	err := json.NewDecoder(r.Body).Decode(&requestBody)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to read request body: %v", err), http.StatusInternalServerError)
		return
	}

	responseBody, err := gameboard.ExtractPageIdFromNotionUrl(requestBody.NotionUrl)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to extract page ID from Notion URL: %v", err), http.StatusInternalServerError)
		return
	}

	_, ok := s.Cache.Get(responseBody.PageId)

	// Still continue and overwrite if user sent an corresponding parameter = true
	if ok && !requestBody.Overwrite {
		http.Error(w, fmt.Sprintf("Game with page ID %s already exists in cache", responseBody.PageId), http.StatusConflict)
		return
	} else if ok {
		fmt.Printf("INFO - Overwriting existing game with page ID %s\n", responseBody.PageId)
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

	// Store the parsed game field in the cache
	s.Cache.Set(responseBody.PageId, *parsedGameField)

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(responseBody)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to encode response: %v", err), http.StatusInternalServerError)
		return
	}
}
