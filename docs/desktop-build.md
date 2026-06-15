# Desktop Build: doku.md

## Dependências de sistema

### Desenvolvimento (hot-reload)

Para correr `wails3 dev` é necessário ter as bibliotecas nativas instaladas:

**Ubuntu/Debian (24.04+)**:
```bash
sudo apt install libgtk-4-dev libwebkitgtk-6.0-dev
```

**Ubuntu 22.04**: O GTK4 dos repositórios é 4.6 (insuficiente para Wails3
alpha.93+). É necessário forçar GTK3 editando `build/config.yml` na
secção `dev_mode > executes`:

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

## Build de produção

### Linux (AppImage — recomendado)

O AppImage inclui todas as dependências GTK e WebKit, funcionando em
qualquer distribuição Linux **sem necessidade de instalar nada**.

**Build nativa (precisa das libs instaladas):**

```bash
wails3 task linux:package EXTRA_TAGS=gtk3
```

**Com Docker** (recomendado — não precisa de dependências nativas):

```bash
wails3 build -platform linux -docker
```

Output: `build/linux/appimage/dokumd.AppImage`

**Sem Docker** (precisa das libs nativas instaladas):

```bash
wails3 build -tags "gtk3 fts5" -platform linux
```

### macOS

```bash
wails3 build -platform darwin -docker
```

Gera `.app bundle`. Para notarização é preciso assinatura Apple Developer.

### Windows

```bash
wails3 build -platform windows -docker
```

Gera `.exe`. Para MSI installer é necessário WiX Toolset.

## Distribuição

- **Linux**: AppImage (inclui todas as dependências — recomendado)
- **macOS**: .app bundle (zip ou DMG)
- **Windows**: .exe (zip ou MSI installer)
