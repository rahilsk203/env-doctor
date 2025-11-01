# Rollup Android ARM64 Issue Detection

## Overview

The env-doctor tool includes specialized detection for a known issue with Rollup in Termux environments on ARM64 devices. This issue commonly occurs in Vite projects where the `@rollup/rollup-android-arm64` binary fails to load due to missing symbols.

## Error Pattern

The error typically manifests as:

```
Error: Cannot find module @rollup/rollup-android-arm64. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try npm i again after removing both package-lock.json and node_modules directory.

[cause]: Error: dlopen failed: cannot locate symbol "__emutls_get_address" referenced by "/data/data/com.termux/files/home/sk/node_modules/@rollup/rollup-android-arm64/rollup.android-arm64.node"...
```

## Advanced Detection Logic

The env-doctor tool uses advanced detection methods to identify this issue:

1. **Environment Detection**: Running in Termux (detected by `PREFIX` environment variable containing 'com.termux')
2. **Architecture Check**: ARM64 architecture (`process.arch === 'arm64'`)
3. **Dependency Verification**: Presence of Rollup and `@rollup/rollup-android-arm64` in node_modules
4. **File Integrity Check**: Verification of the node binary file accessibility
5. **Error Pattern Matching**: Advanced scanning for specific error signatures in log files

## Detection Levels

The tool provides two levels of detection:

1. **Confirmed Issue**: When the specific error pattern is detected
2. **Potential Issue**: When the environment conditions are met but the error hasn't manifested yet

## Fix Strategy

When detected, env-doctor recommends and can automatically apply the following fix:

```bash
rm -rf node_modules package-lock.json yarn.lock pnpm-lock.yaml && npm install --force
```

This comprehensive approach:
1. Removes the problematic node_modules directory
2. Clears all lock files to avoid dependency resolution issues
3. Forces a fresh installation with `--force` flag to bypass npm's optional dependency handling bug

## Implementation Details

The detection is implemented in:
- `src/scanner/native.ts` - Scanner module with advanced detection logic
- `src/fixer/rollup.ts` - Enhanced fixer implementation with comprehensive cleanup
- `src/fixer/index.ts` - Main fixer that routes to the specific implementation

## Testing

Unit tests are included in `__tests__/native.test.ts` to verify:
- Correct detection in Termux ARM64 environment with Rollup installed
- No false positives in other environments
- Proper issue structure and metadata
- Both confirmed and potential issue detection

## Benefits of Advanced Detection

1. **Proactive Detection**: Identifies potential issues before they cause runtime errors
2. **Precise Targeting**: Only flags issues in environments where they actually occur
3. **Comprehensive Cleanup**: Handles all package manager lock files
4. **User Feedback**: Provides detailed information about the issue and fix