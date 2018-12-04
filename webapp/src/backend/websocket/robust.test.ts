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

    const rs = new RobustWebSocket(url);

    await rs.ws;

    expect(connected).toBeTruthy();

    const closePromise = rs.closePromise;
    server.close({ code: 1006 });

    connected = false;

    server = new Server(url);
    server.start();
    server.on("connection", () => {
      connected = true;
    });

    // it waits 5s before reconnecting
    jest.advanceTimersByTime(5000);
    await closePromise;

    await rs.ws;
    expect(connected).toBeTruthy();

    const messages = [] as string[];
    rs.setOnMessage(event => {
      messages.push(event.data);
    });
    server.send("test");

    expect(messages).toContain("test");
  });

  test("does not reconnect if the stop method is called", async () => {
    const rs = new RobustWebSocket(url);

    await rs.ws;

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
