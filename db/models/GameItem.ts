import mongoose, { InferSchemaType } from "mongoose";

const gameItemSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  iconPanel: { type: String },
});

export type GameItemType = InferSchemaType<typeof gameItemSchema>;
export const GameItem = mongoose.model("GameItem", gameItemSchema);
