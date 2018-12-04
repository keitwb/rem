import { Server, WebSocket } from "mock-websocket";

import RobustWebSocket from "./robust";
import streamWebSocket from "./stream";

(global as any).WebSocket = WebSocket;

describe("streamWebSocket", () => {
  const url = "ws://localhost:8080";
  let server: Server;

  beforeEach(() => {
    server = new Server(url);
  });

  afterEach(() => {
    server.stop();
  });

  test("yields all messages received in order", async () => {
    const rs = new RobustWebSocket(url);

    setTimeout(() => {
      server.send("a");
      server.send("b");
      setTimeout(() => {
        server.send("c");
        setTimeout(() => {
          rs.stop();
        }, 1);
      }, 1);
    }, 1);

    const messages = [] as string[];
    for await (const msg of streamWebSocket(rs)) {
      messages.push(msg.data);
    }
    expect(messages).toEqual(["a", "b", "c"]);
  });

  test("reestablishes stream when websocket reconnects", async () => {
    const rs = new RobustWebSocket(url);

    setTimeout(() => {
      server.send("a");
      server.send("b");
    }, 1);

    const messages = [] as string[];
    const stream = streamWebSocket(rs)[Symbol.asyncIterator]();

    messages.push((await stream.next()).value.data);
    messages.push((await stream.next()).value.data);

    server.close({ code: 1000 });
    server.stop();

    server = new Server(url);
    server.start();

    await rs.closePromise;
    await rs.ws;

    server.send("c");

    messages.push((await stream.next()).value.data);

    expect(messages).toEqual(["a", "b", "c"]);
  });
});
