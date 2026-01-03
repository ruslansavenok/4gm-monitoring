import mongoose from "mongoose";

const privateListingSchema = new mongoose.Schema({
  itemId: { type: Number, required: true, index: true },
  price: { type: Number, required: true },
  seenAt: { type: Date, required: true },
  characterName: { type: String },
  enchant: { type: String, required: true },
});

export const PrivateListing = mongoose.model(
  "PrivateListing",
  privateListingSchema,
);
