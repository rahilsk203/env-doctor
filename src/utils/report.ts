import { EnvironmentReport } from '../types';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const REPORT_DIR = '.envdoctor';
const REPORT_FILE = 'report.json';

export async function generateReport(report: EnvironmentReport): Promise<void> {
  try {
    // Create directory if it doesn't exist
    if (!existsSync(REPORT_DIR)) {
      mkdirSync(REPORT_DIR);
    }

    // Write report to file
    const reportPath = join(REPORT_DIR, REPORT_FILE);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
  } catch (error) {
    throw new Error(`Failed to generate report: ${error}`);
  }
}

export async function loadLastReport(): Promise<EnvironmentReport | null> {
  try {
    const reportPath = join(REPORT_DIR, REPORT_FILE);
    if (!existsSync(reportPath)) {
      return null;
    }

    const reportData = readFileSync(reportPath, 'utf8');
    return JSON.parse(reportData);
  } catch (error) {
    throw new Error(`Failed to load report: ${error}`);
  }
}