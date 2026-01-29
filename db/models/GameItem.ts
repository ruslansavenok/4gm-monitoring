import mongoose, { InferSchemaType } from "mongoose";

const gameItemSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  iconPanel: { type: String },
});

export type GameItem = InferSchemaType<typeof gameItemSchema>;

export const GameItemModel = mongoose.model("GameItem", gameItemSchema);
