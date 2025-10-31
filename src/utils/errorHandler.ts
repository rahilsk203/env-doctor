import { Logger } from './logger';

export interface ErrorReport {
  id: string;
  type: 'system' | 'validation' | 'network' | 'file' | 'command' | 'unknown';
  message: string;
  stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  context?: Record<string, any>;
  recoverySuggestion?: string;
}

export class ErrorHandler {
  private static errorReports: ErrorReport[] = [];
  private static listeners: Array<(error: ErrorReport) => void> = [];

  /**
   * Handle an error and generate a standardized error report
   */
  static handleError(
    error: any,
    context: { 
      type: ErrorReport['type'], 
      severity: ErrorReport['severity'],
      message?: string,
      context?: Record<string, any>,
      recoverySuggestion?: string
    }
  ): ErrorReport {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      type: context.type,
      message: context.message || (error instanceof Error ? error.message : String(error)),
      stack: error instanceof Error ? error.stack : undefined,
      severity: context.severity,
      timestamp: new Date(),
      context: context.context,
      recoverySuggestion: context.recoverySuggestion
    };

    // Store the error report
    this.errorReports.push(errorReport);
    
    // Notify listeners
    this.notifyListeners(errorReport);
    
    // Log the error
    Logger.log(`Error [${errorReport.id}]: ${errorReport.message}`, 'error');
    if (errorReport.stack) {
      Logger.verbose(`Stack trace: ${errorReport.stack}`);
    }
    
    return errorReport;
  }

  /**
   * Handle a critical error that should terminate the application
   */
  static handleCriticalError(
    error: any,
    context: { 
      message?: string,
      context?: Record<string, any>,
      recoverySuggestion?: string
    } = {}
  ): never {
    const errorReport = this.handleError(error, {
      type: 'unknown',
      severity: 'critical',
      message: context.message,
      context: context.context,
      recoverySuggestion: context.recoverySuggestion
    });
    
    console.error(`Critical Error [${errorReport.id}]: ${errorReport.message}`);
    if (errorReport.recoverySuggestion) {
      console.error(`Recovery Suggestion: ${errorReport.recoverySuggestion}`);
    }
    
    process.exit(1);
  }

  /**
   * Wrap an async function with error handling
   */
  static async wrapAsync<T>(
    fn: () => Promise<T>,
    context: {
      type: ErrorReport['type'],
      severity: ErrorReport['severity'],
      message?: string,
      context?: Record<string, any>,
      recoverySuggestion?: string
    }
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error, context);
      return null;
    }
  }

  /**
   * Wrap a synchronous function with error handling
   */
  static wrapSync<T>(
    fn: () => T,
    context: {
      type: ErrorReport['type'],
      severity: ErrorReport['severity'],
      message?: string,
      context?: Record<string, any>,
      recoverySuggestion?: string
    }
  ): T | null {
    try {
      return fn();
    } catch (error) {
      this.handleError(error, context);
      return null;
    }
  }

  /**
   * Add a listener for error reports
   */
  static addListener(listener: (error: ErrorReport) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a listener
   */
  static removeListener(listener: (error: ErrorReport) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Get all error reports
   */
  static getErrorReports(): ErrorReport[] {
    return [...this.errorReports];
  }

  /**
   * Clear error reports
   */
  static clearErrorReports(): void {
    this.errorReports = [];
  }

  /**
   * Generate a unique error ID
   */
  private static generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Notify all listeners of a new error report
   */
  private static notifyListeners(errorReport: ErrorReport): void {
    for (const listener of this.listeners) {
      try {
        listener(errorReport);
      } catch (listenerError) {
        // Don't let listener errors break the error handling system
        console.error('Error in error listener:', listenerError);
      }
    }
  }
}