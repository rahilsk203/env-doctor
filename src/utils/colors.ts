// ANSI escape codes for colors
export const colors = {
  // Regular colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Bright colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
  
  // Formatting
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  strikethrough: '\x1b[9m'
};

// Color functions
export const colorize = {
  black: (text: string) => `${colors.black}${text}${colors.reset}`,
  red: (text: string) => `${colors.red}${text}${colors.reset}`,
  green: (text: string) => `${colors.green}${text}${colors.reset}`,
  yellow: (text: string) => `${colors.yellow}${text}${colors.reset}`,
  blue: (text: string) => `${colors.blue}${text}${colors.reset}`,
  magenta: (text: string) => `${colors.magenta}${text}${colors.reset}`,
  cyan: (text: string) => `${colors.cyan}${text}${colors.reset}`,
  white: (text: string) => `${colors.white}${text}${colors.reset}`,
  gray: (text: string) => `${colors.gray}${text}${colors.reset}`,
  
  // Bright colors
  brightRed: (text: string) => `${colors.brightRed}${text}${colors.reset}`,
  brightGreen: (text: string) => `${colors.brightGreen}${text}${colors.reset}`,
  brightYellow: (text: string) => `${colors.brightYellow}${text}${colors.reset}`,
  brightBlue: (text: string) => `${colors.brightBlue}${text}${colors.reset}`,
  brightMagenta: (text: string) => `${colors.brightMagenta}${text}${colors.reset}`,
  brightCyan: (text: string) => `${colors.brightCyan}${text}${colors.reset}`,
  brightWhite: (text: string) => `${colors.brightWhite}${text}${colors.reset}`,  // Formatting
  
  // Formatting
  bold: (text: string) => `${colors.bold}${text}${colors.reset}`,
  dim: (text: string) => `${colors.dim}${text}${colors.reset}`,
  italic: (text: string) => `${colors.italic}${text}${colors.reset}`,
  underline: (text: string) => `${colors.underline}${text}${colors.reset}`,
  blink: (text: string) => `${colors.blink}${text}${colors.reset}`,
  reverse: (text: string) => `${colors.reverse}${text}${colors.reset}`,
  strikethrough: (text: string) => `${colors.strikethrough}${text}${colors.reset}`
};