import {
  CommonClient as RPCSocketClient,
  WebSocket,
  type ICommonWebSocketFactory,
} from "rpc-websockets";
import { v4 as uuidv4 } from "uuid";
import { SOCKET_URL, SOCKET_USER_ID, DEBUG_ENABLED } from "../config";
import { stringPriceToNumber, ruTimeAgoToDate } from "./data_conversion";

export const client = new RPCSocketClient(
  WebSocket as ICommonWebSocketFactory,
  SOCKET_URL,
  {},
  () => uuidv4(),
  {
    encode(value) {
      const data = JSON.stringify(value);
      if (DEBUG_ENABLED) {
        console.log("[WS OUT]", data);
      }
      return data;
    },
    decode(value) {
      if (DEBUG_ENABLED) {
        console.log("[WS IN]", value);
      }
      return JSON.parse(value);
    },
  }
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

interface GameSignalPredicateResponse {
  titles: { slug: string; title: string }[];
  items: {
    data: {
      price: string;
      when: string;
      name: string;
      characterName: string;
      enchant: string;
    };
  }[];
  type: "data";
}

export async function gameSignalPredicate({ itemId }: { itemId: number }) {
  const response = (await client.call("executeGameSignalPredicate", {
    lang: "ru",
    options: {
      3: {
        0: "Private",
      },
    },
    parameters: {
      1: itemId,
      2: 45,
    },
    signalId: 1196,
    toPartnerId: "l2-ru",
    userId: SOCKET_USER_ID,
  })) as GameSignalPredicateResponse;

  return response.items.map(({ data }) => ({
    price: stringPriceToNumber(data.price),
    seenAt: ruTimeAgoToDate(data.when),
    characterName: data.characterName,
    enchant: data.enchant,
  }));
}
