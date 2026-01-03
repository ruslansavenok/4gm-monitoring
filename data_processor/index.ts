import * as api from "./rpc_client";
import { setupMongoConnection } from "../db/connection";
import { PrivateListing } from "../db/models/PrivateListing";
import { MonitoringTask } from "../db/models/MonitoringTask";

let isProcessing = false;

(async () => {
  await setupMongoConnection();

  api.client.on("open", () => {
    setInterval(processDueTasks, 10_000);
    processDueTasks();
  });
  api.client.on("error", () => {
    console.log("Socket failed :/");
    process.exit(1);
  });
  api.client.connect();
})();

async function processDueTasks() {
  const logDebug = (msg: string) => {
    const date = new Date().toISOString();
    console.log(`[${date}] - ${msg}`);
  };

  if (isProcessing) {
    logDebug("Prev loop not finished yet, skipping.");
    return;
  }
  isProcessing = true;

  try {
    const tasks = await MonitoringTask.findDueTasks();
    logDebug(`Found ${tasks.length} due tasks`);

    for (const { serverId, itemId } of tasks) {
      logDebug(`Processing task: serverId=${serverId}, itemId=${itemId}`);
      const rawListings = await api.gameSignalPredicate({ serverId, itemId });
      await PrivateListing.syncData(serverId, itemId, rawListings);
      await MonitoringTask.markChecked(serverId, itemId);
    }
  } catch (error) {
    logDebug(`Failed: ${error}`);
  }

  isProcessing = false;
}
