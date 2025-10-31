import { ErrorHandler } from '../errorHandler';
import { FileUtils } from '../fs';
import { exec } from '../exec';

describe('Stress Test for Error Handling', () => {
  beforeEach(() => {
    ErrorHandler.clearErrorReports();
  });

  it('should handle multiple concurrent errors gracefully', async () => {
    // Simulate multiple concurrent file operations that might fail
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      const promise = ErrorHandler.wrapAsync(
        async () => {
          // Try to read a non-existent file
          await FileUtils.readJsonFile(`/tmp/non-existent-file-${i}.json`);
        },
        {
          type: 'file',
          severity: 'low',
          message: `Concurrent file read error ${i}`,
          context: { iteration: i }
        }
      );
      promises.push(promise);
    }
    
    // Wait for all operations to complete
    await Promise.all(promises);
    
    // Check that all errors were captured
    const reports = ErrorHandler.getErrorReports();
    expect(reports).toHaveLength(10);
    
    // Check that all reports have the correct type and severity
    for (const report of reports) {
      expect(report.type).toBe('file');
      expect(report.severity).toBe('low');
      expect(report.message).toMatch(/Concurrent file read error \d+/);
    }
  });

  it('should handle mixed error types', async () => {
    // Simulate different types of errors
    const fileError = ErrorHandler.wrapAsync(
      async () => {
        await FileUtils.readJsonFile('/tmp/non-existent-file.json');
      },
      {
        type: 'file',
        severity: 'medium',
        message: 'File error'
      }
    );
    
    const commandError = ErrorHandler.wrapAsync(
      async () => {
        const result = await exec('non-existent-command-12345');
        if (result.code !== 0) {
          throw new Error(`Command failed with code ${result.code}: ${result.stderr}`);
        }
      },
      {
        type: 'command',
        severity: 'high',
        message: 'Command execution error'
      }
    );
    
    const validationError = ErrorHandler.wrapSync(
      () => {
        throw new Error('Validation failed');
      },
      {
        type: 'validation',
        severity: 'medium',
        message: 'Validation error'
      }
    );
    
    // Wait for all operations
    await Promise.all([fileError, commandError]);
    validationError; // This is sync, so it's already done
    
    // Check that all errors were captured
    const reports = ErrorHandler.getErrorReports();
    expect(reports).toHaveLength(3);
    
    // Check error types
    const fileReport = reports.find(r => r.message === 'File error');
    const commandReport = reports.find(r => r.message === 'Command execution error');
    const validationReport = reports.find(r => r.message === 'Validation error');
    
    expect(fileReport).toBeDefined();
    expect(fileReport?.type).toBe('file');
    
    expect(commandReport).toBeDefined();
    expect(commandReport?.type).toBe('command');
    
    expect(validationReport).toBeDefined();
    expect(validationReport?.type).toBe('validation');
  });

  it('should handle nested error scenarios', async () => {
    // Simulate an error that occurs while handling another error
    const result = await ErrorHandler.wrapAsync(
      async () => {
        try {
          await FileUtils.readJsonFile('/tmp/non-existent-file.json');
        } catch (innerError) {
          // Try to handle the error, but this also fails
          // We need to make sure this throws an error that gets caught
          throw new Error('Nested error occurred');
        }
      },
      {
        type: 'system',
        severity: 'high',
        message: 'Nested error scenario'
      }
    );
    
    // The result should be null because an error occurred
    expect(result).toBeNull();
    
    // We should have captured at least one error
    const reports = ErrorHandler.getErrorReports();
    expect(reports.length).toBeGreaterThanOrEqual(1);
    
    // The last error should be about the nested failure
    const lastReport = reports[reports.length - 1];
    expect(lastReport.type).toBe('system');
    expect(lastReport.message).toBe('Nested error scenario');
  });

  it('should handle very large error messages', async () => {
    const largeErrorMessage = 'A'.repeat(10000); // 10KB error message
    
    const result = await ErrorHandler.wrapAsync(
      async () => {
        throw new Error(largeErrorMessage);
      },
      {
        type: 'system',
        severity: 'critical',
        message: 'Large error message test'
      }
    );
    
    expect(result).toBeNull();
    
    const reports = ErrorHandler.getErrorReports();
    expect(reports).toHaveLength(1);
    
    const report = reports[0];
    expect(report.type).toBe('system');
    expect(report.severity).toBe('critical');
    expect(report.message).toBe('Large error message test');
  });
});