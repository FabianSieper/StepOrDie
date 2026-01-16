package notion

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/FabianSieper/StepOrDie/internal/config"
	"github.com/FabianSieper/StepOrDie/internal/notion/dto"
	"github.com/chromedp/chromedp"
)

func GetPublicNotionPageContent(pageUrl string) (string, error) {

	// 1. Verify that url is valid notion url
	url, err := url.ParseRequestURI(pageUrl)
	if err != nil {
		return "", fmt.Errorf("invalid URL: %w", err)
	}

	if url == nil || !strings.Contains(url.Hostname(), "notion.site") {
		return "", fmt.Errorf("URL is not a valid public Notion page: %s", pageUrl)
	}

	// 2. Create a Chrome context (headless browser in the background).
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true), // Flip to false to watch the browser. Does not work in docker container.
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.UserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"),
	)

	if execPath := os.Getenv("CHROMEDP_EXEC_PATH"); execPath != "" {
		opts = append(opts, chromedp.ExecPath(execPath))
	}

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	// Guard against hanging requests with a timeout.
	ctx, cancel = context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	var res string

	// 3. Drive the steps inside Chrome.
	fmt.Println("INFO - Loading Notion page in headless Chrome...")
	err = chromedp.Run(ctx,
		chromedp.Navigate(pageUrl),
		// Important: wait until an element proves the JS finished rendering.
		// For Notion the `.notion-page-content` container signals the page is ready.
		chromedp.WaitVisible(`.notion-page-content`, chromedp.ByQuery),

		// Optional: wait a moment so all dynamic elements appear.
		chromedp.Sleep(2*time.Second),

		// Pull the entire page text into `res`.
		chromedp.Text(`.notion-page-content`, &res, chromedp.ByQuery),
	)

	if err != nil {
		return "", fmt.Errorf("Failed to fetch content of Notion page. Cause: %s", err)
	}

	// 4. Clean the result and emit it.
	fmt.Println("INFO - --- Extracted content ---")

	// Simple cleanup (Notion tends to cram lines together).
	lines := strings.Split(res, "\n")
	var trimmedLines []string

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed != "" {
			trimmedLines = append(trimmedLines, trimmed)
		}
	}

	return strings.Join(trimmedLines, "\n"), nil
}

func SendFeedbackToNotion(name string, feedback string) error {
	trimmedFeedback := strings.TrimSpace(feedback)
	if trimmedFeedback == "" {
		return fmt.Errorf("feedback message is empty")
	}

	trimmedName := strings.TrimSpace(name)
	if trimmedName == "" {
		trimmedName = "Anonymous Adventurer"
	}

	err, token := config.GetNotionAccessKey()
	if err != nil {
		return fmt.Errorf("failed to load Notion integration secret: %w", err)
	}

	err, databaseID := config.GetNotionFeedbackDatabaseId()
	if err != nil {
		return fmt.Errorf("could not load notion database feedback id: %w", err)
	}

	requestBody := dto.SendFeedbackToNotionRequest{
		Parent: dto.NotionParent{
			Type:       "database_id",
			DatabaseID: databaseID,
		},
		Properties: dto.NotionFeedbackProperties{
			Name: dto.NotionTitleProperty{
				Title: []dto.NotionTextBlock{
					{
						Text: dto.NotionTextContent{Content: trimmedName},
					},
				},
			},
			Feedback: dto.NotionRichTextProperty{
				RichText: []dto.NotionTextBlock{
					{
						Text: dto.NotionTextContent{Content: trimmedFeedback},
					},
				},
			},
		},
	}

	payload, err := json.Marshal(requestBody)
	if err != nil {
		return fmt.Errorf("failed to serialize Notion feedback payload: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, "https://api.notion.com/v1/pages", bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("failed to create Notion feedback request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Notion-Version", "2022-06-28")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send feedback to Notion: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("Notion rejected feedback (status %d): %s", resp.StatusCode, string(body))
	}

	fmt.Println("INFO - Feedback stored in Notion successfully")
	return nil
}
