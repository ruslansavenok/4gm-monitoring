import { PrivateListing } from "../../db/models/PrivateListing";

export default async function HomePage() {
  const listings = await PrivateListing.countDocuments({});
  return <div>Hello {listings}</div>;
}
