"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function useClientReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}

function ChartShell({ children }: { children: React.ReactNode }) {
  const ready = useClientReady();
  if (!ready) {
    return (
      <div
        className="flex h-72 w-full min-h-[288px] min-w-0 items-center justify-center rounded-xl bg-ivory/[0.04] ring-1 ring-ivory/[0.06]"
        aria-hidden
      />
    );
  }
  return <div className="h-72 w-full min-h-[288px] min-w-0">{children}</div>;
}

export function ForecastChart({ data }: { data: any[] }) {
  return (
    <ChartShell>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(244,240,232,.08)" />
          <XAxis dataKey="week" stroke="#9eb0c8" />
          <YAxis stroke="#9eb0c8" />
          <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(244,240,232,.12)", borderRadius: 16 }} />
          <Line type="monotone" dataKey="actual" stroke="#1a9fff" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="forecast" stroke="#3dd68c" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function ConfidenceChart({ data }: { data: any[] }) {
  return (
    <ChartShell>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="confidence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1a9fff" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#1a9fff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(244,240,232,.08)" />
          <XAxis dataKey="week" stroke="#9eb0c8" />
          <YAxis stroke="#9eb0c8" />
          <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(244,240,232,.12)", borderRadius: 16 }} />
          <Area type="monotone" dataKey="confidence" stroke="#1a9fff" fillOpacity={1} fill="url(#confidence)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function RouteRiskChart({ data }: { data: any[] }) {
  return (
    <ChartShell>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(244,240,232,.08)" />
          <XAxis dataKey="route" stroke="#9eb0c8" />
          <YAxis stroke="#9eb0c8" />
          <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(244,240,232,.12)", borderRadius: 16 }} />
          <Bar dataKey="demand" fill="#1a9fff" radius={[12, 12, 0, 0]} />
          <Bar dataKey="fill" fill="#3dd68c" radius={[12, 12, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function ProductivityChart({ data }: { data: any[] }) {
  return (
    <ChartShell>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(244,240,232,.08)" />
          <XAxis type="number" stroke="#9eb0c8" />
          <YAxis type="category" dataKey="name" stroke="#9eb0c8" width={90} />
          <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(244,240,232,.12)", borderRadius: 16 }} />
          <Bar dataKey="productivity" fill="#1a9fff" radius={[0, 12, 12, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

/** Grouped bars: 30d forecast vs actual by slice name */
export function ForecastVsActualGroupedBar({ data }: { data: { name: string; forecast: number; actual: number }[] }) {
  return (
    <ChartShell>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(244,240,232,.08)" />
          <XAxis dataKey="name" stroke="#9eb0c8" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={56} />
          <YAxis stroke="#9eb0c8" />
          <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(244,240,232,.12)", borderRadius: 16 }} />
          <Bar dataKey="forecast" fill="#3dd68c" radius={[8, 8, 0, 0]} name="Forecast 30d" />
          <Bar dataKey="actual" fill="#1a9fff" radius={[8, 8, 0, 0]} name="Actual 30d" />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function GrowthBarChart({ data }: { data: { name: string; growth: number }[] }) {
  return (
    <ChartShell>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(244,240,232,.08)" />
          <XAxis type="number" stroke="#9eb0c8" />
          <YAxis type="category" dataKey="name" stroke="#9eb0c8" width={88} tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(244,240,232,.12)", borderRadius: 16 }} />
          <Bar dataKey="growth" radius={[0, 10, 10, 0]}>
            {data.map((e, i) => (
              <Cell key={i} fill={e.growth >= 0 ? "#3dd68c" : "#f59e0b"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

const riskScatterColor: Record<string, string> = {
  "Act now": "#f43f5e",
  Monitor: "#f59e0b",
  Stable: "#34d399",
};

function SkuRiskTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { sku: string; cover: number; demand: number; status: string } }> }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{ background: "#0a1628", border: "1px solid rgba(244,240,232,.12)", borderRadius: 16, padding: "10px 12px", fontSize: 12 }}
    >
      <p style={{ fontWeight: 600, marginBottom: 6 }}>{d.sku}</p>
      <p style={{ color: "#9eb0c8" }}>
        Cover: <span style={{ color: "#f4f0e8" }}>{d.cover}</span>
      </p>
      <p style={{ color: "#9eb0c8" }}>
        Demand pressure: <span style={{ color: "#f4f0e8" }}>{d.demand}</span>
      </p>
      <p style={{ color: "#9eb0c8", marginTop: 4 }}>Status: {d.status}</p>
    </div>
  );
}

export function SkuRiskScatter({ data }: { data: { sku: string; demand: number; cover: number; status: string }[] }) {
  const chartData = data.map((d) => ({ ...d, x: d.cover, y: d.demand }));
  return (
    <ChartShell>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 16, bottom: 28, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(244,240,232,.08)" />
          <XAxis
            type="number"
            dataKey="x"
            name="Cover"
            stroke="#9eb0c8"
            domain={[0, 100]}
            label={{ value: "Cover index (higher is safer)", position: "bottom", offset: 12, fill: "#9eb0c8", fontSize: 10 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Demand"
            stroke="#9eb0c8"
            label={{ value: "Demand pressure", angle: -90, position: "insideLeft", fill: "#9eb0c8", fontSize: 10 }}
          />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<SkuRiskTooltip />} />
          <Scatter name="SKUs" data={chartData}>
            {chartData.map((e, i) => (
              <Cell key={i} fill={riskScatterColor[e.status] ?? "#1a9fff"} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
