import * as EJSON from "mongodb-extended-json";

import { logger } from "@/util/log";
import WebSocketProvider from "./provider";
import RobustWebSocket from "./robust";
import streamWebSocket from "./stream";

interface MessageInfo {
  reqID: string;
  hasMore: boolean;
  error: string;
}

// We have to export it to make the compiler not complain about it not being read, but it shouldn't
// be used directly by other modules.
let _currentId = 0;

export type RequestID = string;

function newId(): RequestID {
  return `${_currentId++}`;
}

/**
 * A WebSocket client that supports multiple concurrent streams of request/responses.
 */
export default class RequestWebSocket {
  private provider: WebSocketProvider;
  private responseHandlers: Map<RequestID, (resp: any) => void>;
  private responseQueues: Map<RequestID, MessageInfo[]>;

  constructor(url: string) {
    this.provider = new RobustWebSocket(url);
    this.responseHandlers = new Map<RequestID, (resp: any) => void>();
    this.responseQueues = new Map<RequestID, MessageInfo[]>();
    // Run the message streamer in a separate stack.
    setTimeout(async () => {
      for await (const msg of streamWebSocket(this.provider)) {
        logger.debug("got repsonse message", msg);
        this.messageHandler(msg);
      }
    }, 1);
  }

  /**
   * A "simple" request is one that only expects a single response message.
   */
  public async doSimpleRequest<T>(msg: object, timeoutMS: number = 10000): Promise<T> {
    for await (const resp of this.doRequest<T>(msg, timeoutMS)) {
      return resp;
    }
    return null;
  }

  public async *doRequest<T>(msg: object, timeoutMS: number = 10000): AsyncIterableIterator<T> {
    const msgCopy = { ...msg } as MessageInfo;
    const reqId = newId();
    msgCopy.reqID = reqId;

    // Defer the sending of the request until our response handling logic has started so we don't
    // miss responses.
    setTimeout(async () => {
      (await this.provider.ws).send(EJSON.stringify(msgCopy));
    }, 1);

    while (true) {
      const next = await this.nextMessage<T & MessageInfo>(reqId, timeoutMS);
      if (next.error) {
        throw new Error(next.error);
      }
      yield next;
      if (!next.hasMore) {
        break;
      }
    }
  }

  /**
   * Processes each message that comes in on the websocket and either queues it up or calls the
   * appropriate handler to receive it.
   */
  private messageHandler(msg: MessageEvent) {
    let dataObj;
    try {
      dataObj = EJSON.parse(msg.data) as MessageInfo;
    } catch (e) {
      logger.error(`Websocket message could not be parsed: ${e}`);
      return;
    }

    if (!dataObj.reqID) {
      logger.error(`Websocket message does not include a request id: ${msg.data}`);
      return;
    }

    const handler = this.responseHandlers.get(dataObj.reqID);
    // If we don't have any handler registered, then queue up the response and let something else
    // get it.
    if (!handler) {
      if (!this.responseQueues.has(dataObj.reqID)) {
        this.responseQueues.set(dataObj.reqID, new Array<MessageInfo>());
      }
      const queue = this.responseQueues.get(dataObj.reqID);
      queue.push(dataObj);
      return;
    }

    handler(dataObj);
    // Handlers are one-time use only.
    this.responseHandlers.delete(dataObj.reqID);
  }

  private getQueuedResponse<T>(reqId: RequestID): T & MessageInfo {
    const queue = this.responseQueues.get(reqId);
    if (!queue || !queue.length) {
      return null;
    }

    return queue.shift() as T & MessageInfo;
  }

  private nextMessage<T>(reqId: RequestID, timeoutMS: number): Promise<T & MessageInfo> {
    // Race with the close promise in case something goes wrong with the socket while we are waiting
    // for the next message.
    return new Promise<T & MessageInfo>((resolve, reject) => {
      this.provider.closePromise.then(ev => reject(ev));

      const queuedResp = this.getQueuedResponse<T>(reqId);
      if (queuedResp) {
        resolve(queuedResp);
        return;
      }

      const cbId = setTimeout(() => {
        reject(new Error(`Websocket request ${reqId} timed out after ${timeoutMS}`));
        this.responseHandlers.delete(reqId);
      }, timeoutMS);

      this.responseHandlers.set(reqId, (resp: T & MessageInfo) => {
        clearTimeout(cbId);
        resolve(resp);
      });
    });
  }
}
