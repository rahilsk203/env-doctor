import { FixResult } from '../types';
import { exec } from '../utils/exec';
import { Logger } from '../utils/logger';

export class SystemToolsFixer {
  static async installBuildTools(platform: string): Promise<FixResult> {
    const result: FixResult = {
      success: false,
      message: '',
      fixedIssues: [],
      failedIssues: []
    };
    
    try {
      let installCmd = '';
      let toolName = '';
      
      switch (platform) {
        case 'darwin': // macOS
          // Check if Homebrew is installed
          try {
            await exec('which brew');
            installCmd = 'brew install python3 make g++';
            toolName = 'Xcode Command Line Tools and Homebrew packages';
          } catch {
            result.message = 'Homebrew not found. Install it first: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
            result.failedIssues.push('missing-homebrew');
            return result;
          }
          break;
          
        case 'linux':
          // Check for common package managers using optimized detection
          const linuxPackageManagers = [
            { cmd: 'which apt', install: 'sudo apt update && sudo apt install -y python3 make g++', name: 'APT packages' },
            { cmd: 'which yum', install: 'sudo yum install -y python3 make gcc-c++', name: 'YUM packages' },
            { cmd: 'which pacman', install: 'sudo pacman -S python3 make gcc', name: 'Pacman packages' }
          ];
          
          // Use parallel detection for better performance
          const linuxPMChecks = await Promise.all(
            linuxPackageManagers.map(async (pm) => {
              try {
                await exec(pm.cmd);
                return { success: true, pm };
              } catch {
                return { success: false, pm };
              }
            })
          );
          
          const foundLinuxPM = linuxPMChecks.find(check => check.success);
          if (foundLinuxPM) {
            installCmd = foundLinuxPM.pm.install;
            toolName = foundLinuxPM.pm.name;
          }
          
          if (!foundLinuxPM) {
            result.message = 'Unsupported package manager. Please install python3, make, and g++ manually.';
            result.failedIssues.push('unsupported-package-manager');
            return result;
          }
          break;
          
        case 'win32': // Windows
          // Use optimized parallel detection of package managers
          const winPackageManagers = [
            { cmd: 'choco --version', install: 'choco install python3 visualstudio2022buildtools -y', name: 'Chocolatey packages' },
            { cmd: 'scoop --version', install: 'scoop install python3 && scoop install visualstudio2022buildtools', name: 'Scoop packages' },
            { cmd: 'winget --version', install: 'winget install Python.Python.3 && winget install Microsoft.VisualStudio.2022.BuildTools', name: 'WinGet packages' }
          ];
          
          // Use parallel detection for better performance
          const pmChecks = await Promise.all(
            winPackageManagers.map(async (pm) => {
              try {
                await exec(pm.cmd);
                return { success: true, pm };
              } catch {
                return { success: false, pm };
              }
            })
          );
          
          const foundPM = pmChecks.find(check => check.success);
          if (foundPM) {
            installCmd = foundPM.pm.install;
            toolName = foundPM.pm.name;
          } else {
            result.message = 'No supported package manager found. Install Visual Studio Build Tools manually from https://visualstudio.microsoft.com/visual-cpp-build-tools/';
            result.failedIssues.push('manual-install-required');
            return result;
          }
          
          if (!foundPM) {
            result.message = 'No supported package manager found. Install Visual Studio Build Tools manually from https://visualstudio.microsoft.com/visual-cpp-build-tools/';
            result.failedIssues.push('manual-install-required');
            return result;
          }
          break;
          
        default:
          result.message = `Unsupported platform: ${platform}`;
          result.failedIssues.push('unsupported-platform');
          return result;
      }
      
      Logger.log(`Installing ${toolName}...`, 'info');
      Logger.log(`Suggested command: ${installCmd}`, 'info');
      
      result.success = true;
      result.message = `To install required build tools, run: ${installCmd}`;
      result.fixedIssues.push('build-tools-install-suggested');
    } catch (error) {
      result.failedIssues.push('build-tools-install-failed');
      result.message = `Failed to suggest build tools installation: ${error}`;
    }
    
    return result;
  }
  
  static getInstallCommands(platform: string): string[] {
    const commands: string[] = [];
    
    switch (platform) {
      case 'darwin':
        commands.push('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
        commands.push('brew install python3 make g++');
        break;
        
      case 'linux':
        commands.push('sudo apt update && sudo apt install -y python3 make g++');
        break;
        
      case 'win32':
        // Provide multiple options for Windows using optimized structure
        const winOptions = [
          ['# Option 1: Using Chocolatey', 'choco install python3 visualstudio2022buildtools -y'],
          ['# Option 2: Using Scoop', 'scoop install python3', 'scoop install visualstudio2022buildtools'],
          ['# Option 3: Using WinGet', 'winget install Python.Python.3', 'winget install Microsoft.VisualStudio.2022.BuildTools'],
          ['# Option 4: Manual installation', '# Download and install Visual Studio Build Tools from:', '# https://visualstudio.microsoft.com/visual-cpp-build-tools/']
        ];
        
        winOptions.forEach((option, index) => {
          commands.push(...option);
          if (index < winOptions.length - 1) {
            commands.push(''); // Add blank line between options
          }
        });
        break;
    }
    
    return commands;
  }
}