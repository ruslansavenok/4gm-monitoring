"use server";

import { redirect } from "next/navigation";
import { MonitoringTask } from "../../../db/models/MonitoringTask";

export async function deleteMonitoringTask(itemId: number) {
  await MonitoringTask.deleteOne({
    serverId: 45,
    itemId: itemId,
  });
  redirect("/");
}
