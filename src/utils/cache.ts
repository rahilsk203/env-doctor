import path from 'path';
import os from 'os';
import { FileUtils } from './fs';
import { ScanResult } from '../types';

export class CacheManager {
  private static readonly CACHE_DIR = path.join(os.homedir(), '.envdoctor');
  private static readonly REPORT_FILE = path.join(CacheManager.CACHE_DIR, 'report.json');
  
  static async saveReport(report: ScanResult): Promise<void> {
    try {
      await FileUtils.writeJsonFile(this.REPORT_FILE, report);
    } catch (error) {
      throw new Error(`Failed to save report: ${error}`);
    }
  }
  
  static async loadReport(): Promise<ScanResult | null> {
    try {
      if (!(await FileUtils.fileExists(this.REPORT_FILE))) {
        return null;
      }
      return await FileUtils.readJsonFile(this.REPORT_FILE);
    } catch (error) {
      throw new Error(`Failed to load report: ${error}`);
    }
  }
  
  static async clearCache(): Promise<void> {
    try {
      if (await FileUtils.dirExists(this.CACHE_DIR)) {
        await FileUtils.removeDir(this.CACHE_DIR);
      }
    } catch (error) {
      throw new Error(`Failed to clear cache: ${error}`);
    }
  }
}