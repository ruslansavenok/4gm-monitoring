import Link from "next/link";
import { GameItemModel } from "../../db/models/GameItem";
import { MonitoringTaskModel } from "../../db/models/MonitoringTask";
import { PrivateListingModel } from "../../db/models/PrivateListing";
import { ContentSection } from "./components/ContentSection";
import { AddTaskButton } from "./components/AddTaskButton";
import { ItemIcon } from "./components/ItemIcon";

const SERVER_ID = 45;

type SearchParams = Promise<{ itemId?: string }>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { itemId } = await searchParams;
  const selectedItemId = itemId ? parseInt(itemId, 10) : null;

  // Get items that have monitoring tasks for this server
  const taskItemIds = await MonitoringTaskModel.find({
    serverId: SERVER_ID,
  }).distinct("itemId");
  const items = await GameItemModel.find({ _id: { $in: taskItemIds } }).lean();

  // Get listings for selected item
  let listings: Array<{
    _id?: string | null;
    seenAt: Date;
    characterName?: string | null;
    price: number;
    enchant: number;
  }> = [];

  if (selectedItemId) {
    listings = await PrivateListingModel.find({
      serverId: SERVER_ID,
      itemId: selectedItemId,
    })
      .sort({ seenAt: -1 })
      .lean();
  }

  // Serialize listings for client component (convert dates to strings)
  const chartListings = listings.map((l) => ({
    _id: String(l._id),
    seenAt: new Date(l.seenAt).toISOString(),
    price: l.price,
    enchant: l.enchant,
    characterName: l.characterName ?? "",
  }));

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-1/4 min-w-[240px] max-w-[320px] border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Monitored Items
          </h1>
        </div>
        <nav className="p-2 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500 p-3">
              No items being monitored
            </p>
          ) : (
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive = item._id === selectedItemId;
                return (
                  <li key={item._id}>
                    <Link
                      href={`?itemId=${item._id}`}
                      title={item.name}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive
                          ? "bg-blue-500/15 text-blue-400"
                          : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                      }`}
                    >
                      <ItemIcon item={item} className="w-8 h-8" />
                      <span className="text-sm font-medium truncate">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <AddTaskButton />
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {selectedItemId ? (
          <ContentSection
            selectedItemId={selectedItemId}
            listings={chartListings}
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
