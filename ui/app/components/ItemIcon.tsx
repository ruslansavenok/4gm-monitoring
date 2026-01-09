import { gameIconUrl } from "../../lib/utils";

type ItemIconProps = {
  item: {
    icon: string;
    iconPanel?: string | null;
  };
  className?: string;
};

export function ItemIcon({ item, className = "w-6 h-6" }: ItemIconProps) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      <img
        src={gameIconUrl(item.icon)}
        alt=""
        className="w-full h-full rounded"
      />
      {item.iconPanel && (
        <img
          src={gameIconUrl(item.iconPanel)}
          alt=""
          className="absolute inset-0 w-full h-full rounded"
        />
      )}
    </div>
  );
}
