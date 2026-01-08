import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), "..", ".env"),
});

function getEnvVariable(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Env variable "${key}" is required`);
  }
  return value;
}

function isTrue(value?: string) {
  return value ? ["1", "true"].includes(value.toLowerCase()) : false;
}

export const DEBUG_ENABLED = isTrue(process.env["DEBUG"]);

export const MONGO_DB_URL = getEnvVariable("MONGODB_URL");

export const SOCKET_URL = getEnvVariable("SOCKET_URL");
export const SOCKET_USER_ID = parseInt(getEnvVariable("SOCKET_USER_ID"));

export const ITEMS_SCRAPER_HOSTNAME = getEnvVariable("ITEMS_SCRAPER_HOSTNAME");
export const ITEM_ICON_BASE_URL = getEnvVariable("ITEM_ICON_BASE_URL");
