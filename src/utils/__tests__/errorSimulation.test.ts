import { ErrorHandler } from '../errorHandler';
import { FileUtils } from '../fs';

describe('Error Simulation and Handling', () => {
  beforeEach(() => {
    ErrorHandler.clearErrorReports();
  });

  describe('File System Errors', () => {
    it('should handle file not found errors gracefully', async () => {
      const nonExistentFile = '/tmp/non-existent-file-12345.json';
      
      // Test fileExists with non-existent file
      const exists = await FileUtils.fileExists(nonExistentFile);
      expect(exists).toBe(false);
      
      // Test readJsonFile with non-existent file
      try {
        await FileUtils.readJsonFile(nonExistentFile);
        fail('Should have thrown an error');
      } catch (error) {
        const errorReport = ErrorHandler.handleError(error, {
          type: 'file',
          severity: 'medium',
          message: 'Failed to read non-existent JSON file',
          context: { filePath: nonExistentFile }
        });
        
        expect(errorReport.type).toBe('file');
        expect(errorReport.severity).toBe('medium');
        expect(errorReport.message).toContain('Failed to read non-existent JSON file');
      }
    });

    it('should handle directory removal errors gracefully', async () => {
      const nonExistentDir = '/tmp/non-existent-directory-12345';
      
      try {
        await FileUtils.removeDir(nonExistentDir);
        // This might not throw an error depending on the implementation
      } catch (error) {
        const errorReport = ErrorHandler.handleError(error, {
          type: 'file',
          severity: 'low',
          message: 'Failed to remove non-existent directory',
          context: { dirPath: nonExistentDir }
        });
        
        expect(errorReport.type).toBe('file');
        expect(errorReport.severity).toBe('low');
      }
    });
  });

  describe('Critical Error Handling', () => {
    it('should capture and report critical errors', () => {
      const criticalError = new Error('Critical system failure');
      
      // Mock process.exit to prevent actual exit
      const originalExit = process.exit;
      (process as any).exit = jest.fn();
      
      try {
        ErrorHandler.handleCriticalError(criticalError, {
          message: 'System encountered a critical failure',
          recoverySuggestion: 'Restart the application and check system resources'
        });
      } finally {
        // Restore original process.exit
        (process as any).exit = originalExit;
      }
      
      const reports = ErrorHandler.getErrorReports();
      expect(reports).toHaveLength(1);
      expect(reports[0].severity).toBe('critical');
      expect(reports[0].message).toBe('System encountered a critical failure');
    });
  });

  describe('Async Error Wrapping', () => {
    it('should handle async function errors', async () => {
      const result = await ErrorHandler.wrapAsync(
        async () => {
          throw new Error('Simulated async error');
        },
        {
          type: 'system',
          severity: 'high',
          message: 'Async operation failed',
          recoverySuggestion: 'Retry the operation or check system resources'
        }
      );
      
      expect(result).toBeNull();
      
      const reports = ErrorHandler.getErrorReports();
      expect(reports).toHaveLength(1);
      expect(reports[0].type).toBe('system');
      expect(reports[0].severity).toBe('high');
    });
  });

  describe('Sync Error Wrapping', () => {
    it('should handle sync function errors', () => {
      const result = ErrorHandler.wrapSync(
        () => {
          throw new Error('Simulated sync error');
        },
        {
          type: 'validation',
          severity: 'medium',
          message: 'Sync operation failed',
          recoverySuggestion: 'Check input parameters'
        }
      );
      
      expect(result).toBeNull();
      
      const reports = ErrorHandler.getErrorReports();
      expect(reports).toHaveLength(1);
      expect(reports[0].type).toBe('validation');
      expect(reports[0].severity).toBe('medium');
    });
  });
});