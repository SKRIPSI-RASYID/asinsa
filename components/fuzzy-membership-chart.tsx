"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

interface FuzzyMembershipChartProps {
  type: "kondisi" | "umur" | "biaya" | "output"
}

export function FuzzyMembershipChart({ type }: FuzzyMembershipChartProps) {
  const data: any[] = []

  // Generate data points for the chart
  for (let x = 0; x <= 100; x += 5) {
    const point: any = { x }
    if (type === "kondisi") {
      // Aligned with trapmf(x, -1, 0, 30, 45)
      point.Baik = x <= 30 ? 1 : x >= 45 ? 0 : (45 - x) / 15
      // Aligned with trimf(x, 30, 50, 70)
      point.RusakRingan = x <= 30 || x >= 70 ? 0 : x <= 50 ? (x - 30) / 20 : (70 - x) / 20
      // Aligned with trapmf(x, 55, 75, 100, 101)
      point.RusakBerat = x <= 55 ? 0 : x >= 75 ? 1 : (x - 55) / 20
    } else if (type === "output") {
      // Aligned with trapmf(x, -1, 0, 30, 45)
      point.Diperbaiki = x <= 30 ? 1 : x >= 45 ? 0 : (45 - x) / 15
      // Aligned with trimf(x, 35, 55, 75)
      point.Dilelang = x <= 35 || x >= 75 ? 0 : x <= 55 ? (x - 35) / 20 : (75 - x) / 20
      // Aligned with trapmf(x, 60, 75, 100, 101)
      point.LayakHapus = x <= 60 ? 0 : x >= 75 ? 1 : (x - 60) / 15
    }
    // Simplified for others
    data.push(point)
  }

  const colors = {
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
    blue: "#3b82f6",
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Legend />
          {type === "kondisi" || type === "output" ? (
            <>
              <Area
                type="monotone"
                dataKey={type === "kondisi" ? "Baik" : "Diperbaiki"}
                stroke={type === "kondisi" ? colors.green : colors.blue}
                fill={type === "kondisi" ? colors.green : colors.blue}
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey={type === "kondisi" ? "RusakRingan" : "Dilelang"}
                stroke={colors.yellow}
                fill={colors.yellow}
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey={type === "kondisi" ? "RusakBerat" : "LayakHapus"}
                stroke={colors.red}
                fill={colors.red}
                fillOpacity={0.2}
              />
            </>
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
