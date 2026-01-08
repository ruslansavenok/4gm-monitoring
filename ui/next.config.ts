import type { NextConfig } from "next";
import { ITEM_ICON_BASE_URL } from "../shared/config";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ITEM_ICON_BASE_URL: ITEM_ICON_BASE_URL,
  },
};

export default nextConfig;
