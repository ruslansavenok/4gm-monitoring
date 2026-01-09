"use server";

import { redirect } from "next/navigation";
import { MonitoringTaskModel } from "../../db/models/MonitoringTask";
import { SERVER_ID } from "../lib/constants";

export async function createMonitoringTask(
  itemId: number,
  checkFrequencySec: number,
) {
  await MonitoringTaskModel.create({
    serverId: SERVER_ID,
    itemId: itemId,
    checkFrequencySec: checkFrequencySec,
  });
}

export async function deleteMonitoringTask(itemId: number) {
  await MonitoringTaskModel.deleteOne({
    serverId: SERVER_ID,
    itemId: itemId,
  });
  redirect("/");
}
