# Desktop Build: doku.md

## Dependências de sistema

### Desenvolvimento (hot-reload)

Para correr `wails3 dev` é necessário ter as bibliotecas nativas instaladas:

**Ubuntu/Debian (24.04+)**:
```bash
sudo apt install libgtk-4-dev libwebkitgtk-6.0-dev
```

**Ubuntu 22.04**: O GTK4 dos repositórios é 4.6 (insuficiente para Wails3
alpha.93+). Forçar GTK3 editando `build/config.yml`:

```yaml
# secção dev_mode > executes
- cmd: wails3 build DEV=true EXTRA_TAGS=gtk3
  type: blocking
```

Build de produção com GTK3:

```bash
wails3 build -tags gtk3 -platform linux
```

**Fedora**:
```bash
sudo dnf install gtk4-devel webkitgtk6.0-devel
```

**Arch**:
```bash
sudo pacman -S gtk4 webkitgtk-6.0
```

### Build de produção com Docker

A build de produção pode ser feita com Docker, evitando a necessidade de instalar
dependências nativas na máquina de desenvolvimento:

```bash
wails3 build -platform linux/darwin/windows -docker
```

Nota: a primeira build é lenta porque faz pull da imagem e instala dependências.
O Docker é apenas necessário para builds de produção — o desenvolvimento com
hot-reload (`wails3 dev`) continua a precisar das libs nativas.

## Platform-specific builds

### Linux (AppImage)

```bash
wails3 build -platform linux -docker
# O output estará em build/bin/
```

### macOS

```bash
wails3 build -platform darwin -docker
# Gera .app bundle. Para notarização é preciso assinatura Apple Developer.
```

### Windows

```bash
wails3 build -platform windows -docker
# Gera .exe. Para MSI installer é necessário tooling adicional (WiX Toolset).
```

## Distribuição

Para utilizadores finais, recomenda-se:

- **Linux**: AppImage ou Flatpak (inclui todas as dependências)
- **macOS**: .app bundle (pode ser distribuído via zip ou DMG)
- **Windows**: MSI installer ou zip com o executável
