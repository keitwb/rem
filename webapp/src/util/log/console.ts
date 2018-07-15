import { log, LogEntry, LogHandler } from "./logger";

class ConsoleLogHandler implements LogHandler {
  // tslint:disable:no-console
  public receive(en: LogEntry) {
    if (en.severity === "error") {
      console.error(en.message);
    } else {
      console.log(`[${en.severity}] ${en.message}`);
    }
  }
}

log.addHandler(new ConsoleLogHandler());
