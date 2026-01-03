import * as api from "./rpc_client";
import { setupMongoConnection } from "../db/connection";
import { PrivateListing } from "../db/models/PrivateListing";
import { MonitoringTask } from "../db/models/MonitoringTask";

(async () => {
  await setupMongoConnection();
  console.log("Mongo connected!");

  const tasks = await MonitoringTask.findDueTasks();
  console.log(`Found ${tasks.length} due tasks`);
  if (tasks.length === 0) return;

  api.client.on("open", async () => {
    for (const { serverId, itemId } of tasks) {
      console.log(`Processing task: serverId=${serverId}, itemId=${itemId}`);
      const rawListings = await api.gameSignalPredicate({ serverId, itemId });
      await PrivateListing.syncData(serverId, itemId, rawListings);
      await MonitoringTask.markChecked(serverId, itemId);
      console.table(
        rawListings.map((item) => ({
          ...item,
          price: item.price.toLocaleString(),
        })),
      );
    }
  });
  api.client.connect();
})();
