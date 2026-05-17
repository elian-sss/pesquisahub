"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = ["#0F4C5C", "#E8B339", "#5B7C7E", "#A87F3A", "#7D6B91", "#3B6E6F"];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A1A] text-white px-3 py-2 rounded-lg text-xs shadow-md">
      {label && <div className="font-semibold mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 tnum">
          <span
            className="w-2 h-2 rounded-sm"
            style={{ background: p.color }}
          />
          <span className="opacity-70">{p.name}</span>
          <span className="ml-auto font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function BarChartCard({
  data,
  dataKey = "count",
  nameKey = "label",
}: {
  data: Array<Record<string, unknown>>;
  dataKey?: string;
  nameKey?: string;
}) {
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EFEDE6" vertical={false} />
          <XAxis
            dataKey={nameKey}
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F3F2EC" }} />
          <Bar dataKey={dataKey} fill="#0F4C5C" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChartCard({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <div className="flex flex-col h-[260px]">
      <ResponsiveContainer width="100%" height="70%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2 mt-auto">
        {data.map((b, i) => (
          <div
            key={i}
            className="flex justify-between text-xs"
          >
            <span className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              {b.name}
            </span>
            <span className="tnum font-semibold">{b.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
