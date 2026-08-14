import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BurndownPointType } from "../utils/burndown.js";

function formatDateShort(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function BurndownChart({
  title,
  data,
  yAxisLabel,
}: {
  title: string;
  data: BurndownPointType[];
  yAxisLabel: string;
}) {
  const chartData = data.map((point) => ({
    date: formatDateShort(point.date),
    Remaining: point.remaining,
    Ideal: Math.round(point.ideal * 100) / 100,
  }));

  return (
    <div className="flex-1 min-w-0">
      <h4 className="text-lg font-bold text-[#9BCF69]">{title}</h4>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#33373C" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: "insideLeft",
                fontSize: 12,
              }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Remaining"
              stroke="#9BCF69"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="Ideal"
              stroke="#888888"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
