import { setupMongoConnection } from "../db/connection";
import { Item } from "../db/models/Item";
import { scrapeItem, ItemNotFoundError } from "./scraper";
import WorkQueue from "./work_queue";
import logger from "../shared/logger";

const WORKER_COUNT = 4;
const IS_REFRESHING_EXISTING = true;

// NOTE:
// There's a much faster way to do it - parse game client file
// https://github.com/ritsuwastaken/open-l2encdec
// https://github.com/gyod/L2Dat_EncDec/blob/master/l2datencdec
(async () => {
  try {
    await setupMongoConnection();

    let ids: number[];
    if (IS_REFRESHING_EXISTING) {
      const items = await Item.find({}, { _id: 1 }).sort({ _id: -1 }).lean();
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
      await Item.updateOne({ _id: item._id }, { $set: item }, { upsert: true });
    } catch (error) {
      if (error instanceof ItemNotFoundError) {
        logger.info(`Worker ${workerId} item ${id} not found`);
      } else {
        logger.info(`Worker ${workerId} error scraping item ${id}: ${error}`);
      }
    }
  }
}
