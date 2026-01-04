import {
  CommonClient as RPCSocketClient,
  WebSocket,
  type ICommonWebSocketFactory,
} from "rpc-websockets";
import { v4 as uuidv4 } from "uuid";
import { SOCKET_URL, SOCKET_USER_ID, DEBUG_ENABLED } from "../config";
import logger from "../logger";
import { stringPriceToNumber, ruListingWhenToDate } from "./conversion_utils";

const RPC_CALL_TIMEOUT = 5_000;

export const client = new RPCSocketClient(
  WebSocket as ICommonWebSocketFactory,
  SOCKET_URL,
  {
    autoconnect: false,
    reconnect: true,
    reconnect_interval: 10_000,
    max_reconnects: 5,
  },
  () => uuidv4(),
  {
    encode(value) {
      const data = JSON.stringify(value);
      logger.debug(`[WS OUT] ${data}`);
      return data;
    },
    decode(value) {
      logger.debug(`[WS IN] ${value}`);
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

interface GameSignalPredicateResponse {
  titles: { slug: string; title: string }[];
  items: {
    data: {
      price: string;
      when: string;
      name: string;
      characterName: string; // this is missing when Worldwide
      enchant: number;
    };
  }[];
  type: "data";
}

export async function gameSignalPredicate({
  serverId,
  itemId,
}: {
  serverId: number;
  itemId: number;
}) {
  const response = (await client.call(
    "executeGameSignalPredicate",
    {
      lang: "ru",
      options: {
        3: {
          0: "Private", // Private or Worldwide
          1: "Sell", // Sell or Buy
        },
      },
      parameters: {
        1: itemId,
        2: serverId,
      },
      signalId: 1196,
      toPartnerId: "l2-ru",
      userId: SOCKET_USER_ID,
    },
    RPC_CALL_TIMEOUT,
  )) as GameSignalPredicateResponse;

  return response.items.map(({ data }) => ({
    price: stringPriceToNumber(data.price),
    seenAt: ruListingWhenToDate(data.when),
    characterName: data.characterName,
    enchant: data.enchant,
  }));
}
