const RU_MONTHS: Record<string, number> = {
  января: 0,
  февраля: 1,
  марта: 2,
  апреля: 3,
  мая: 4,
  июня: 5,
  июля: 6,
  августа: 7,
  сентября: 8,
  октября: 9,
  ноября: 10,
  декабря: 11,
};

export function stringPriceToNumber(value: string) {
  return parseInt(value.replace(/\s/g, ""), 10);
}

export function ruListingWhenToDate(value: string) {
  const now = new Date();

  // Handle "только что" (just now)
  if (value === "только что") {
    return now;
  }

  // Handle relative time: "5 минут назад", "2 часа назад", "3 дня назад"
  const relativeMatch = value.match(/^(\d+)\s+(\S+)\s+назад$/);
  if (relativeMatch) {
    const [, countStr, unit] = relativeMatch;
    const count = parseInt(countStr, 10);

    if (/^минут[у|ы]?$/.test(unit)) {
      now.setMinutes(now.getMinutes() - count, 0, 0);
      return now;
    }
    if (/^час(?:а|ов)?$/.test(unit)) {
      now.setHours(now.getHours() - count, 0, 0, 0);
      return now;
    }
    if (/^д(?:ень|ня|ней)$/.test(unit)) {
      now.setUTCDate(now.getDate() - count);
      now.setUTCHours(0, 0, 0, 0);
      return now;
    }
  }

  // Handle absolute date: "26 декабря"
  const absoluteMatch = value.match(/^(\d+)\s+(\S+)$/);
  if (absoluteMatch) {
    const [, dayStr, month] = absoluteMatch;
    const monthIndex = RU_MONTHS[month];
    if (monthIndex !== undefined) {
      const day = parseInt(dayStr, 10);
      const year = now.getUTCFullYear();
      const date = new Date(Date.UTC(year, monthIndex, day, 0, 0, 0, 0));
      // If date is in the future, assume previous year
      if (date > now) {
        date.setUTCFullYear(year - 1);
      }
      return date;
    }
  }

  throw new Error(`ruListingWhenToDate: cant parse ${value}`);
}
