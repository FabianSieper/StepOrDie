package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/FabianSieper/StepOrDie/internal/config"
)

func ProjectVersionHandler(w http.ResponseWriter, r *http.Request) {

	err, version := config.GetHighestGitTag()

	if err != nil {
		fmt.Printf("WARN - Failed to load highest git tag\n")
		http.Error(w, "Failed to load highest git tag", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	err = json.NewEncoder(w).Encode(version)

	if err != nil {
		fmt.Printf("WARN - Failed to encode git tag\n")
		http.Error(w, "Failed to encoden highest git tag", http.StatusInternalServerError)
		return
	}
}
