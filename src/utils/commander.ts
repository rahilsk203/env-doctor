// Custom implementation of commander.js functionality
export class Command {
  private commands: Map<string, CommandInfo> = new Map();
  private programName: string = 'cli';
  private programDescription: string = '';
  private programVersion: string = '1.0.0';
  
  constructor() {}
  
  name(name: string): Command {
    this.programName = name;
    return this;
  }
  
  description(description: string): Command {
    this.programDescription = description;
    return this;
  }
  
  version(version: string): Command {
    this.programVersion = version;
    return this;
  }
  
  command(name: string): CommandInstance {
    const commandInstance = new CommandInstance(name, this);
    return commandInstance;
  }
  
  addCommand(name: string, info: CommandInfo): void {
    this.commands.set(name, info);
  }
  
  parse(): void {
    const args = process.argv.slice(2);
    
    // Handle help
    if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
      this.showHelp();
      return;
    }
    
    // Handle version
    if (args.includes('-V') || args.includes('--version')) {
      console.log(this.programVersion);
      return;
    }
    
    // Find and execute command
    const commandName = args[0];
    const commandInfo = this.commands.get(commandName);
    
    if (!commandInfo) {
      console.error(`Unknown command: ${commandName}`);
      this.showHelp();
      process.exit(1);
    }
    
    // Parse options
    const options: Record<string, any> = {};
    const remainingArgs: string[] = [];
    
    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('-')) {
        // Find option definition
        const optionDef = commandInfo.options.find(opt => 
          opt.short === arg || opt.long === arg
        );
        
        if (optionDef) {
          if (optionDef.type === 'boolean') {
            options[optionDef.name] = true;
          } else if (i + 1 < args.length) {
            options[optionDef.name] = args[++i];
          }
        }
      } else {
        remainingArgs.push(arg);
      }
    }
    
    // Execute action
    if (commandInfo.action) {
      const result: any = commandInfo.action(options, remainingArgs);
      // Handle async actions
      if (result && result.catch) {
        result.catch((error: any) => {
          console.error('Command failed:', error);
          process.exit(1);
        });
      }
    }
  }
  
  private showHelp(): void {
    console.log(`Usage: ${this.programName} [command] [options]\n`);
    console.log(this.programDescription);
    console.log(`\nVersion: ${this.programVersion}\n`);
    
    if (this.commands.size > 0) {
      console.log('Commands:');
      for (const [name, info] of this.commands) {
        console.log(`  ${name} - ${info.description}`);
      }
      console.log('\nFor more information on a command, run:');
      console.log(`  ${this.programName} [command] --help`);
    }
  }
}

interface CommandInfo {
  name: string;
  description: string;
  options: OptionInfo[];
  action: ((options: any, args: string[]) => void) | null;
  instance: CommandInstance;
}

interface OptionInfo {
  name: string;
  short: string;
  long: string;
  description: string;
  type: 'boolean' | 'string';
}

export class CommandInstance {
  private parent: Command;
  private name: string;
  private descriptionText: string = '';
  private options: OptionInfo[] = [];
  private actionHandler: ((options: any, args: string[]) => void) | null = null;
  
  constructor(name: string, parent: Command) {
    this.name = name;
    this.parent = parent;
  }
  
  description(description: string): CommandInstance {
    this.descriptionText = description;
    return this;
  }
  
  option(flags: string, description: string): CommandInstance {
    // Parse flags like "-v, --verbose"
    const flagParts = flags.split(',').map(part => part.trim());
    let short = '';
    let long = '';
    
    for (const part of flagParts) {
      if (part.startsWith('--')) {
        long = part;
      } else if (part.startsWith('-')) {
        short = part;
      }
    }
    
    // Determine option type based on description or default to boolean
    const type: 'boolean' | 'string' = description.toLowerCase().includes('path') || 
                                      description.toLowerCase().includes('file') ||
                                      description.toLowerCase().includes('dir') ||
                                      flags.includes('<') ? 'string' : 'boolean';
    
    // Extract name from long flag or short flag
    let name = '';
    if (long) {
      name = long.replace('--', '').replace(/-/g, '');
    } else if (short) {
      name = short.replace('-', '');
    }
    
    this.options.push({
      name,
      short,
      long,
      description,
      type
    });
    
    return this;
  }
  
  action(handler: (options: any, args: string[]) => void): CommandInstance {
    this.actionHandler = handler;
    // Register the command with the parent
    this.parent.addCommand(this.name, {
      name: this.name,
      description: this.descriptionText,
      options: this.options,
      action: this.actionHandler,
      instance: this
    });
    return this;
  }
}