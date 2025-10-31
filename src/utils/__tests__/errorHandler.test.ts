import { ErrorHandler, ErrorReport } from '../errorHandler';

describe('ErrorHandler', () => {
  beforeEach(() => {
    ErrorHandler.clearErrorReports();
  });

  describe('handleError', () => {
    it('should create an error report from a standard Error', () => {
      const error = new Error('Test error');
      const context = {
        type: 'system' as const,
        severity: 'high' as const,
        message: 'Custom message',
        context: { test: 'value' }
      };

      const report = ErrorHandler.handleError(error, context);

      expect(report).toBeDefined();
      expect(report.id).toMatch(/^ERR_\d+_[a-z0-9]+$/);
      expect(report.type).toBe('system');
      expect(report.severity).toBe('high');
      expect(report.message).toBe('Custom message');
      expect(report.context).toEqual({ test: 'value' });
      expect(report.timestamp).toBeInstanceOf(Date);
    });

    it('should create an error report from a string error', () => {
      const error = 'String error';
      const context = {
        type: 'unknown' as const,
        severity: 'low' as const
      };

      const report = ErrorHandler.handleError(error, context);

      expect(report.message).toBe('String error');
    });

    it('should store error reports', () => {
      const error = new Error('Test error');
      const context = {
        type: 'validation' as const,
        severity: 'medium' as const
      };

      ErrorHandler.handleError(error, context);
      const reports = ErrorHandler.getErrorReports();

      expect(reports).toHaveLength(1);
      expect(reports[0].type).toBe('validation');
    });
  });

  describe('wrapAsync', () => {
    it('should return the result of a successful async function', async () => {
      const result = await ErrorHandler.wrapAsync(
        async () => 'success',
        {
          type: 'system',
          severity: 'low'
        }
      );

      expect(result).toBe('success');
    });

    it('should handle errors in async functions', async () => {
      const result = await ErrorHandler.wrapAsync(
        async () => {
          throw new Error('Async error');
        },
        {
          type: 'system',
          severity: 'high',
          message: 'Async operation failed'
        }
      );

      expect(result).toBeNull();
    });
  });

  describe('wrapSync', () => {
    it('should return the result of a successful sync function', () => {
      const result = ErrorHandler.wrapSync(
        () => 'success',
        {
          type: 'system',
          severity: 'low'
        }
      );

      expect(result).toBe('success');
    });

    it('should handle errors in sync functions', () => {
      const result = ErrorHandler.wrapSync(
        () => {
          throw new Error('Sync error');
        },
        {
          type: 'system',
          severity: 'high',
          message: 'Sync operation failed'
        }
      );

      expect(result).toBeNull();
    });
  });

  describe('listeners', () => {
    it('should notify listeners of new error reports', () => {
      const listener = jest.fn();
      ErrorHandler.addListener(listener);

      const error = new Error('Test error');
      const context = {
        type: 'system' as const,
        severity: 'low' as const
      };

      ErrorHandler.handleError(error, context);

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        type: 'system',
        message: 'Test error'
      }));

      ErrorHandler.removeListener(listener);
    });
  });
});