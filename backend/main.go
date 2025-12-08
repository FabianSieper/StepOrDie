package main

import (
	"fmt"
	"net/http"

	"github.com/FabianSieper/NotionQuest/internal/api"
)

func main() {
	fmt.Printf("INFO - Backend is starting\n")

	// Example: https://fabiansieper.notion.site/Notion-Quest-2c25e55239fb80f78f9df3fa2c2d65d1
	http.HandleFunc("/loadNotionGame", api.LoadNotionGameHandler)

	http.ListenAndServe(":8080", nil)

	fmt.Printf("INFO - Backend has stopped\n")
}
