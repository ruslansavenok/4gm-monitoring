import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  iconPanel: { type: String },
});

export const Item = mongoose.model("Item", itemSchema);
