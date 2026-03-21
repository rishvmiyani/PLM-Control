"use client"

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts"

interface Props {
  data: {
    openECOs: number
    doneECOs: number
    conflictECOs: number
    highRiskECOs: number
    totalProducts: number
    totalBOMs: number
  }
}

const PIE_COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#f97316"]

export default function AdminCharts({ data }: Props) {
  const barData = [
    { name: "Open ECOs", value: data.openECOs, fill: "#3b82f6" },
    { name: "Done ECOs", value: data.doneECOs, fill: "#22c55e" },
    { name: "Conflicts", value: data.conflictECOs, fill: "#ef4444" },
    { name: "High Risk", value: data.highRiskECOs, fill: "#f97316" },
    { name: "Products", value: data.totalProducts, fill: "#8b5cf6" },
    { name: "BOMs", value: data.totalBOMs, fill: "#06b6d4" },
  ]

  const pieData = [
    { name: "Open", value: data.openECOs },
    { name: "Done", value: data.doneECOs },
    { name: "Conflict", value: data.conflictECOs },
    { name: "High Risk", value: data.highRiskECOs },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Bar Chart */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h3 className="font-semibold text-zinc-800 text-sm mb-4">Platform Overview</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} barSize={32}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e4e4e7",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h3 className="font-semibold text-zinc-800 text-sm mb-4">ECO Status Distribution</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e4e4e7",
                fontSize: "12px",
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
