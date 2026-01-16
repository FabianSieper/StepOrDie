package cache

import (
	"sync"

	"github.com/FabianSieper/StepOrDie/internal/domain"
)

// GameCache keeps parsed Notion boards in memory for reuse.
type GameCache struct {
	mu    sync.RWMutex
	games map[string]*domain.Game
}

// NewGameCache creates an empty cache instance.
func NewGameCache() *GameCache {
	return &GameCache{
		games: make(map[string]*domain.Game, 0),
	}
}

// Get attempts to fetch a cached entry by key.
func (c *GameCache) Get(notionSiteId string) (domain.Game, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	val, ok := c.games[notionSiteId]
	if !ok || val == nil {
		return domain.Game{}, false
	}

	return *val, true
}

// Set stores or overwrites a cached entry.
func (c *GameCache) Set(key string, value *domain.Game) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.games[key] = value
}
