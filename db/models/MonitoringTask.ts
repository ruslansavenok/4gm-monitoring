import mongoose from "mongoose";

const monitoringTaskSchema = new mongoose.Schema(
  {
    serverId: { type: Number, required: true, index: true },
    itemId: { type: Number, required: true, index: true },
    lastCheckedAt: { type: Date, default: null },
    checkFrequencySec: { type: Number, required: true, default: 300 },
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

monitoringTaskSchema.index({ serverId: 1, itemId: 1 }, { unique: true });

export const MonitoringTaskModel = mongoose.model(
  "MonitoringTask",
  monitoringTaskSchema,
);
