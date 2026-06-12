package main
import (
    "fmt"
    "changeme/pkg/scanner"
)
func main() {
    files, err := scanner.ScanMarkdownFiles("/tmp/test-scan", []string{"node_modules", ".git", "dist"})
    fmt.Println("err:", err)
    fmt.Println("files:", files)
}
