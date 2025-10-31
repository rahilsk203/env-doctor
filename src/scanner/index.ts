import { EnvironmentInfo, Issue, ScanResult } from '../types';
import { SystemScanner } from './system';
import { NodeScanner } from './node';
import { DependenciesScanner } from './dependencies';
import { NativeModulesScanner } from './native';

export class Scanner {
  static async scan(cwd: string = process.cwd()): Promise<ScanResult> {
    const startTime = Date.now();
    
    // Scan system environment
    const environment = await SystemScanner.scan();
    
    // Scan Node.js related issues
    const nodeIssues = await NodeScanner.scan(cwd);
    
    // Scan dependencies issues
    const depIssues = await DependenciesScanner.scan(cwd);
    
    // Scan native modules issues
    const nativeIssues = await NativeModulesScanner.scan(cwd);
    
    // Combine all issues
    const issues = [...nodeIssues, ...depIssues, ...nativeIssues];
    
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
    
    // Group issues by severity
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    const highIssues = issues.filter(issue => issue.severity === 'high');
    const mediumIssues = issues.filter(issue => issue.severity === 'medium');
    
    if (criticalIssues.length > 0) {
      suggestions.push({
        id: 'critical-fix-required',
        title: 'Critical Issues Detected',
        description: 'Your environment has critical issues that prevent normal operation.',
        confidence: 90
      });
    }
    
    if (highIssues.length > 0) {
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