import path from "path";
import dotenv from "dotenv";

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

export const GAME_ITEMS_PARSER_BASE_URL = getEnvVariable(
  "GAME_ITEMS_PARSER_BASE_URL",
);
export const GAME_ITEM_ICON_BASE_URL = getEnvVariable(
  "GAME_ITEM_ICON_BASE_URL",
);
