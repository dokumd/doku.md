// Package markdown converts Markdown content to HTML using Goldmark
// and extracts headings for table-of-contents navigation.
package markdown

import (
	"bytes"
	"fmt"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
)

// Heading represents a single heading extracted from a Markdown document.
type Heading struct {
	Text  string `json:"text"`
	Level int    `json:"level"`
	ID    string `json:"id"`
}

// Render converts Markdown content to HTML and extracts all headings.
// Returns the rendered HTML, a list of headings for TOC, and any error.
func Render(content string) (string, []Heading, error) {
	md := goldmark.New(
		goldmark.WithExtensions(
			extension.Table,
			extension.Strikethrough,
			extension.TaskList,
		),
		goldmark.WithParserOptions(
			parser.WithAutoHeadingID(),
		),
		goldmark.WithRendererOptions(
			html.WithUnsafe(),
		),
	)

	headings := ExtractHeadings(content)

	var buf bytes.Buffer
	if err := md.Convert([]byte(content), &buf); err != nil {
		return "", nil, fmt.Errorf("render markdown: %w", err)
	}

	return buf.String(), headings, nil
}
