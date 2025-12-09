package main

import (
	"fmt"
	"net/http"

	"github.com/FabianSieper/NotionQuest/internal/api"
)

var (
	port = 8080
)

func main() {
	fmt.Printf("INFO - Backend is starting\n")

	// Example: https://fabiansieper.notion.site/Notion-Quest-2c25e55239fb80f78f9df3fa2c2d65d1
	http.Handle("/api/loadNotionGame", addCORSHeaders(http.HandlerFunc(api.LoadNotionGameHandler)))

	fmt.Printf("INFO - Backend has started and listening on port %d\n", port)
	http.ListenAndServe(fmt.Sprintf(":%d", port), nil)

	fmt.Printf("INFO - Backend has stopped\n")
}

func addCORSHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
