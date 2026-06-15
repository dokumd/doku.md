# Desktop Build: doku.md

## Dependências de sistema

### Desenvolvimento (hot-reload)

Para correr `wails3 dev` é necessário ter as bibliotecas nativas instaladas:

**Ubuntu/Debian (24.04+)**:
```bash
sudo apt install libgtk-4-dev libwebkitgtk-6.0-dev
```

**Ubuntu 22.04**: O GTK4 dos repositórios é 4.6 (insuficiente para Wails3
alpha.93+, que requer GTK 4.10+ para `GtkFileDialog`). É necessário forçar
GTK3 editando `build/config.yml` na secção `dev_mode > executes`:

```yaml
- cmd: wails3 build DEV=true EXTRA_TAGS=gtk3,fts5
  type: blocking
```

**Ubuntu 24.04+ / versões futuras**: Se o teu GTK4 for 4.10 ou superior,
podes remover `gtk3` e usar apenas `fts5`:

```yaml
- cmd: wails3 build DEV=true EXTRA_TAGS=fts5
  type: blocking
```

Para verificar a versão do GTK4 instalada:

```bash
pkg-config --modversion gtk4
```

Se encontrares erros de compilação relacionados com GTK (`GtkFileDialog`,
`GtkNativeDialog`), o GTK4 é demasiado antigo. Adiciona `EXTRA_TAGS=gtk3`.

**Fedora**:
```bash
sudo dnf install gtk4-devel webkitgtk6.0-devel
```

**Arch**:
```bash
sudo pacman -S gtk4 webkitgtk-6.0
```

## Build de desenvolvimento

```bash
wails3 dev
```

O ficheiro `build/config.yml` já inclui `EXTRA_TAGS=gtk3,fts5`. Se
estiveres numa versão recente do Ubuntu (24.04+) podes remover `gtk3`.

Nota: o `wails3 dev` não aceita `-tags` directamente como flag CLI — a
propagação de build tags faz-se sempre via `EXTRA_TAGS` no `build/config.yml`,
não na linha de comandos.

## Build de produção

### Linux (AppImage)

**Build (Ubuntu 22.04, GTK3 legacy):**

```bash
cd dokumd
wails3 task linux:package EXTRA_TAGS=gtk3
```

**Build (Ubuntu 24.04+, GTK4):**

```bash
cd dokumd
wails3 task linux:package
```

Output em `dokumd/bin/`: AppImage, `.deb` e `.rpm`.

> **A confirmar**: se um AppImage compilado com GTK4 (em Ubuntu 24.04+)
> corre sem problemas num sistema com GTK4 < 4.10 (ex.: Ubuntu 22.04).
> O AppImage empacota o WebKitGTK correcto consoante o stack, mas não
> está confirmado se o GTK4 core também é empacotado. Até confirmação,
> distribuir o build `gtk3` é a opção mais segura para compatibilidade
> com sistemas mais antigos.

### macOS e Windows

Cross-compilation a partir de Linux requer Docker com a imagem `wails-cross`
(Zig como cross-compiler):

```bash
wails3 task setup:docker   # uma vez
```

> **A confirmar**: os nomes exactos das tasks de package para Windows e
> macOS via Docker (`windows:package`, `darwin:package` ou variantes)
> não foram validados nesta sessão.

**Recomendação (alternativa)**: usar GitHub Actions com runners nativos
por plataforma (`ubuntu-latest`, `windows-latest`, `macos-latest`), cada
um correndo `wails3 task package` — esta task genérica resolve
automaticamente para `{{OS}}:package` consoante o runner. Evita
cross-compilation e problemas de assinatura/notarização.

No `windows-latest`, o NSIS (`makensis`) não vem pré-instalado — é
necessário `choco install nsis -y` antes do build.

## Distribuição

- **Linux**: AppImage (build `gtk3` recomendado até confirmação sobre
  compatibilidade do build `gtk4` em sistemas mais antigos)
- **macOS**: `.app` bundle — formato exacto e processo de notarização
  não documentados ainda
- **Windows**: `.exe` com instalador NSIS
