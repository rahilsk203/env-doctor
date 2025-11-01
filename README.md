# env-doctor

**Intelligent diagnostic & auto-repair tool for JavaScript/TypeScript development environments.**

<a href="https://www.npmjs.com/package/env-doctor">
  <img src="https://img.shields.io/npm/v/env-doctor?color=success&label=npm%20package" alt="npm version">
</a>
<a href="https://github.com/rahilsk203/env-doctor/actions/workflows/ci.yml">
  <img src="https://github.com/rahilsk203/env-doctor/actions/workflows/ci.yml/badge.svg" alt="CI Status">
</a>
<a href="https://github.com/rahilsk203/env-doctor/blob/main/LICENSE">
  <img src="https://img.shields.io/npm/l/env-doctor?color=blue" alt="License: MIT">
</a>
<a href="https://github.com/sponsors/rahilsk203">
  <img src="https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=ff69b4" alt="Sponsor">
</a>

> **"Works on my machine" is dead.**  
> Let `env-doctor` diagnose and fix your dev environment — **in seconds**.

---

## Why env-doctor?

Setting up a consistent JavaScript/TypeScript environment is **hard**:

- Node.js version mismatch
- Missing build tools (`python`, `make`, `g++`)
- Corrupted `node_modules`
- WSL ↔ Windows path issues
- Termux/Android quirks
- CI pipeline flakiness

`env-doctor` **scans, reports, and fixes** all of this — **automatically**.

---

## Features

| Feature | Description |
|-------|-------------|
| **Environment Scanner** | Detects Node.js, package manager, OS, shell, WSL, Docker, Termux |
| **Auto-Fixer Engine** | Safe, reversible fixes with opt-in for risky actions |
| **Smart Reporting** | JSON/YAML reports, health scores, fix history |
| **CI/CD Ready** | Non-interactive mode, exit codes, structured output |
| **Cross-Platform** | Linux, macOS, Windows, WSL2, Termux, Docker |
| **Zero Config** | Works out of the box; optional `.env-doctor.yml` |

---

## Supported Platforms

| Platform | Variants |
|--------|----------|
| **Linux** | Ubuntu, Debian, Arch, Fedora, Alpine, WSL2 |
| **macOS** | Intel & Apple Silicon (M1/M2/M3/M4) |
| **Windows** | 10/11 (PowerShell, CMD, Git Bash, WSL) |
| **Termux** | Android (arm64, aarch64) |
| **CI/CD** | GitHub Actions, GitLab CI, CircleCI, Jenkins |

---

## Installation

```bash
# Install globally
npm install -g env-doctor

# Or run instantly with npx (no install)
npx env-doctor@latest scan
