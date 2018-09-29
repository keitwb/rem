import WebSocketProvider from "./provider";

export default async function* streamWebSocket(wsProvider: WebSocketProvider): AsyncIterableIterator<MessageEvent> {
  // This acts as a buffer in case messages come in faster than they are processed by the code
  // iterating over this generator function.
  const responseQueue = new Array<MessageEvent>();

  const handlerProvider = new HandlerProvider();
  init(wsProvider, handlerProvider, responseQueue);

  while (true) {
    const next = await nextMessage(responseQueue, handlerProvider);

    if (next) {
      yield next;
    }
    if (wsProvider.cancelled) {
      break;
    }
  }
}

type MessageHandler = (msg: MessageEvent) => void;

class HandlerProvider {
  private _handler: MessageHandler;

  get handler() {
    return this._handler;
  }
  set handler(h: MessageHandler) {
    this._handler = h;
  }
}

function init(wsProvider: WebSocketProvider, handlerProvider: HandlerProvider, responseQueue: MessageEvent[]) {
  wsProvider.openPromise.then(async () => {
    wsProvider.ws.onmessage = (msg: MessageEvent) => messageHandler(responseQueue, handlerProvider, msg);
  });

  wsProvider.closePromise.then(_ => {
    init(wsProvider, handlerProvider, responseQueue);
  });
}

function messageHandler(queue: MessageEvent[], handlerProvider: HandlerProvider, msg: MessageEvent) {
  // If we have a registered handler that is waiting for a new message, then send it to it,
  // otherwise queue the message and let something else pull it out later.
  if (handlerProvider.handler) {
    handlerProvider.handler(msg);
    return;
  }

  queue.push(msg);
}

function nextMessage(queue: MessageEvent[], handlerProvider: HandlerProvider): Promise<MessageEvent> {
  return new Promise<MessageEvent>((resolve, _) => {
    const queuedMessage = queue.shift();
    if (queuedMessage) {
      resolve(queuedMessage);
      return;
    }

    handlerProvider.handler = (msg: MessageEvent) => {
      handlerProvider.handler = null;
      resolve(msg);
    };
  });
}
