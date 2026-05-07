"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
