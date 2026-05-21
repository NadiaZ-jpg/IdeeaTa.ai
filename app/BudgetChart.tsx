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
  Cell
} from 'recharts';

export function BudgetBarChart({ budget }: { budget: any[] }) {
  if (!budget || budget.length === 0) return null;

  const data = budget.map((b) => ({
    name: b.item,
    cost: parseInt(b.cost?.toString().replace(/[^0-9]/g, '') || '0')
  }));

  const COLORS = ['#34d399', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa', '#2dd4bf', '#fb923c'];

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="name" stroke="#a1a1aa" tick={{fill: '#a1a1aa', fontSize: 12}} angle={-45} textAnchor="end" />
            <YAxis stroke="#a1a1aa" tick={{fill: '#a1a1aa'}} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '12px' }}
              itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
            />
            <Bar dataKey="cost" fill="#34d399" radius={[4, 4, 0, 0]} name="Cost (LEI)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[350px] w-full flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey="cost"
              stroke="none"
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              fontSize={10}
              fill="#d4d4d8"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '12px' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
