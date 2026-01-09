import { MonitoringTaskModel } from "../../db/models/MonitoringTask";
import { PrivateListingModel } from "../../db/models/PrivateListing";
import { ContentSection } from "./components/ContentSection";
import { Sidebar } from "./components/Sidebar";

// TODO: move to some sort of const, figure out where to put
const SERVER_ID = 45;

type SearchParams = Promise<{ itemId?: string }>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { itemId } = await searchParams;
  const selectedGameItemId = itemId ? parseInt(itemId, 10) : null;
  const monitoredGameItemIds = await MonitoringTaskModel.find({
    serverId: SERVER_ID,
  }).distinct("itemId");
  const listings = selectedGameItemId
    ? await PrivateListingModel.find({
        serverId: SERVER_ID,
        itemId: selectedGameItemId,
      })
        .sort({ seenAt: -1 })
        .lean()
    : [];

  return (
    <div className="flex h-screen">
      <Sidebar
        monitoredGameItemIds={monitoredGameItemIds}
        selectedGameItemId={selectedGameItemId}
      />

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {selectedGameItemId ? (
          <ContentSection
            selectedItemId={selectedGameItemId}
            listings={listings}
          />
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
