// Package markdown converts Markdown content to HTML using Goldmark
// and extracts headings for table-of-contents navigation.
package markdown

import (
	"bytes"
	"fmt"
	"log"
	"strings"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
)

// MaxFileSize is the maximum Markdown file size (in bytes) that will be
// rendered. Files larger than this are truncated to avoid excessive memory
// usage or Goldmark hangs on extremely large documents.
const MaxFileSize = 1 * 1024 * 1024 // 1MB

// Heading represents a single heading extracted from a Markdown document.
type Heading struct {
	Text  string `json:"text"`
	Level int    `json:"level"`
	ID    string `json:"id"`
}

// Render converts Markdown content to HTML and extracts all headings.
// Returns the rendered HTML, a list of headings for TOC, and any error.
//
// Edge cases handled:
//   - Empty content returns empty HTML (no error).
//   - Content exceeding MaxFileSize (1MB) is silently truncated.
func Render(content string) (string, []Heading, error) {
	// Handle empty content gracefully.
	if len(strings.TrimSpace(content)) == 0 {
		return "", nil, nil
	}

	// Truncate extremely large files to prevent memory issues.
	if len(content) > MaxFileSize {
		content = content[:MaxFileSize]
		log.Printf("warning: file truncated to %d bytes for rendering", MaxFileSize)
	}

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
