type Listing = {
  _id: string;
  seenAt: Date;
  characterName: string;
  price: number;
  enchant: number;
};

type ListingsTableProps = {
  listings: Listing[];
};

export function ListingsTable({ listings }: ListingsTableProps) {
  if (listings.length === 0) {
    return (
      <div className="text-slate-500 text-sm">
        No listings found for this item.
      </div>
    );
  }

  return (
    <div className="border border-slate-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/50">
            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">
              Seen At
            </th>
            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">
              Character
            </th>
            <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">
              Price
            </th>
            <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">
              Enchant
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {listings.map((listing) => (
            <tr
              key={listing._id}
              className="hover:bg-slate-800/50 transition-colors"
            >
              <td className="px-4 py-3 text-sm font-mono text-slate-300 tabular-nums">
                {formatDate(listing.seenAt)}
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {listing.characterName || "—"}
              </td>
              <td className="px-4 py-3 text-sm font-mono text-slate-100 tabular-nums text-right">
                {listing.price.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-sm font-mono text-slate-400 tabular-nums text-right">
                {listing.enchant > 0 ? `+${listing.enchant}` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
