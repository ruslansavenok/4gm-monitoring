import "dotenv/config";

function getEnvVariable(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Env variable "${key}" is required`);
  }
  return value;
}

function isTrue(value: string) {
  return ["1", "true"].includes(value.toLowerCase());
}

export const SOCKET_URL = getEnvVariable("4GM_SOCKET_URL");
export const SOCKET_USER_ID = parseInt(getEnvVariable("4GM_SOCKET_USER_ID"));
export const DEBUG_ENABLED = isTrue(getEnvVariable("4GM_DEBUG"));
