package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/FabianSieper/StepOrDie/internal/api"
	"github.com/FabianSieper/StepOrDie/internal/cache"
	"github.com/FabianSieper/StepOrDie/internal/config"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

var (
	port = 8081
)

func main() {
	loadEnvFile()
	startServer()
}

func startServer() {
	server := createServer()

	fmt.Printf("INFO - Backend is starting\n")

	router := createRouter()
	addHandler(server, router)

	fmt.Printf("INFO - Backend has started and listening on port %d\n", port)
	http.ListenAndServe(fmt.Sprintf(":%d", port), router)
	fmt.Printf("INFO - Backend has stopped\n")
}

func createRouter() *chi.Mux {
	router := chi.NewRouter()
	router.Use(cors.Handler(cors.Options{
		// Origins for local development and prod environment
		AllowedOrigins:   []string{"http://localhost:4200", "https://play.sieper.uk"},
		AllowedMethods:   []string{http.MethodGet, http.MethodPost, http.MethodOptions},
		AllowedHeaders:   []string{"Accept", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	return router
}

func addHandler(server *api.Server, router *chi.Mux) {
	router.Post("/api/sendFeedback", api.SendFeedbackToNotion)
	router.Post("/api/storeGameStateFromString", server.StoreGameStateFromString)
	router.Post("/api/storeGameState", server.StoreGameState)
	router.Get("/api/loadGameStateFromCache/{gameId}", server.LoadGameState)
	router.Get("/api/version", api.ProjectVersionHandler)
}

func loadEnvFile() {

	fmt.Printf("INFO - Loading .env file\n")
	if err := config.LoadDotEnv(); err != nil {
		// For production, variables from .env are loaded into the runtime via docker-compose and no .env file has to be loaded
		log.Printf("WARN - .env file not loaded: %v\n", err)
		return
	}
	fmt.Printf("INFO - Successfully loaded .env file\n")

}

func createServer() *api.Server {

	fmt.Printf("INFO - Creating new cache\n")
	cache := cache.NewGameCache()
	server := api.NewServer(cache)
	fmt.Printf("INFO - Successfully created new cache\n")
	return server
}
