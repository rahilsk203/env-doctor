import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function execCommand(command: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(command);
    return stdout ? stdout : stderr;
  } catch (error) {
    throw new Error(`Command failed: ${command} - ${error}`);
  }
}