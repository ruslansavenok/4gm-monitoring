import { MonitoringTaskModel } from "../../../db/models/MonitoringTask";
import { PrivateListingModel } from "../../../db/models/PrivateListing";
import { SERVER_ID } from "../../lib/constants";
import { ContentSection } from "./components/ContentSection";
import { Sidebar } from "./components/Sidebar";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ itemId?: string }>;
}) {
  const { itemId } = await searchParams;
  const selectedItemId = itemId ? parseInt(itemId, 10) : null;
  const monitoredItemIds = await MonitoringTaskModel.find({
    serverId: SERVER_ID,
  }).distinct("itemId");
  const listings = selectedItemId
    ? await PrivateListingModel.find({
        serverId: SERVER_ID,
        itemId: selectedItemId,
      })
        .sort({ seenAt: -1 })
        .lean()
    : [];

  return (
    <div className="flex h-screen">
      <Sidebar
        monitoredItemIds={monitoredItemIds}
        selectedItemId={selectedItemId}
      />
      <main className="flex-1 overflow-y-auto">
        {selectedItemId ? (
          <ContentSection selectedItemId={selectedItemId} listings={listings} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-slate-500 text-sm">
                Select an item from the sidebar to view listings
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
