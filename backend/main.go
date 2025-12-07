package main

import "github.com/FabianSieper/NotionQuest/internal/notion"

func main() {
	resp, err := notion.GetPublicNotionPageContent("https://fabiansieper.notion.site/Notion-Quest-2c25e55239fb80f78f9df3fa2c2d65d1")

	if err != nil {
		panic(err)
	}

	println(resp)
}
