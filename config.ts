import "dotenv/config";

function getEnvVariable(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Env variable "${key}" is required`);
  }
  return value;
}

const socketHost = getEnvVariable("4GM_SOCKET_HOST");
const socketToken = getEnvVariable("4GM_SOCKET_TOKEN");

export const SOCKET_URL = `${socketHost}/?token=${socketToken}`;
