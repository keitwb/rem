import { logger } from "@/util/log";
import sleep from "@/util/sleep";
import WebSocketProvider from "./provider";

const MAX_FAILS = 100;
const CONNECTION_FAILURE_RETRY_DELAY_MS = 5000;

/**
 * A wrapper for a WebSocket that automatically reconnects if it gets disconnected (closed).
 */
export default class RobustWebSocket implements WebSocketProvider {
  public cancelled: boolean;
  private _ws: WebSocket;
  private _closePromise: Promise<CloseEvent>;
  private _openPromise: Promise<WebSocket>;
  private _onMessageHandler: (msg: MessageEvent) => void;

  constructor(url: string) {
    this.initSocket(url);
  }

  get closePromise() {
    return this._closePromise;
  }

  get ws(): Promise<WebSocket> {
    return this._openPromise;
  }

  public stop(): void {
    this.cancelled = true;
    this._ws.close(1000);
  }

  public setOnMessage(handler: (msg: MessageEvent) => void) {
    // Save it for future websocket instances
    this._onMessageHandler = handler;
    if (this._ws) {
      this._ws.onmessage = handler;
    }
  }

  private initSocket(url: string, failCount: number = 0, delayMS: number = 0) {
    this._openPromise = new Promise<WebSocket>(async (resolve, _) => {
      if (delayMS > 0) {
        await sleep(delayMS);
      }

      this._ws = new WebSocket(url);

      const originalOnOpen = this._ws.onopen;

      this._ws.onopen = (e: Event) => {
        failCount = 0;

        if (originalOnOpen) {
          originalOnOpen.call(this._ws, e);
        }

        resolve(this._ws);

        this._ws.onmessage = this._onMessageHandler;
      };
    });

    this._closePromise = new Promise<CloseEvent>((resolve, reject) => {
      this._ws.onclose = async (e: CloseEvent) => {
        if (this.cancelled) {
          resolve(e);
          return;
        }

        if (failCount > MAX_FAILS) {
          logger.error("Websocket closed too many times, giving up");
          reject(e);
          return;
        }

        logger.error(`WebSocket closed (${e.code}/${e.reason}), reestablishing connection...`);

        let newDelay = 0;
        // This is the code used when the connection fails.  In this case, sleep for a bit in case
        // the remote endpoint is down so we don't use excessive CPU with repeated failures.
        if (e.code === 1006) {
          newDelay = CONNECTION_FAILURE_RETRY_DELAY_MS;
        }
        this.initSocket(url, failCount + 1, newDelay);
        resolve(e);
      };
    });
  }
}
