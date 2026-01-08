import * as cheerio from "cheerio";
import { ITEMS_SCRAPER_HOSTNAME } from "../shared/config";
import logger from "../shared/logger";

export class ItemNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ItemNotFoundError";
  }
}

export class ItemUntradableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ItemUntradableError";
  }
}

export interface ScrapedItem {
  _id: number;
  name: string;
  icon: string;
  iconPanel?: string;
}

export async function scrapeItem(id: number): Promise<ScrapedItem> {
  const url = `${ITEMS_SCRAPER_HOSTNAME}/main/items/${id}.html`;
  const startTime = Date.now();
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language":
        "en-US,en;q=0.9,ru;q=0.8,pl;q=0.7,pt;q=0.6,fr;q=0.5,uk;q=0.4",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Cache-Control": "max-age=0",
      Priority: "u=0, i",
      "Sec-CH-UA":
        '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
      "Sec-CH-UA-Mobile": "?0",
      "Sec-CH-UA-Platform": '"macOS"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      Cookie: "CCA=Y; PHPSESSID=uucjmnhcve4vr7rkmpiboavl5b; LANG_ID=ru;",
    },
  });

  const fetchDuration = Date.now() - startTime;
  logger.info(
    `Fetch ${url} completed in ${fetchDuration}ms (status: ${response.status})`,
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for item ${id}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  if ($(".not-found-page").length > 0) {
    throw new ItemNotFoundError(`Item ${id} not found (404 page)`);
  }

  const firstCanOption = $(".options-title.title-can + ul li")
    .first()
    .text()
    .trim();
  if (firstCanOption !== "Обменять") {
    throw new ItemUntradableError(`Item ${id} is untradable`);
  }

  const name = $("h1.item-desc").text().trim();
  const iconSrc = $(".item-icon .icon").attr("src")?.split("/").pop();
  const iconPanelSrc = $(".item-icon .icon-panel")
    .attr("src")
    ?.split("/")
    .pop();

  if (!name || !iconSrc) {
    throw new Error(
      `Missing data for item ${id}: name=${name}, icon=${iconSrc}`,
    );
  }

  return { _id: id, name, icon: iconSrc, iconPanel: iconPanelSrc };
}
