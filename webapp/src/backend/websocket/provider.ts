/**
 * This should wrap a WebSocket object (ws) that automatically gets replaced if the connection
 * closes.
 */
export default interface WebSocketProvider {
  readonly openPromise: Promise<Event>;
  readonly closePromise: Promise<CloseEvent>;
  readonly cancelled: boolean;
  readonly ws: WebSocket;
}
