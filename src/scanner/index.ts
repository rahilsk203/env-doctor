import { EnvironmentReport } from '../types';
import { scanNode } from './node';
import { scanSystem } from './system';
import { scanDependencies } from './dependencies';
import { scanNative } from './native';

export async function scanEnvironment(): Promise<EnvironmentReport> {
  const nodeInfo = await scanNode();
  const systemInfo = await scanSystem();
  const dependencyInfo = await scanDependencies();
  const nativeInfo = await scanNative();

  const report: EnvironmentReport = {
    timestamp: new Date().toISOString(),
    node: {
      version: nodeInfo.version,
      manager: nodeInfo.manager,
      managerVersion: nodeInfo.managerVersion,
      engines: nodeInfo.engines
    },
    system: {
      platform: systemInfo.platform,
      arch: systemInfo.arch,
      shell: systemInfo.shell,
      isWSL: systemInfo.isWSL,
      isDocker: systemInfo.isDocker,
      isCI: systemInfo.isCI,
      buildTools: systemInfo.buildTools
    },
    dependencies: {
      nodeModulesExists: dependencyInfo.nodeModulesExists,
      lockFileExists: dependencyInfo.lockFileExists,
      lockFileDrift: dependencyInfo.lockFileDrift,
      checksumMismatch: dependencyInfo.checksumMismatch
    },
    native: {
      nodeGypIssues: nativeInfo.nodeGypIssues,
      prebuildIssues: nativeInfo.prebuildIssues,
      cmakeJsIssues: nativeInfo.cmakeJsIssues
    },
    issues: []
  };

  // Collect issues from all scanners
  const allIssues = [
    ...(nodeInfo.issues || []),
    ...(systemInfo.issues || []),
    ...(dependencyInfo.issues || []),
    ...(nativeInfo.issues || [])
  ];

  report.issues = allIssues;
  
  return report;
}