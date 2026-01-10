import { setupMongoConnection } from "../db/connection";
import { GameItemModel } from "../db/models/GameItem";
import logger from "../shared/logger";
import { scrapeItem, ItemNotFoundError, ItemUntradableError } from "./scraper";
import WorkQueue from "./work-queue";

const WORKER_COUNT = 4;
const IS_REFRESHING_EXISTING = true;

// NOTE:
// There's a much faster way to do it - parse game client file
// https://github.com/ritsuwastaken/open-l2encdec
// https://github.com/gyod/L2Dat_EncDec/blob/master/l2datencdec
// Strucs that will be needed: ItemName, EtcItemGrp, WeaponGrp and ArmorGrp
(async () => {
  try {
    await setupMongoConnection();

    let ids: number[];
    if (IS_REFRESHING_EXISTING) {
      const items = await GameItemModel.find({}, { _id: 1 })
        .sort({ _id: -1 })
        .lean();
      ids = items.map((item) => item._id);
    } else {
      ids = Array.from({ length: 90_000 }, (_, i) => i + 1);
    }

    const workQueue = new WorkQueue(ids);

    await Promise.all(
      Array.from({ length: WORKER_COUNT }, (_, i) =>
        processWorker(workQueue, i + 1),
      ),
    );
    logger.info("All workers finished");
    process.exit(0);
  } catch (error) {
    logger.info(`Fatal error: ${error}`);
    process.exit(1);
  }
})();

async function processWorker(queue: WorkQueue, workerId: number) {
  logger.info(`Worker ${workerId} started`);

  while (true) {
    const id = queue.getNext();

    if (id === null) {
      logger.info(`Worker ${workerId} finished`);
      break;
    }

    try {
      const item = await scrapeItem(id);
      await GameItemModel.updateOne(
        { _id: item._id },
        { $set: item },
        { upsert: true },
      );
    } catch (error) {
      if (error instanceof ItemNotFoundError) {
        logger.info(`Worker ${workerId} item ${id} not found`);
      } else if (error instanceof ItemUntradableError) {
        logger.info(
          `Worker ${workerId} item ${id} is untradable, deleting if exists`,
        );
        await GameItemModel.deleteOne({ _id: id });
      } else {
        logger.info(`Worker ${workerId} error scraping item ${id}: ${error}`);
      }
    }
  }
}
