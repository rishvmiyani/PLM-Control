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

const PIE_COLORS = ["#8b3b9e", "#be71d1", "#e6c6ed", "#8b3b9e"]

export default function AdminCharts({ data }: Props) {
  const barData = [
    { name: "Open ECOs", value: data.openECOs, fill: "#8b3b9e" },
    { name: "Done ECOs", value: data.doneECOs, fill: "#be71d1" },
    { name: "Conflicts", value: data.conflictECOs, fill: "#e6c6ed" },
    { name: "High Risk", value: data.highRiskECOs, fill: "#8b3b9e" },
    { name: "Products", value: data.totalProducts, fill: "#be71d1" },
    { name: "BOMs", value: data.totalBOMs, fill: "#e6c6ed" },
  ]

  const pieData = [
    { name: "Open", value: data.openECOs },
    { name: "Done", value: data.doneECOs },
    { name: "Conflict", value: data.conflictECOs },
    { name: "High Risk", value: data.highRiskECOs },
  ]

  return (
    <div className="font-['DM_Sans'] grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-8">
      {/* Bar Chart */}
      <div className="glass-card">
        <h3 className="font-semibold text-[#8b3b9e] text-sm mb-6 tracking-wide">Platform Overview</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} barSize={36}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: "#8b3b9e" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: "#8b3b9e" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid rgba(139, 59, 158, 0.2)",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                fontSize: "13px",
                fontFamily: 'DM Sans',
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="glass-card">
        <h3 className="font-semibold text-[#8b3b9e] text-sm mb-6 tracking-wide">ECO Status Distribution</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid rgba(139, 59, 158, 0.2)",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                fontSize: "13px",
                fontFamily: 'DM Sans',
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ 
                fontSize: "12px", 
                fontFamily: 'DM Sans',
                color: "#8b3b9e"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}