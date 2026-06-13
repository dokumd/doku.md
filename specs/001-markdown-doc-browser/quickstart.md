# Quickstart: Markdown Documentation Browser

## Prerequisites

- Go 1.22+
- Node.js 20+
- Docker (opcional — necessário apenas para build sem dependências nativas)
- Wails 3 CLI (`go install github.com/wailsapp/wails/v3/cmd/wails3@latest`)

### Dependências de sistema (Linux)

Para desenvolvimento com hot-reload (`wails3 dev`), instala as bibliotecas nativas:

```bash
sudo apt install libgtk-4-dev libwebkitgtk-6.0-dev
```

**⚠️ Ubuntu 22.04**: O GTK4 dos repositórios é 4.6 (demasiado antigo para o
Wails3 alpha.93+). É necessário forçar GTK3 editando `build/config.yml` na
secção `dev_mode > executes`:

```yaml
- cmd: wails3 build DEV=true EXTRA_TAGS=gtk3
  type: blocking
```

Para build de produção com GTK3:

```bash
wails3 build -tags gtk3 -platform linux
```

Para build de produção com Docker (não precisa de libs nativas):

```bash
wails3 build -platform linux/darwin/windows -docker
```

## Setup

```bash
# Clone the repository
git clone <repo-url> && cd dokumd

# Initialize Wails3 project
wails3 init -n dokumd -t svelte-ts

# Install frontend dependencies
cd frontend && npm install && cd ..

# Build and run
wails3 dev
```

## Validation Scenarios

### Scenario 1: Open a project and browse

```bash
# Create a test project with sample docs
mkdir -p /tmp/test-docs

cat > /tmp/test-docs/index.md << 'EOF'
# Welcome

This is a test document.

## Section 1

Some content here.
EOF

# Launch doku.md
wails3 dev

# Expected: Click "Open" → select /tmp/test-docs → 
#   File tree shows index.md → clicking it renders the Markdown
```

### Scenario 2: Full-text search

```bash
cat > /tmp/test-docs/guide.md << 'EOF'
# Installation Guide

Follow these steps to install the application.
EOF

# Expected: Search "installation" → shows guide.md with snippet
```

### Scenario 3: File watcher

```bash
# While app is running:
echo "# New Doc" > /tmp/test-docs/new.md

# Expected: Within 3 seconds, new.md appears in search results
```

### Scenario 4: Syntax highlighting

```bash
cat > /tmp/test-docs/code.md << 'EOF'
# Code Example

```go
func main() {
    fmt.Println("Hello")
}
```
EOF

# Expected: Code block renders with syntax highlighting
```

### Scenario 5: Large project performance

```bash
# Generate 1000 test files
for i in $(seq 1 1000); do
    echo "# Document $i\n\nContent of doc $i." > /tmp/test-docs/doc-$i.md
done

# Expected: Open completes in <5s, search returns results in <1s
```

## Configuração de exclusões

Por padrão, algumas pastas são excluídas da indexação (`.git`, `node_modules`,
`dist`, etc.). Se precisares de indexar ficheiros dentro dessas pastas, edita o
ficheiro `.dokumd/.dokuignore` dentro da pasta aberta e remove a linha
correspondente. Na próxima abertura da pasta, as alterações são aplicadas.

Para repor as exclusões padrão, apaga o `.dokumd/.dokuignore` — será recriado
automaticamente com os valores predefinidos.

## Running Tests

```bash
# Go backend tests
go test ./pkg/...

# Frontend tests
cd frontend && npx vitest run
```
