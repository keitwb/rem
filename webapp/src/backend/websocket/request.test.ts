import { Server, WebSocket } from "mock-websocket";

import RequestWebSocket from "./request";

describe("RequestWebSocket Client", () => {
  const url = "ws://localhost:8080";
  let server: Server;

  beforeEach(() => {
    server = new Server(url);
    (global as any).WebSocket = WebSocket;
  });

  afterEach(done => {
    server.stop(done);
  });

  describe("doSimpleRequest", () => {
    test("yields message from specific request", async () => {
      server.on("message", m => {
        const reqID = JSON.parse(m).reqID.toString();
        server.send(
          JSON.stringify({
            b: 2,
            hasMore: false,
            reqID: "invalid",
          })
        );
        server.send(
          JSON.stringify({
            a: 1,
            hasMore: false,
            reqID,
          })
        );
      });
      const rs = new RequestWebSocket(url);

      const resp = await rs.doSimpleRequest({ testing: "yes" });
      expect(resp).toMatchObject({ a: 1 });
    });
  });

  describe("doRequest", () => {
    test("yields all messages from specific request", async () => {
      const rs = new RequestWebSocket(url);

      server.on("message", m => {
        const reqID = JSON.parse(m).reqID;
        server.send(
          JSON.stringify({
            a: 1,
            hasMore: true,
            reqID,
          })
        );
        server.send(
          JSON.stringify({
            b: 2,
            hasMore: false,
            reqID,
          })
        );
      });

      const messages = [] as object[];
      for await (const part of rs.doRequest({ testing: "yes" })) {
        messages.push(part);
      }
      expect(messages).toHaveLength(2);
      expect(messages[0]).toMatchObject({ a: 1 });
      expect(messages[1]).toMatchObject({ b: 2 });
    });

    test("handles interleaved requests/responses", async () => {
      const rs = new RequestWebSocket(url);

      let firstRequestID: string;
      server.on("message", m => {
        const reqID = JSON.parse(m).reqID;
        if (firstRequestID) {
          server.send(
            JSON.stringify({
              a: 1,
              hasMore: true,
              reqID: firstRequestID,
            })
          );
          server.send(
            JSON.stringify({
              c: 3,
              hasMore: true,
              reqID,
            })
          );
          server.send(
            JSON.stringify({
              b: 2,
              hasMore: false,
              reqID: firstRequestID,
            })
          );
          server.send(
            JSON.stringify({
              d: 4,
              hasMore: false,
              reqID,
            })
          );
        } else {
          firstRequestID = reqID;
        }
      });

      const firstReq = rs.doRequest({ testing: "yes" });
      const secondReq = rs.doRequest({ action: "get" });

      const first = new Promise(resolve => {
        setTimeout(async () => {
          const messages = [] as object[];
          for await (const part of firstReq) {
            messages.push(part);
          }
          resolve(messages);
        }, 1);
      });

      const second = new Promise(resolve => {
        setTimeout(async () => {
          const messages = [] as object[];
          for await (const part of secondReq) {
            messages.push(part);
          }
          resolve(messages);
        }, 1);
      });

      const [firstMessages, secondMessages] = await Promise.all([first, second]);
      expect(firstMessages).toHaveLength(2);
      expect(firstMessages[0]).toMatchObject({ a: 1 });
      expect(firstMessages[1]).toMatchObject({ b: 2 });

      expect(secondMessages).toHaveLength(2);
      expect(secondMessages[0]).toMatchObject({ c: 3 });
      expect(secondMessages[1]).toMatchObject({ d: 4 });
    });
  });
});
