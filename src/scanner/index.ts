import { EnvironmentInfo, Issue, ScanResult } from '../types';
import { SystemScanner } from './system';
import { NodeScanner } from './node';
import { DependenciesScanner } from './dependencies';
import { NativeModulesScanner } from './native';

export class Scanner {
  static async scan(cwd: string = process.cwd()): Promise<ScanResult> {
    const startTime = Date.now();
    
    // Run independent scans in parallel for better performance
    const [environment, nodeIssues, depIssues, nativeIssues] = await Promise.all([
      SystemScanner.scan(),
      NodeScanner.scan(cwd),
      DependenciesScanner.scan(cwd),
      NativeModulesScanner.scan(cwd)
    ]);
    
    // Combine all issues with optimized deduplication using Map
    const issueMap = new Map<string, Issue>();
    
    // Add all issues to map, later issues with same ID will overwrite earlier ones
    for (const issue of [...nodeIssues, ...depIssues, ...nativeIssues]) {
      issueMap.set(issue.id, issue);
    }
    
    // Convert map values back to array
    const issues = Array.from(issueMap.values());
    
    // Generate suggestions based on issues
    const suggestions = this.generateSuggestions(issues, environment);
    
    const result: ScanResult = {
      timestamp: new Date(),
      environment,
      issues,
      suggestions
    };
    
    const endTime = Date.now();
    console.log(`Scan completed in ${endTime - startTime}ms`);
    
    return result;
  }
  
  private static generateSuggestions(issues: Issue[], environment: EnvironmentInfo): any[] {
    const suggestions: any[] = [];
    
    // Optimize issue grouping using a single pass with Map for O(n) instead of O(3n)
    const severityMap = new Map<string, number>();
    for (const issue of issues) {
      const count = severityMap.get(issue.severity) || 0;
      severityMap.set(issue.severity, count + 1);
    }
    
    // Use Map lookups for O(1) severity checking
    if ((severityMap.get('critical') || 0) > 0) {
      suggestions.push({
        id: 'critical-fix-required',
        title: 'Critical Issues Detected',
        description: 'Your environment has critical issues that prevent normal operation.',
        confidence: 90
      });
    }
    
    if ((severityMap.get('high') || 0) > 0) {
      suggestions.push({
        id: 'high-priority-fixes',
        title: 'High Priority Fixes Available',
        description: 'Addressing these issues will improve your development experience.',
        confidence: 80
      });
    }
    
    // Platform-specific suggestions
    if (environment.isWSL) {
      suggestions.push({
        id: 'wsl-optimization',
        title: 'WSL Optimization',
        description: 'Consider optimizing your WSL setup for better performance.',
        confidence: 70
      });
    }
    
    return suggestions;
  }
}