package markdown

import (
	"fmt"
	"strings"
	"unicode"
)

// ExtractHeadings parses the raw Markdown content line by line and returns
// all headings found. It uses the ATX heading syntax (# through ######).
// This is a lightweight alternative to parsing the Goldmark AST.
func ExtractHeadings(content string) []Heading {
	var headings []Heading
	seen := make(map[string]int)

	lines := strings.Split(content, "\n")
	for _, line := range lines {
		trimmed := strings.TrimLeft(line, " \t")
		if len(trimmed) == 0 || trimmed[0] != '#' {
			continue
		}

		// Count the leading # characters.
		level := 0
		for level < len(trimmed) && trimmed[level] == '#' {
			level++
		}

		// ATX headings require a space after the # marks.
		if level >= len(trimmed) || (trimmed[level] != ' ' && trimmed[level] != '\t') {
			continue
		}
		if level > 6 {
			level = 6
		}

		text := strings.TrimSpace(trimmed[level:])
		if text == "" {
			continue
		}

		id := headingID(text, seen)
		headings = append(headings, Heading{
			Text:  text,
			Level: level,
			ID:    id,
		})
	}

	return headings
}

// headingID generates an anchor ID from heading text, matching Goldmark's
// auto-heading-ID algorithm. Duplicate IDs get a numeric suffix (-1, -2, ...).
func headingID(text string, seen map[string]int) string {
	var b strings.Builder
	for _, r := range text {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || r == '-' || r == '_' {
			b.WriteRune(unicode.ToLower(r))
		} else if r == ' ' || r == '\t' {
			b.WriteRune('-')
		}
	}
	id := b.String()
	if id == "" {
		id = "heading"
	}

	if count, ok := seen[id]; ok {
		seen[id] = count + 1
		return fmt.Sprintf("%s-%d", id, count)
	}
	seen[id] = 1
	return id
}
