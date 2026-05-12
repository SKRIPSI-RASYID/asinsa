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
      point.Baik = x <= 30 ? 1 : x >= 50 ? 0 : (50 - x) / 20
      point.RusakRingan = x <= 30 || x >= 70 ? 0 : x <= 50 ? (x - 30) / 20 : (70 - x) / 20
      point.RusakBerat = x <= 50 ? 0 : x >= 70 ? 1 : (x - 50) / 20
    } else if (type === "output") {
      point.TidakLayak = x <= 30 ? 1 : x >= 50 ? 0 : (50 - x) / 20
      point.Dipertimbangkan = x <= 30 || x >= 70 ? 0 : x <= 50 ? (x - 30) / 20 : (70 - x) / 20
      point.Layak = x <= 50 ? 0 : x >= 70 ? 1 : (x - 50) / 20
    }
    // Simplified for others
    data.push(point)
  }

  const colors = {
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
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
                dataKey={type === "kondisi" ? "Baik" : "TidakLayak"}
                stroke={colors.green}
                fill={colors.green}
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey={type === "kondisi" ? "RusakRingan" : "Dipertimbangkan"}
                stroke={colors.yellow}
                fill={colors.yellow}
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey={type === "kondisi" ? "RusakBerat" : "Layak"}
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
