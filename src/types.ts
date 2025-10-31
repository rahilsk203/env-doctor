export interface EnvironmentInfo {
  nodeVersion: string;
  npmVersion: string;
  os: string;
  arch: string;
  shell: string;
  isWSL: boolean;
  isDocker: boolean;
  isCI: boolean;
}

export interface ScanResult {
  timestamp: Date;
  environment: EnvironmentInfo;
  issues: Issue[];
  suggestions: Suggestion[];
}

export interface Issue {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  file?: string;
  fixAvailable: boolean;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  command?: string;
  confidence: number; // 0-100
}

export interface FixResult {
  success: boolean;
  message: string;
  fixedIssues: string[];
  failedIssues: string[];
}