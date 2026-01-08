import mongoose, { InferSchemaType } from "mongoose";

// TODO: refactor to GameItem
const itemSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  iconPanel: { type: String },
});

export type ItemType = InferSchemaType<typeof itemSchema>;
export const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);
