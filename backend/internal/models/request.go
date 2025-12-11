package models

type LoadNotionGameRequestBody struct {
	NotionUrl string `json:"notionUrl"`
	Overwrite bool   `json:"overwrite"`
}
