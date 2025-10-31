import fs from 'fs-extra';
import path from 'path';

export class FileUtils {
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  static async dirExists(dirPath: string): Promise<boolean> {
    return this.fileExists(dirPath);
  }
  
  static async readJsonFile(filePath: string): Promise<any> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to read JSON file ${filePath}: ${error}`);
    }
  }
  
  static async writeJsonFile(filePath: string, data: any): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeJson(filePath, data, { spaces: 2 });
    } catch (error) {
      throw new Error(`Failed to write JSON file ${filePath}: ${error}`);
    }
  }
  
  static async removeDir(dirPath: string): Promise<void> {
    try {
      await fs.remove(dirPath);
    } catch (error) {
      throw new Error(`Failed to remove directory ${dirPath}: ${error}`);
    }
  }
}