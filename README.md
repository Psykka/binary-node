# 🔐 Node.js SEA Binary Template

This project is a minimal and production-ready template for building Node.js binaries using [Self-Extracting Archives (SEA)](https://nodejs.org/api/single-executable-applications.html). It supports cross-platform builds for macOS, Linux, and Windows, with optional binary signing and injection using [`postject`](https://github.com/nodejs/postject).

## 🚀 Features

- ✅ Cross-platform support (macOS, Linux, Windows)
- ✅ Automatically bundles your app into a standalone binary
- ✅ Uses Node.js SEA with `sea-config.json`
- ✅ Injects SEA blob into the Node.js binary
- ✅ Optional binary signing (macOS/Windows)
- ✅ TypeScript support with prebuild step

## 📦 Requirements

- [Node.js](https://nodejs.org/) (18+ with SEA support)
- [pnpm](https://pnpm.io/)
- `signtool` (Windows) or `codesign` (macOS)

## 📁 Project Structure

```bash
├── bin/                # Final binary output
├── dist/               # Compiled JavaScript from TypeScript
├── scripts/
│   └── compile-bin.js  # Build script using zx
│   └── build.js        # esbuild script
├── src/                # Your source code
├── sea-config.json     # SEA config
├── package.json
└── tsconfig.json
```

# 🔧 Usage

## 1. Install Dependencies
```bash
pnpm install
```

## 2. Build Your Application
```bash
pnpm build
```

This command will:
- Clean the `dist` and `bin` directories
- Compile TypeScript
- Generate the SEA blob from sea-config.json
- Copy the Node binary
- Inject the SEA blob into the Node binary
- Sign the binary if applicable (macOS/Windows)

The final binary will be located in the `bin/` directory.

```bash
# linux/macOS
./bin/<package-name>

# windows
.\bin\<package-name>.exe
```

# 📝 Customization

- Edit `sea-config.json` to configure what files are bundled.
- Modify `scripts/compile-bin.js` to customize the build process.
- Add your logic in the `src/` directory.

# 📜 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.