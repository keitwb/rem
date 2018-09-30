export default interface WebSocketProvider {
  readonly openPromise: Promise<Event>;
  readonly closePromise: Promise<CloseEvent>;
  readonly cancelled: boolean;
  readonly ws: WebSocket;
}
