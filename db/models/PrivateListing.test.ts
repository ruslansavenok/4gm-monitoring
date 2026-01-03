import { describe, it, expect } from "vitest";
import { generateListingId } from "./PrivateListing";

describe("generateListingId", () => {
  it("generates correct id from listing metadata", () => {
    const result = generateListingId({
      serverId: 1,
      itemId: 100,
      seenAt: new Date("2024-01-15T10:30:00Z"),
      price: 5000,
      enchant: 0,
      characterName: "Игрок",
    });
    expect(result).toBe(
      "server:1,item:100,date:2024-01-15,price:5000,enchant:0,characterName:Игрок",
    );
  });
});
