import type { NextConfig } from "next";
import { GAME_ITEM_ICON_BASE_URL } from "../shared/config";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GAME_ITEM_ICON_BASE_URL: GAME_ITEM_ICON_BASE_URL,
  },
};

export default nextConfig;
