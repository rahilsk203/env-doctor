import { SystemScanner } from '../system';

describe('SystemScanner', () => {
  describe('scan', () => {
    it('should return environment information', async () => {
      const result = await SystemScanner.scan();
      
      expect(result).toHaveProperty('nodeVersion');
      expect(result).toHaveProperty('npmVersion');
      expect(result).toHaveProperty('os');
      expect(result).toHaveProperty('arch');
      expect(result).toHaveProperty('shell');
      expect(result).toHaveProperty('isWSL');
      expect(result).toHaveProperty('isDocker');
      expect(result).toHaveProperty('isCI');
      
      // Check that nodeVersion starts with 'v'
      expect(result.nodeVersion).toMatch(/^v\d+\.\d+\.\d+/);
      
      // Check that os is one of the expected values
      expect(['Linux', 'Windows', 'macOS']).toContain(result.os);
    });
  });
});