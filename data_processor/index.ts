import * as api from "./rpc_client";
import { setupMongoConnection } from "../db/connection";
import { PrivateListing, generateListingId } from "../db/models/PrivateListing";

async function fetchAndProcessListings(serverId: number, itemId: number) {
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
  return rawListings;
}

(async () => {
  await setupMongoConnection();
  console.log("Mongo connected!");

  api.client.on("open", async () => {
    const listings = await fetchAndProcessListings(45, 48493);
    console.table(
      listings.map((item) => ({
        ...item,
        price: item.price.toLocaleString(),
      })),
    );
  });
  api.client.connect();
})();
