# env-doctor

Intelligent diagnostic and repair tool for JavaScript/TypeScript development environments.

[![npm version](https://badge.fury.io/js/env-doctor.svg)](https://badge.fury.io/js/env-doctor)
[![Build Status](https://github.com/rahilsk203/env-doctor/workflows/CI/badge.svg)](https://github.com/rahilsk203/env-doctor/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`env-doctor` is a cross-platform CLI tool designed to simplify the setup and troubleshooting of JavaScript/TypeScript development environments. It addresses the common pain points developers face when dealing with inconsistent Node.js versions, missing build tools, incompatible dependencies, and platform-specific issues.

## Features

- **Environment Scanner**: Automatically detect and validate Node.js version, package managers, OS details, build essentials, and more
- **Auto-Fixer Engine**: Safe, reversible, opt-in fixes for common environment issues
- **Platform Intelligence**: Auto-detect Termux, WSL, Docker, CI environments and apply platform-specific logic
- **Smart Reporting**: Persist results with fix success history and confidence scores
- **Cross-Platform Support**: Works on Linux, macOS, Windows, and Termux (Android)

## Supported Environments

| Platform | Variants Tested |
|----------|----------------|
| Linux | Ubuntu, Debian, Arch, Alpine, WSL2 |
| macOS | Intel & Apple Silicon (M1/M2/M3) |
| Windows | 10/11 (PowerShell, CMD, Git Bash) |
| Termux | Android (arm64, aarch64) |

## Installation

```bash
# Install globally
npm install -g env-doctor

# Or run directly with npx
npx env-doctor scan
```

## Usage

```bash
# Run full diagnostic scan
env-doctor scan

# Auto-apply safe fixes (prompt for risky ones)
env-doctor fix

# Non-interactive mode (for CI)
env-doctor fix --all

# View last scan report
env-doctor report

# Clear cache, logs, and reports
env-doctor reset

# Easter egg
env-doctor doctor
```

## Core Functionality

### Environment Scanner
- Node.js version validation (via .nvmrc, engines, package.json, or runtime)
- npm/yarn/pnpm version and compatibility checks
- OS, architecture, shell, and container/VM context detection
- Build essentials verification (python3, make, g++, clang, cmake)
- node_modules integrity checks (checksum mismatch, lockfile drift)
- Native module build cache issue detection

### Auto-Fixer Engine
- node_modules cleanup + npm ci / npm install --force
- Rebuild native addons (npm rebuild or node-gyp rebuild)
- Skip optional dependencies on incompatible platforms
- Install missing system packages with guided prompts
- Repair node-gyp Python/path issues
- Fix WSL interoperability issues

## Development

### Prerequisites
- Node.js >= 14
- npm, yarn, or pnpm

### Setup
```bash
# Clone the repository
git clone https://github.com/rahilsk203/env-doctor.git
cd env-doctor

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Watch mode for tests
npm run test:watch

# Generate coverage
npm run test:coverage
```

### Project Structure
```
src/
├── cli.ts              # Entry point
├── types.ts            # Type definitions
├── scanner/            # Environment scanning modules
│   ├── index.ts        # Scanner orchestrator
│   ├── node.ts         # Node.js version checks
│   ├── system.ts       # OS and system tools checks
│   ├── dependencies.ts # Dependency validation
│   └── native.ts       # Native module checks
├── fixer/              # Auto-fixing modules
│   ├── index.ts        # Fixer orchestrator
│   └── ...             # Specific fix implementations
├── platforms/          # Platform-specific logic
│   ├── index.ts        # Platform module factory
│   ├── linux.ts        # Linux-specific logic
│   ├── macos.ts        # macOS-specific logic
│   ├── windows.ts      # Windows-specific logic
│   └── termux.ts       # Termux-specific logic
└── utils/              # Utility functions
    ├── exec.ts         # Command execution
    ├── logger.ts       # Logging utilities
    ├── report.ts       # Report generation
    └── cache.ts        # Cache management
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Rahil S K - [@rahilsk203](https://github.com/rahilsk203)

## Acknowledgments

- Thanks to all contributors who have helped shape this tool
- Inspired by the need to simplify JavaScript/TypeScript development environment setup