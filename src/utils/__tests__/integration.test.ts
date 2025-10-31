import { ErrorHandler } from '../errorHandler';
import { FileUtils } from '../fs';
import { exec } from '../exec';
import { Logger } from '../logger';

// Mock console.log to capture output
const originalConsoleLog = console.log;
const consoleLogMock = jest.fn();
console.log = consoleLogMock;

describe('Integration Test for Error Handling', () => {
  beforeEach(() => {
    ErrorHandler.clearErrorReports();
    consoleLogMock.mockClear();
  });

  afterAll(() => {
    // Restore original console.log
    console.log = originalConsoleLog;
  });

  it('should handle a complete error workflow', async () => {
    // Set up error listener to capture errors
    const errorListener = jest.fn();
    ErrorHandler.addListener(errorListener);

    try {
      // Simulate a complex workflow with multiple potential failure points
      Logger.verboseMode = true;
      
      // 1. Try to read a configuration file that doesn't exist
      Logger.log('Attempting to read config file', 'info');
      const configFile = await FileUtils.readJsonFile('/tmp/non-existent-config.json');
      
      // 2. Try to execute a command that doesn't exist
      Logger.log('Attempting to execute invalid command', 'info');
      const commandResult = await exec('non-existent-command-12345');
      
      // 3. Try to write to an invalid directory
      Logger.log('Attempting to write to invalid directory', 'info');
      await FileUtils.writeJsonFile('/invalid/path/config.json', { test: 'data' });
      
      // If we reach here, something went wrong - all operations should have failed
      fail('Expected at least one operation to fail');
    } catch (error) {
      // Handle the error with our error handler
      const errorReport = ErrorHandler.handleError(error, {
        type: 'system',
        severity: 'high',
        message: 'Integration test workflow failed',
        recoverySuggestion: 'Check file permissions and command availability'
      });
      
      // Verify that the error was properly captured
      expect(errorReport).toBeDefined();
      expect(errorReport.type).toBe('system');
      expect(errorReport.severity).toBe('high');
      expect(errorReport.message).toBe('Integration test workflow failed');
      
      // Verify that the error listener was notified
      expect(errorListener).toHaveBeenCalledWith(expect.objectContaining({
        type: 'system',
        severity: 'high',
        message: 'Integration test workflow failed'
      }));
      
      // Verify that logging occurred
      expect(consoleLogMock).toHaveBeenCalledWith(
        expect.stringContaining('Integration test workflow failed')
      );
    } finally {
      // Clean up
      ErrorHandler.removeListener(errorListener);
    }
    
    // Verify that all errors were captured
    const reports = ErrorHandler.getErrorReports();
    expect(reports.length).toBeGreaterThanOrEqual(1);
    
    // Verify error report structure
    const lastReport = reports[reports.length - 1];
    expect(lastReport.id).toMatch(/^ERR_\d+_[a-z0-9]+$/);
    expect(lastReport.timestamp).toBeInstanceOf(Date);
    expect(lastReport.recoverySuggestion).toBe('Check file permissions and command availability');
  });

  it('should handle critical errors gracefully', () => {
    // Mock process.exit to prevent actual exit
    const originalExit = process.exit;
    (process as any).exit = jest.fn();
    
    try {
      // Simulate a critical error
      const criticalError = new Error('Critical system failure');
      ErrorHandler.handleCriticalError(criticalError, {
        message: 'System encountered a critical failure',
        recoverySuggestion: 'Restart the application and check system resources'
      });
      
      // Verify that process.exit was called
      expect((process as any).exit).toHaveBeenCalledWith(1);
      
      // Verify that the error was logged
      expect(consoleLogMock).toHaveBeenCalledWith(
        expect.stringContaining('System encountered a critical failure')
      );
    } finally {
      // Restore original process.exit
      (process as any).exit = originalExit;
    }
    
    // Verify that the error was captured
    const reports = ErrorHandler.getErrorReports();
    expect(reports).toHaveLength(1);
    expect(reports[0].severity).toBe('critical');
  });
});