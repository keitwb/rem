export type LogLevel = 'error' | 'warning' | 'info' | 'debug';

export interface LogEntry {
  message: string;
  timestamp: Date;
  severity: LogLevel;
}

export interface LogHandler {
  receive(e: LogEntry): void;
}

export class Logger {
  private handlers: LogHandler[];

  addHandler(handler: LogHandler) {
    this.handlers.push(handler);
  }

  entryForLevel(level: LogLevel, msg: string) {
    this.handlers.forEach(h => { h.receive({
      message: msg,
      timestamp: new Date(),
      severity: level,
    }); })
  }

  error(msg: string) { this.entryForLevel('error', msg); }
  warning(msg: string) { this.entryForLevel('warning', msg); }
  info(msg: string) { this.entryForLevel('info', msg); }
  debug(msg: string) { this.entryForLevel('debug', msg); }
}

export const logger = new Logger();
export const log = logger;

class ConsoleLogHandler implements LogHandler {
  receive(en: LogEntry) {
    if (en.severity === 'error') {
      console.error(en.message);
    } else {
      console.log(`[${en.severity}] ${en.message}`);
    }
  }
}

logger.addHandler(new ConsoleLogHandler());
