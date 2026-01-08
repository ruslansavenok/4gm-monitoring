type ItemIconProps = {
  item: {
    icon: string;
    iconPanel?: string;
  };
  className?: string;
};

export function ItemIcon({ item, className = "w-6 h-6" }: ItemIconProps) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      <img
        src={process.env.NEXT_PUBLIC_ICON_BASE_URL + item.icon}
        alt=""
        className="w-full h-full rounded"
      />
      {item.iconPanel && (
        <img
          src={process.env.NEXT_PUBLIC_ICON_BASE_URL + item.iconPanel}
          alt=""
          className="absolute inset-0 w-full h-full rounded"
        />
      )}
    </div>
  );
}
