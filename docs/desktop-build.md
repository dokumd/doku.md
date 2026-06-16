# Desktop Build: doku.md

## System dependencies

### Development (hot-reload)

Running `wails3 dev` requires native libraries:

**Ubuntu/Debian (24.04+)**:
```bash
sudo apt install libgtk-4-dev libwebkitgtk-6.0-dev
```

**Ubuntu 22.04**: The packaged GTK4 is version 4.6, which is too old for
Wails3 alpha.93+ (requires GTK 4.10+ for `GtkFileDialog`). Force GTK3 by
editing `build/config.yml` under `dev_mode > executes`:

```yaml
- cmd: wails3 build DEV=true EXTRA_TAGS=gtk3,fts5
  type: blocking
```

**Ubuntu 24.04+ / future releases**: If your GTK4 is 4.10 or newer, you
can remove `gtk3` and use only `fts5`:

```yaml
- cmd: wails3 build DEV=true EXTRA_TAGS=fts5
  type: blocking
```

To check your GTK4 version:

```bash
pkg-config --modversion gtk4
```

If you encounter GTK-related compilation errors (`GtkFileDialog`,
`GtkNativeDialog`), your GTK4 is too old. Add `EXTRA_TAGS=gtk3`.

**Fedora**:
```bash
sudo dnf install gtk4-devel webkitgtk6.0-devel
```

**Arch**:
```bash
sudo pacman -S gtk4 webkitgtk-6.0
```

## Development build

```bash
wails3 dev
```

The `build/config.yml` already includes `EXTRA_TAGS=gtk3,fts5`. On
newer Ubuntu versions (24.04+) you may remove `gtk3`.

Note: `wails3 dev` does not accept `-tags` directly as a CLI flag —
build tags are always propagated via `EXTRA_TAGS` in `build/config.yml`,
not on the command line.

## Production build

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

Output in `dokumd/bin/`: AppImage, `.deb` and `.rpm`.

> **To confirm**: whether an AppImage compiled with GTK4 (on Ubuntu 24.04+)
> runs without issues on systems with GTK4 < 4.10 (e.g., Ubuntu 22.04).
> The AppImage bundles the correct WebKitGTK for the chosen stack, but it
> is not yet confirmed that the core GTK4 libraries are also bundled.
> Until confirmed, distributing the `gtk3` build is the safest option for
> compatibility with older systems.

### macOS and Windows

Cross-compilation from Linux requires Docker with the `wails-cross` image
(Zig as cross-compiler):

```bash
wails3 task setup:docker   # one time only
```

> **To confirm**: the exact package task names for Windows and macOS via
> Docker (`windows:package`, `darwin:package`, or variants) have not been
> validated in this session.

**Recommendation (alternative)**: use GitHub Actions with native runners
per platform (`ubuntu-latest`, `windows-latest`, `macos-latest`), each
running `wails3 task package` — this generic task resolves automatically
to `{{OS}}:package` based on the runner. This avoids cross-compilation
and code signing / notarisation issues.

On `windows-latest`, NSIS (`makensis`) is not pre-installed — you need
`choco install nsis -y` before the build.

## Distribution

- **Linux**: AppImage (`gtk3` build recommended until GTK4 compatibility
  on older systems is confirmed)
- **macOS**: `.app` bundle — exact format and notarisation process not
  yet documented
- **Windows**: `.exe` with NSIS installer
