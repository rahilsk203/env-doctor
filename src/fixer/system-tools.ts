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
            { cmd: 'which pacman', install: 'sudo pacman -S python3 make gcc', name: 'Pacman packages' },
            { cmd: 'which dnf', install: 'sudo dnf install -y python3 make gcc-c++', name: 'DNF packages' },
            { cmd: 'which zypper', install: 'sudo zypper install -y python3 make gcc-c++', name: 'Zypper packages' }
          ];
          
          let foundLinuxPM = false;
          for (const pm of linuxPackageManagers) {
            try {
              await exec(pm.cmd);
              installCmd = pm.install;
              toolName = pm.name;
              foundLinuxPM = true;
              break;
            } catch {
              // Continue to next package manager
            }
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
          
          let foundWinPM = false;
          for (const pm of winPackageManagers) {
            try {
              await exec(pm.cmd);
              installCmd = pm.install;
              toolName = pm.name;
              foundWinPM = true;
              break;
            } catch {
              // Continue to next package manager
            }
          }
          
          if (!foundWinPM) {
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
        // Provide multiple options for Linux using optimized structure
        const linuxOptions = [
          ['# Option 1: Using APT (Ubuntu/Debian)', 'sudo apt update && sudo apt install -y python3 make g++'],
          ['# Option 2: Using YUM (CentOS/RHEL)', 'sudo yum install -y python3 make gcc-c++'],
          ['# Option 3: Using DNF (Fedora)', 'sudo dnf install -y python3 make gcc-c++'],
          ['# Option 4: Using Pacman (Arch)', 'sudo pacman -S python3 make gcc'],
          ['# Option 5: Using Zypper (openSUSE)', 'sudo zypper install -y python3 make gcc-c++']
        ];
        
        linuxOptions.forEach((option, index) => {
          commands.push(...option);
          if (index < linuxOptions.length - 1) {
            commands.push(''); // Add blank line between options
          }
        });
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