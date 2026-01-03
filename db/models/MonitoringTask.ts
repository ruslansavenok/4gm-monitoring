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
    statics: {
      markChecked(serverId: number, itemId: number) {
        return this.updateOne(
          { serverId, itemId },
          { $set: { lastCheckedAt: Date.now() } },
        );
      },
      findDueTasks() {
        const now = Date.now();
        return this.find({
          $or: [
            { lastCheckedAt: { $exists: false } },
            { lastCheckedAt: null },
            {
              $expr: {
                $lte: [
                  "$lastCheckedAt",
                  {
                    $subtract: [
                      now,
                      { $multiply: ["$checkFrequencySec", 1000] },
                    ],
                  },
                ],
              },
            },
          ],
        });
      },
    },
  },
);

export const MonitoringTask = mongoose.model(
  "MonitoringTask",
  monitoringTaskSchema,
);
