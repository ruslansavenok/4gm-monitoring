import mongoose from "mongoose";

const monitoringTaskSchema = new mongoose.Schema(
  {
    serverId: { type: Number, required: true, index: true },
    itemId: { type: Number, required: true, index: true },
    lastCheckedAt: { type: Number },
    checkFrequencySec: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

export const MonitoringTask = mongoose.model(
  "MonitoringTask",
  monitoringTaskSchema,
);
