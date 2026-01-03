import mongoose from "mongoose";

const monitoringTaskSchema = new mongoose.Schema(
  {
    serverId: { type: Number, required: true, index: true },
    itemId: { type: Number, required: true, index: true },
    lastCheckedAt: { type: Date },
    checkFrequencySec: { type: Number, required: true },
  },
  {
    timestamps: true,
    statics: {
      markChecked(serverId: number, itemId: number) {
        return this.updateOne(
          { serverId, itemId },
          { $set: { lastCheckedAt: new Date() } },
        );
      },
      findDueTasks() {
        const now = new Date();
        return this.find({
          $or: [
            { lastCheckedAt: { $exists: false } },
            { lastCheckedAt: null },
            {
              $expr: {
                $lte: [
                  "$lastCheckedAt",
                  {
                    $dateSubtract: {
                      startDate: now,
                      unit: "second",
                      amount: "$checkFrequencySec",
                    },
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
