import * as api from "./rpc_client";
import { setupMongoConnection } from "../db/connection";
import { PrivateListing, generateListingId } from "../db/models/PrivateListing";

(async () => {
  await setupMongoConnection();
  console.log("Mongo connected!");

  api.client.on("open", async () => {
    const serverId = 45;
    const itemId = 48493;
    const rawListings = await api.gameSignalPredicate({ serverId, itemId });
    await PrivateListing.bulkWrite(
      rawListings.map((item) => {
        const doc = { serverId, itemId, ...item };
        const _id = generateListingId(doc);
        return {
          updateOne: {
            filter: { _id },
            update: { $setOnInsert: { _id, ...doc } },
            upsert: true,
          },
        };
      }),
      { ordered: false },
    );
    console.table(
      rawListings.map((item) => ({
        ...item,
        price: item.price.toLocaleString(),
      })),
    );
  });
  api.client.connect();
})();
