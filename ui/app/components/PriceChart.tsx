"use client";

import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { PrivateListing } from "../../../db/models/PrivateListing";

interface PriceChartProps {
  listings: PrivateListing[];
}

function formatPrice(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function PriceChart({ listings }: PriceChartProps) {
  const chartData = useMemo(() => {
    return listings
      .map((listing) => ({
        timestamp: new Date(listing.seenAt).getTime(),
        price: listing.price,
        enchant: listing.enchant,
        characterName: listing.characterName,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [listings]);

  if (listings.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/50">
        {chartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-sm text-slate-500">
            No data for selected filters
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={formatDate}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={{ stroke: "#334155" }}
              />
              <YAxis
                dataKey="price"
                type="number"
                domain={["auto", "auto"]}
                tickFormatter={formatPrice}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={{ stroke: "#334155" }}
                width={50}
              />
              <Tooltip
                cursor={false}
                animationDuration={0}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-lg">
                      <p className="text-xs text-slate-400">
                        {new Date(data.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-sm font-mono text-slate-100">
                        {data.price.toLocaleString()}
                      </p>
                      {data.enchant > 0 && (
                        <p className="text-xs text-slate-400">
                          +{data.enchant} enchant
                        </p>
                      )}
                      {data.characterName && (
                        <p className="text-xs text-slate-500">
                          {data.characterName}
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <Scatter
                data={chartData}
                fill="#3b82f6"
                fillOpacity={0.8}
                shape="circle"
                isAnimationActive={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
