import { Injectable, Inject, InjectionToken }        from '@angular/core';
import { Subject }           from 'rxjs/Subject';
import { Observable }           from 'rxjs/Observable';

export type LogLevel = "error" | "warning" | "info" | "debug";

export interface LogEntry {
  message: string;
  timestamp: Date;
  severity: LogLevel;
}

export interface LogHandler {
  receive(LogEntry);
}

const LOG_HANDLERS = new InjectionToken<LogHandler>('LogHandlers');

export class Logger {
  private _entry$ = new Subject<LogEntry>();

  constructor(@Inject(LOG_HANDLERS) handlers: LogHandler[]) {
    this._entry$
      .do(en => { handlers.forEach(h => { h.receive(en); }); })
      .subscribe();
  }

  get entry$(): Observable<LogEntry> {
    return this._entry$;
  }

  entryForLevel(level: LogLevel, msg: string) {
    this._entry$.next({
      message: msg,
      timestamp: new Date(),
      severity: level,
    });
  }

  error(msg: string) { this.entryForLevel("error", msg); }
  warning(msg: string) { this.entryForLevel("warning", msg); }
  info(msg: string) { this.entryForLevel("info", msg); }
  debug(msg: string) { this.entryForLevel("debug", msg); }
}

class ConsoleLogHandler implements LogHandler {
  receive(en: LogEntry) {
    if (en.severity === "error") {
      console.error(en.message);
    } else {
      console.log(`[${en.severity}] ${en.message}`);
    }
  }
}

export const LogHandlersProvider = [
  { provide: LOG_HANDLERS, useClass: ConsoleLogHandler, multi: true },
];
