import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { stringPriceToNumber, ruListingWhenToDate } from "./data_conversion";

describe("stringPriceToNumber", () => {
  it("parses price with spaces", () => {
    expect(stringPriceToNumber("400 000 000 000")).toBe(400000000000);
  });

  it("parses price without spaces", () => {
    expect(stringPriceToNumber("123")).toBe(123);
  });
});

describe("ruListingWhenToDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-03T12:30:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const testCases: { input: string; expected: Date | string }[] = [
    // Relative time - minutes
    { input: "1 минуту назад", expected: new Date("2026-01-03T12:29:00.000Z") },
    { input: "5 минут назад", expected: new Date("2026-01-03T12:25:00.000Z") },
    {
      input: "22 минуты назад",
      expected: new Date("2026-01-03T12:08:00.000Z"),
    },

    // Relative time - hours
    { input: "1 час назад", expected: new Date("2026-01-03T11:00:00.000Z") },
    { input: "2 часа назад", expected: new Date("2026-01-03T10:00:00.000Z") },
    { input: "3 часа назад", expected: new Date("2026-01-03T09:00:00.000Z") },
    { input: "5 часов назад", expected: new Date("2026-01-03T07:00:00.000Z") },

    // Relative time - days
    { input: "1 день назад", expected: new Date("2026-01-02T00:00:00.000Z") },
    { input: "2 дня назад", expected: new Date("2026-01-01T00:00:00.000Z") },
    { input: "5 дней назад", expected: new Date("2025-12-29T00:00:00.000Z") },

    // Absolute dates - current year (date is in the past)
    { input: "1 января", expected: new Date("2026-01-01T00:00:00.000Z") },

    // Absolute dates - previous year (date would be in future)
    { input: "15 марта", expected: new Date("2025-03-15T00:00:00.000Z") },
    { input: "26 декабря", expected: new Date("2025-12-26T00:00:00.000Z") },

    // All months (using day 15, all in previous year since they'd be future)
    { input: "15 января", expected: new Date("2025-01-15T00:00:00.000Z") },
    { input: "15 февраля", expected: new Date("2025-02-15T00:00:00.000Z") },
    { input: "15 апреля", expected: new Date("2025-04-15T00:00:00.000Z") },
    { input: "15 мая", expected: new Date("2025-05-15T00:00:00.000Z") },
    { input: "15 июня", expected: new Date("2025-06-15T00:00:00.000Z") },
    { input: "15 июля", expected: new Date("2025-07-15T00:00:00.000Z") },
    { input: "15 августа", expected: new Date("2025-08-15T00:00:00.000Z") },
    { input: "15 сентября", expected: new Date("2025-09-15T00:00:00.000Z") },
    { input: "15 октября", expected: new Date("2025-10-15T00:00:00.000Z") },
    { input: "15 ноября", expected: new Date("2025-11-15T00:00:00.000Z") },
    { input: "15 декабря", expected: new Date("2025-12-15T00:00:00.000Z") },

    // Error cases (expected is error message string)
    { input: "invalid", expected: "ruListingWhenToDate: cant parse invalid" },
    {
      input: "5 недель назад",
      expected: "ruListingWhenToDate: cant parse 5 недель назад",
    },
    { input: "15 foo", expected: "ruListingWhenToDate: cant parse 15 foo" },
  ];

  it.each(testCases)("$input -> $expected", ({ input, expected }) => {
    if (expected instanceof Date) {
      const result = ruListingWhenToDate(input);
      expect(result).toEqual(expected);
    } else {
      expect(() => ruListingWhenToDate(input)).toThrow(expected);
    }
  });
});
