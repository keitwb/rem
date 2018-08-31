export enum LogLevel {
  Debug,
  Info,
  Warning,
  Error,
}

export interface LogEntry {
  message: string;
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

  public error(msg: string) {
    this.entryForLevel(LogLevel.Error, msg);
  }

  public warning(msg: string) {
    this.entryForLevel(LogLevel.Warning, msg);
  }

  public info(msg: string) {
    this.entryForLevel(LogLevel.Info, msg);
  }

  public debug(msg: string) {
    this.entryForLevel(LogLevel.Debug, msg);
  }

  private entryForLevel(level: LogLevel, msg: string) {
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
