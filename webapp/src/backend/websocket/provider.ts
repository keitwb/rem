/**
 * This should wrap a WebSocket object (ws) that automatically gets replaced if the connection
 * closes.
 */
export default interface WebSocketProvider {
  readonly closePromise: Promise<CloseEvent>;
  readonly cancelled: boolean;
  readonly ws: Promise<WebSocket>;
  setOnMessage(handler: (msg: MessageEvent) => void): void;
}
