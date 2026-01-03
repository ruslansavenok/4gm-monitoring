import * as api from "./rpc_client";
import { setupMongoConnection } from "../db/connection";
import { PrivateListing } from "../db/models/PrivateListing";

(async () => {
  await setupMongoConnection();
  console.log("Mongo connected!");

  api.client.on("open", async () => {
    const itemId = 48493;
    const rawListings = await api.gameSignalPredicate({ itemId });
    const privateListings = rawListings.map((item) => ({ ...item, itemId }));
    await PrivateListing.insertMany(privateListings);
    console.table(
      rawListings.map((item) => ({
        ...item,
        price: item.price.toLocaleString(),
      })),
    );
  });
  api.client.connect();
})();
