import { Server, WebSocket } from "mock-websocket";

import RobustWebSocket from "./robust";

(global as any).WebSocket = WebSocket;

describe("RobustWebSocket Client", () => {
  const url = "ws://localhost:8080";
  let server: Server;

  beforeEach(() => {
    server = new Server(url);
    jest.useFakeTimers();
  });

  afterEach(() => {
    server.stop();
  });

  test("connects to the endpoint upon opening", async () => {
    let connected = false;
    server.on("connection", () => {
      connected = true;
    });

    const rs = await RobustWebSocket.open(url);
    expect(rs.ws).toBeTruthy();

    await rs.openPromise;
    expect(connected).toBeTruthy();

    server.close({ code: 1006 });

    connected = false;

    server = new Server(url);
    server.start();
    server.on("connection", () => {
      connected = true;
    });

    // it waits 2s before reconnecting
    jest.advanceTimersByTime(2000);
    await rs.closePromise;

    await rs.openPromise;
    expect(connected).toBeTruthy();

    const messages = [] as string[];
    rs.ws.onmessage = event => {
      messages.push(event.data);
    };
    server.send("test");

    expect(messages).toContain("test");
  });

  test("does not reconnect if the stop method is called", async () => {
    const rs = await RobustWebSocket.open(url);

    await rs.openPromise;

    let connected = false;
    server.on("connection", () => {
      connected = true;
    });

    let serverClosed = false;
    server.on("close", () => {
      serverClosed = true;
    });

    rs.stop();
    await rs.closePromise;

    jest.runAllTimers();

    expect(serverClosed).toBeTruthy();
    expect(connected).toBeFalsy();
    expect(rs.cancelled).toBeTruthy();
  });
});
