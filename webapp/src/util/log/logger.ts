export enum LogLevel {
  Debug,
  Info,
  Warning,
  Error,
}

export const LogLevelNames = new Map<LogLevel, string>([
  [LogLevel.Debug, "DEBUG"],
  [LogLevel.Info, "INFO"],
  [LogLevel.Warning, "WARNING"],
  [LogLevel.Error, "ERROR"],
]);

export interface LogEntry {
  message: any[];
  timestamp: Date;
  severity: LogLevel;
}

export interface LogHandler {
  receive(e: LogEntry): void;
}

export class Logger {
  private handlers: LogHandler[] = [];
  private level: LogLevel = LogLevel.Info;

  public addHandler(handler: LogHandler) {
    this.handlers.push(handler);
  }

  public setLevel(level: LogLevel) {
    this.level = level;
  }

  public error(...msg: any[]) {
    this.entryForLevel(LogLevel.Error, msg);
  }

  public warning(...msg: any[]) {
    this.entryForLevel(LogLevel.Warning, msg);
  }

  public info(...msg: any[]) {
    this.entryForLevel(LogLevel.Info, msg);
  }

  public debug(...msg: any[]) {
    this.entryForLevel(LogLevel.Debug, msg);
  }

  private entryForLevel(level: LogLevel, msg: any[]) {
    if (level < this.level) {
      return;
    }

    this.handlers.forEach(h => {
      h.receive({
        message: msg,
        severity: level,
        timestamp: new Date(),
      });
    });
  }
}

export const logger = new Logger();
