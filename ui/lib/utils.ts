export function gameIconUrl(iconName: string) {
  return process.env.NEXT_PUBLIC_GAME_ITEM_ICON_BASE_URL + iconName;
}

export function formatDate(date: Date) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
