"use client";

import React from 'react';
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export function BudgetPieChart({ budget }: { budget: any[] }) {
  if (!budget || budget.length === 0) return null;

  const data = budget.map((b) => ({
    name: b.item,
    cost: parseInt(b.cost?.toString().replace(/[^0-9]/g, '') || '0')
  }));

  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);

  // Premium, harmonious color palette
  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316'];

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full h-full items-center justify-center select-none outline-none pointer-events-none md:pointer-events-auto">
      {/* Pie Chart Container */}
      <div className="h-[450px] w-full lg:w-1/2 outline-none flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart style={{ outline: 'none' }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={90}
              outerRadius={160}
              paddingAngle={3}
              dataKey="cost"
              stroke="none"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [`${Number(value).toLocaleString()} LEI`, "Cost"]}
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', borderRadius: '12px', outline: 'none', fontSize: '13px' }}
              itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Container */}
      <div className="h-[450px] w-full lg:w-1/2 flex items-center justify-center pl-0 lg:pl-10">
        <ul className="flex flex-col gap-3 p-0 m-0 w-full justify-center max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
          {data.map((item, index) => {
            const percent = totalCost > 0 ? ((item.cost / totalCost) * 100).toFixed(0) : '0';
            return (
              <li key={`legend-item-${index}`} className="flex items-start gap-3 text-[12px] text-zinc-300">
                <div className="w-3.5 h-3.5 rounded-[3px] mt-0.5 shrink-0 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="leading-tight">{item.name} <strong className="text-zinc-500">({percent}%)</strong></span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
