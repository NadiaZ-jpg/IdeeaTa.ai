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

  const COLORS = ['#34d399', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa', '#2dd4bf', '#fb923c'];

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full h-full items-center justify-center select-none outline-none pointer-events-none md:pointer-events-auto" style={{ outline: 'none', userSelect: 'none', WebkitUserSelect: 'none' }} onContextMenu={(e) => e.preventDefault()}>
      <div className="h-[400px] w-full lg:w-1/2 outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 120 }} style={{ outline: 'none' }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="name" stroke="#a1a1aa" tick={{fill: '#a1a1aa', fontSize: 11}} angle={-45} textAnchor="end" interval={0} tickFormatter={(val) => val.length > 22 ? val.substring(0, 22) + '...' : val} />
            <YAxis stroke="#a1a1aa" tick={{fill: '#a1a1aa'}} width={80} />
            <Tooltip 
              cursor={false}
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '12px', outline: 'none' }}
              itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
            />
            <Bar dataKey="cost" fill="#34d399" radius={[4, 4, 0, 0]} name="Cost (LEI)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[400px] w-full lg:w-1/2 flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart style={{ outline: 'none' }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={95}
              paddingAngle={5}
              dataKey="cost"
              stroke="none"
              label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
              fontSize={18}
              fontWeight="900"
              fill="#d4d4d8"
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              cursor={false}
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '12px', outline: 'none' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right" 
              wrapperStyle={{ fontSize: '13px', color: '#e4e4e7', fontWeight: '500' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
