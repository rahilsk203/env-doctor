import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

export class FileUtils {
  static async fileExists(filePath: string): Promise<boolean> {
    const accessAsync = promisify(fs.access);
    try {
      await accessAsync(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
  
  static async dirExists(dirPath: string): Promise<boolean> {
    return this.fileExists(dirPath);
  }
  
  static async readJsonFile(filePath: string): Promise<any> {
    const readFileAsync = promisify(fs.readFile);
    try {
      const content = await readFileAsync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to read JSON file ${filePath}: ${error}`);
    }
  }
  
  static async writeJsonFile(filePath: string, data: any): Promise<void> {
    const writeFileAsync = promisify(fs.writeFile);
    const mkdirAsync = promisify(fs.mkdir);
    try {
      // Ensure directory exists
      const dirPath = path.dirname(filePath);
      try {
        await mkdirAsync(dirPath, { recursive: true });
      } catch (err) {
        // Directory might already exist
      }
      await writeFileAsync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      throw new Error(`Failed to write JSON file ${filePath}: ${error}`);
    }
  }
  
  static async removeDir(dirPath: string): Promise<void> {
    const readdirAsync = promisify(fs.readdir);
    const statAsync = promisify(fs.stat);
    const unlinkAsync = promisify(fs.unlink);
    const rmdirAsync = promisify(fs.rmdir);
    
    try {
      const stats = await statAsync(dirPath);
      if (!stats.isDirectory()) {
        await unlinkAsync(dirPath);
        return;
      }
      
      const files = await readdirAsync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const fileStats = await statAsync(filePath);
        
        if (fileStats.isDirectory()) {
          await this.removeDir(filePath);
        } else {
          await unlinkAsync(filePath);
        }
      }
      
      await rmdirAsync(dirPath);
    } catch (error) {
      throw new Error(`Failed to remove directory ${dirPath}: ${error}`);
    }
  }
}