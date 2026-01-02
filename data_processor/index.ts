import * as api from "./rpc_client";

api.client.on("open", async function () {
  await api.gameSignalPredicate();
});
