import * as api from "./rpc_client";

api.client.on("open", async function () {
  const items = await api.gameSignalPredicate({
    itemId: 48493,
  });
  console.table(
    items.map((row) => ({
      ...row,
      price: row.price.toLocaleString(),
    }))
  );
});
