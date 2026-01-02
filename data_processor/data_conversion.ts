export function stringPriceToNumber(value: string) {
  return parseInt(value.replace(/\s/g, ""), 10);
}

export function ruTimeAgoToDate(value: string) {
  const match = value.match(/^(\d+)\s+(\S+)\s+назад$/);
  if (!match) {
    throw new Error(`ruRelativeTimeToDate: dont know how to handle ${value}`);
  }

  const [, unitCountStr, unit] = match;
  const unitCount = parseInt(unitCountStr, 10);
  const now = new Date();

  if (/^минут[аы]?$/.test(unit)) {
    now.setMinutes(now.getMinutes() - unitCount, 0, 0);
    return now;
  }
  if (/^час(?:а|ов)?$/.test(unit)) {
    now.setHours(now.getHours() - unitCount, 0, 0, 0);
    return now;
  }
  if (/^д(?:ень|ня|ней)$/.test(unit)) {
    now.setDate(now.getDate() - unitCount);
    now.setHours(0, 0, 0, 0);
    return now;
  }
  throw new Error(`ruRelativeTimeToDate: unknown unit in ${value}`);
}
