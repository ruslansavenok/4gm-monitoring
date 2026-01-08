type Item = {
  _id: number;
  name: string;
  icon: string;
};

type ItemHeaderProps = {
  item: Item;
  listingsCount: number;
};

export function ItemHeader({ item, listingsCount }: ItemHeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-3">
        <img
          src={`${item.icon.replace("/upload/images/icon/", "https://lutk.ru/Icon/Texture/")}`}
          alt=""
          className="w-10 h-10 rounded"
        />
        <h2 className="text-xl font-semibold text-slate-100">{item.name}</h2>
      </div>
      <p className="text-sm text-slate-500 mt-1">
        {listingsCount} listing{listingsCount !== 1 ? "s" : ""} found
      </p>
    </header>
  );
}
