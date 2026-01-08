import Link from "next/link";
import { ItemIcon } from "./ItemIcon";

type Item = {
  _id: number;
  name: string;
  icon: string;
};

type SidebarProps = {
  items: Item[];
  selectedItemId: number | null;
};

export function Sidebar({ items, selectedItemId }: SidebarProps) {
  return (
    <aside className="w-1/4 min-w-[240px] max-w-[320px] border-r border-slate-800 bg-slate-900 overflow-y-auto">
      <nav className="p-2">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500 p-3">No items being monitored</p>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive = item._id === selectedItemId;
              return (
                <li key={item._id}>
                  <Link
                    href={`?itemId=${item._id}`}
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
    </aside>
  );
}
