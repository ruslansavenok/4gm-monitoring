import * as api from "./rpc_client";
import { setupMongoConnection } from "../db/connection";
import { PrivateListing, generateListingId } from "../db/models/PrivateListing";
import { MonitoringTask } from "../db/models/MonitoringTask";

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
  await MonitoringTask.updateOne(
    { serverId, itemId },
    { $set: { lastCheckedAt: Date.now() } },
  );
  return rawListings;
}

(async () => {
  await setupMongoConnection();
  console.log("Mongo connected!");

  const tasks = await MonitoringTask.find();
  console.log(`Found ${tasks.length} monitoring tasks`);

  api.client.on("open", async () => {
    for (const { serverId, itemId } of tasks) {
      console.log(`Processing task: serverId=${serverId}, itemId=${itemId}`);
      const listings = await fetchAndProcessListings(serverId, itemId);
      console.table(
        listings.map((item) => ({
          ...item,
          price: item.price.toLocaleString(),
        })),
      );
    }
  });
  api.client.connect();
})();
