import { logger } from "@/util/log";
import sleep from "@/util/sleep";
import WebSocketProvider from "./provider";

const MAX_FAILS = 100;

/**
 * A wrapper for a WebSocket that automatically reconnects if it gets disconnected (closed).
 */
export default class RobustWebSocket implements WebSocketProvider {
  /**
   * A helper method that waits for the socket to be opened.
   */
  public static async open(url: string): Promise<RobustWebSocket> {
    const rws = new RobustWebSocket(url);
    await rws.openPromise;
    return rws;
  }

  public cancelled: boolean;
  private _ws: WebSocket;
  private _closePromise: Promise<CloseEvent>;
  private _openPromise: Promise<Event>;

  constructor(url: string) {
    this.initSocket(url);
  }

  get openPromise() {
    return this._openPromise;
  }

  get closePromise() {
    return this._closePromise;
  }

  get ws(): WebSocket {
    return this._ws;
  }

  public stop(): void {
    this.cancelled = true;
    this._ws.close(1000);
  }

  private initSocket(url: string, failCount: number = 0) {
    this._ws = new WebSocket(url);

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
        // This is the code used when the connection fails.  In this case, sleep for a bit in case
        // the remote endpoint is down so we don't use excessive CPU with repeated failures.
        if (e.code === 1006) {
          await sleep(2000);
        }
        this.initSocket(url, failCount + 1);
        resolve(e);
      };
    });

    this._openPromise = new Promise<Event>((resolve, _) => {
      const originalOnOpen = this._ws.onopen;

      this._ws.onopen = (e: Event) => {
        if (originalOnOpen) {
          originalOnOpen.call(this._ws, e);
        }
        resolve(e);
      };
    });
  }
}
