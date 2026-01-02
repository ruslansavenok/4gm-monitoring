import {
  CommonClient as RPCSocketClient,
  WebSocket,
  type DataPack,
  type ICommonWebSocketFactory,
} from "rpc-websockets";
import { v4 as uuidv4 } from "uuid";
import { SOCKET_URL, SOCKET_USER_ID } from "../config";

export const client = new RPCSocketClient(
  WebSocket as ICommonWebSocketFactory,
  SOCKET_URL,
  {},
  () => uuidv4(),
  {
    encode(value) {
      const data = JSON.stringify(value);
      console.log("[WS OUT]", data);
      return data;
    },
    decode(value) {
      console.log("[WS IN]", value);
      return JSON.parse(value);
    },
  },
);

export function heartbeat() {
  client.call("ping", {
    heartbeat: `${SOCKET_USER_ID}_${new Date().getTime()}`,
    lang: "ru",
  });
}

export function pingGuard() {
  return client.call("pingGuard", {
    userId: SOCKET_USER_ID,
    lang: "ru",
  });
}

export function gameSignalPredicate() {
  return client.call("executeGameSignalPredicate", {
    lang: "ru",
    options: {
      3: {
        0: "Private",
      },
    },
    parameters: {
      1: "48493",
      2: "45",
    },
    signalId: 1196,
    toPartnerId: "l2-ru",
    userId: SOCKET_USER_ID,
  });
}
