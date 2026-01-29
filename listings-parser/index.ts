import { setupMongoConnection } from "../db/connection";
import { MonitoringTaskModel } from "../db/models/MonitoringTask";
import { PrivateListingModel } from "../db/models/PrivateListing";
import logger from "../shared/logger";
import * as api from "./rpc-client";

let isInitialized = false;
let isProcessing = false;

(async () => {
  await setupMongoConnection();

  api.client
    .on("open", () => {
      logger.info("Socket opened");
      if (!isInitialized) {
        setInterval(processDueTasks, 10_000);
        processDueTasks();
        isInitialized = true;
      }
    })
    .on("close", (code: number, reason: string) => {
      logger.info(`Socket closed with code=${code}, reason=${reason}`);
    })
    .on("error", (error: unknown) => {
      // TODO: we need to shut down is session token is not valid anymore
      logger.info("Socket failed :/", error);
    })
    .on("max_reconnects_reached", () => {
      logger.info("Socket reconnection limit reached :/");
      process.exit(1);
    });
  api.client.connect();
})();

async function processDueTasks() {
  if (isProcessing) {
    logger.info("Prev loop not finished yet, skipping.");
    return;
  }
  isProcessing = true;

  try {
    const tasks = await MonitoringTaskModel.findDueTasks();
    logger.info(`Found ${tasks.length} due tasks`);

    for (const { serverId, itemId } of tasks) {
      logger.info(`Processing task: serverId=${serverId}, itemId=${itemId}`);
      const rawListings = await api.gameSignalPredicate({ serverId, itemId });
      await PrivateListingModel.syncData(serverId, itemId, rawListings);
      await MonitoringTaskModel.markChecked(serverId, itemId);
    }
  } catch (error) {
    logger.info(`Failed: ${error}`);
  }

  isProcessing = false;
}
