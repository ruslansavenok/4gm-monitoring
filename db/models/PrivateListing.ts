import mongoose from "mongoose";

type RawListing = {
  seenAt: Date;
  price: number;
  enchant: number;
  characterName: string;
};

const privateListingSchema = new mongoose.Schema(
  {
    _id: { type: String },
    serverId: { type: Number, required: true, index: true },
    itemId: { type: Number, required: true, index: true },
    price: { type: Number, required: true },
    seenAt: { type: Date, required: true },
    characterName: { type: String },
    enchant: { type: Number, required: true },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
    statics: {
      syncData(serverId: number, itemId: number, rawListings: RawListing[]) {
        return this.bulkWrite(
          rawListings.map((item) => {
            const doc = { serverId, itemId, ...item };
            const _id = generateListingId(doc);
            return {
              updateOne: {
                filter: { _id },
                update: { $setOnInsert: { _id, ...doc } },
                upsert: true,
              },
            };
          }),
          { ordered: false },
        );
      },
    },
  },
);

export function generateListingId(listing: {
  serverId: number;
  itemId: number;
  seenAt: Date;
  price: number;
  enchant: number;
  characterName: string;
}) {
  const rawId = {
    server: listing.serverId,
    item: listing.itemId,
    date: listing.seenAt.toISOString().slice(0, 10),
    price: listing.price,
    enchant: listing.enchant,
    characterName: listing.characterName,
  };
  return Object.entries(rawId)
    .map(([key, value]) => `${key}:${value}`)
    .join(",");
}

export const PrivateListing =
  mongoose.models.PrivateListing ||
  mongoose.model("PrivateListing", privateListingSchema);
