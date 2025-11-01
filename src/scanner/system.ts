import { SystemInfo, BuildToolsInfo, Issue } from '../types';
import { execCommand } from '../utils/exec';

export async function scanSystem(): Promise<SystemInfo & { issues?: Issue[] }> {
  const info: SystemInfo & { issues?: Issue[] } = {
    platform: process.platform,
    arch: process.arch,
    shell: process.env.SHELL || process.env.ComSpec || 'unknown',
    isWSL: isWSL(),
    isDocker: isDocker(),
    isCI: !!process.env.CI,
    buildTools: await checkBuildTools(),
    issues: []
  };

  return info;
}

function isWSL(): boolean {
  return process.platform === 'linux' && 
         (process.env.WSL_DISTRO_NAME !== undefined || 
          process.env.WSL_INTEROP !== undefined);
}

function isDocker(): boolean {
  // Simple check for Docker environment
  return process.env.DOCKER !== undefined || 
         process.env.CONTAINER !== undefined;
}

async function checkBuildTools(): Promise<BuildToolsInfo> {
  const tools: BuildToolsInfo = {
    python: false,
    make: false,
    gpp: false,
    clang: false,
    cmake: false
  };

  // Check for python
  try {
    await execCommand('python --version');
    tools.python = true;
  } catch {
    try {
      await execCommand('python3 --version');
      tools.python = true;
    } catch {
      // Python not found
    }
  }

  // Check for make
  try {
    await execCommand('make --version');
    tools.make = true;
  } catch {
    // make not found
  }

  // Check for g++
  try {
    await execCommand('g++ --version');
    tools.gpp = true;
  } catch {
    // g++ not found
  }

  // Check for clang
  try {
    await execCommand('clang --version');
    tools.clang = true;
  } catch {
    // clang not found
  }

  // Check for cmake
  try {
    await execCommand('cmake --version');
    tools.cmake = true;
  } catch {
    // cmake not found
  }

  // Platform-specific checks
  if (process.platform === 'win32') {
    // Check for Visual Studio and Windows SDK
    // This would require more complex checks
  }

  return tools;
}