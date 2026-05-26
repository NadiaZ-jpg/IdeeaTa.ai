"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export function BudgetBarChart({ budget }: { budget: any[] }) {
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
      {/* Bar Chart Container */}
      <div className="h-[380px] w-full lg:w-1/2 outline-none">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 80 }} style={{ outline: 'none' }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#71717a" 
              tick={{ fill: '#a1a1aa', fontSize: 10 }} 
              angle={-35} 
              textAnchor="end" 
              interval={0} 
              tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val} 
            />
            <YAxis 
              stroke="#71717a" 
              tick={{ fill: '#a1a1aa', fontSize: 10 }} 
              width={60}
              tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', borderRadius: '12px', outline: 'none', fontSize: '12px' }}
              itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
            />
            <Bar dataKey="cost" fill="#10b981" radius={[4, 4, 0, 0]} name="Cost (LEI)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart Container */}
      <div className="h-[380px] w-full lg:w-1/2 flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart style={{ outline: 'none' }}>
            <Pie
              data={data}
              cx="35%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="cost"
              stroke="none"
              label={false} // Disable labels on the chart to prevent clutter/overlaps
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              cursor={false}
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', borderRadius: '12px', outline: 'none', fontSize: '12px' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right" 
              wrapperStyle={{ fontSize: '11px', color: '#e4e4e7', fontWeight: '500', maxWidth: '55%' }} 
              formatter={(value, entry, index) => {
                const item = data[index];
                if (!item) return value;
                const percent = totalCost > 0 ? ((item.cost / totalCost) * 100).toFixed(0) : 0;
                return `${value.length > 20 ? value.substring(0, 20) + '...' : value} (${percent}%)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
