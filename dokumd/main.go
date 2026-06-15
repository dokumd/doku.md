// Package main is the Wails3 application entry point.
// It initialises the database, creates all domain services, registers them
// as Wails3 bindings, creates the main window, and runs the event loop.
package main

import (
	"embed"
	"io/fs"
	"log"

	"github.com/wailsapp/wails/v3/pkg/application"

	"dokumd/internal/config"
	"dokumd/internal/database"
	"dokumd/internal/services"
)

// migrations embeds the SQL migration files into the binary so that the
// migrator can find them both in development and in the production build
// (AppImage). The embed always works from the binary itself.
//
//go:embed migrations
var migrations embed.FS

// assets embeds the compiled Svelte frontend into the Go binary.
// Wails3 serves these files as the webview content.
//
//go:embed all:frontend/dist
//go:embed migrations
var assets embed.FS

func main() {
	// === Debug: paths resolvidos ===
	if dataDir, err := config.DataDir(); err == nil {
		log.Println("DataDir:", dataDir)
	}

	// Create a sub-filesystem starting at "migrations/" so that RunMigrations
	// sees "global/" and "local/" as root directories.
	migrationsFS, err := fs.Sub(migrations, "migrations")
	if err != nil {
		log.Fatal("failed to create migrations fs:", err)
	}

	// === Database init ===
	if err := database.Init(migrationsFS); err != nil {
		log.Fatal("database init failed:", err)
	}
	defer database.Close()
	log.Println("database initialized")

	// === Services ===
	folderService := services.NewFolderService(migrationsFS)
	windowService := services.NewWindowService()

	// === Wails app ===
	app := application.New(application.Options{
		Name:        "dokumd",
		Description: "doku.md — A Markdown documentation browser",
		Services: []application.Service{
			application.NewService(folderService),
			application.NewService(windowService),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	// === Window ===
	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:      "doku.md",
		StartState: application.WindowStateMaximised,
		Frameless:  true,
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		BackgroundColour: application.NewRGB(27, 38, 54),
		URL:              "/",
	})

	// === Run ===
	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
