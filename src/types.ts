export interface EnvironmentReport {
  timestamp: string;
  node: NodeInfo;
  system: SystemInfo;
  dependencies: DependencyInfo;
  native: NativeInfo;
  issues: Issue[];
}

export interface NodeInfo {
  version: string;
  manager: PackageManager;
  managerVersion: string;
  engines?: Record<string, string>;
  issues?: Issue[];
}

export interface SystemInfo {
  platform: string;
  arch: string;
  shell: string;
  isWSL: boolean;
  isDocker: boolean;
  isCI: boolean;
  buildTools: BuildToolsInfo;
  issues?: Issue[];
}

export interface BuildToolsInfo {
  python: boolean;
  make: boolean;
  gpp: boolean;
  clang: boolean;
  cmake: boolean;
  visualStudio?: boolean;
  windowsSDK?: boolean;
}

export interface DependencyInfo {
  nodeModulesExists: boolean;
  lockFileExists: boolean;
  lockFileDrift: boolean;
  checksumMismatch: boolean;
  issues?: Issue[];
}

export interface NativeInfo {
  nodeGypIssues: boolean;
  prebuildIssues: boolean;
  cmakeJsIssues: boolean;
  issues?: Issue[];
}

export interface Issue {
  id: string;
  type: IssueType;
  severity: Severity;
  message: string;
  fixAvailable: boolean;
  fixCommand?: string;
}

export type IssueType = 
  | 'node-version'
  | 'package-manager'
  | 'missing-build-tools'
  | 'node-modules'
  | 'native-modules'
  | 'lockfile'
  | 'optional-deps';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'unknown';

export interface FixResult {
  success: boolean;
  message: string;
  fixedIssues: string[];
}

export interface PlatformModule {
  detect(): Promise<boolean>;
  getInstallCommand(packageName: string): string;
  getBuildTools(): string[];
}