package notion

import (
	"context"
	"fmt"
	"net/url"
	"strings"
	"time"

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
		chromedp.Flag("headless", true), // Flip to false to watch the browser.
		chromedp.UserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"),
	)

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
