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

const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const words = payload.value.split(' ');
  let line = '';
  const lines = [];
  words.forEach((word: string) => {
    if ((line + word).length > 25) {
      if (line) lines.push(line);
      line = word + ' ';
    } else {
      line += word + ' ';
    }
  });
  if (line) lines.push(line);

  // Center the text block horizontally under the tick
  const offset = ((lines.length - 1) * 13) / 2;

  return (
    <g transform={`translate(${x + offset},${y + 12})`}>
      <text textAnchor="end" fill="#a1a1aa" fontSize={11} transform="rotate(-90)">
        {lines.map((l: string, index: number) => (
          <tspan key={index} x={0} y={-index * 13}>{l.trim()}</tspan>
        ))}
      </text>
    </g>
  );
};

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
      <div className="h-[450px] w-full lg:w-1/2 outline-none">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 180 }} style={{ outline: 'none' }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#71717a" 
              interval={0} 
              tick={<CustomXAxisTick />}
            />
            <YAxis 
              stroke="#71717a" 
              tick={{ fill: '#a1a1aa', fontSize: 11 }} 
              width={50}
              tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', borderRadius: '12px', outline: 'none', fontSize: '13px' }}
              itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
            />
            <Bar dataKey="cost" fill="#10b981" radius={[4, 4, 0, 0]} name="Cost (LEI)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart Container */}
      <div className="h-[450px] w-full lg:w-1/2 flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart style={{ outline: 'none' }}>
            <Pie
              data={data}
              cx="40%"
              cy="55%"
              innerRadius={85}
              outerRadius={130}
              paddingAngle={3}
              dataKey="cost"
              stroke="none"
              label={false}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              cursor={false}
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', borderRadius: '12px', outline: 'none', fontSize: '13px' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right" 
              wrapperStyle={{ width: '50%', paddingLeft: '20px' }} 
              content={(props: any) => {
                const { payload } = props;
                return (
                  <ul className="flex flex-col gap-3 p-0 m-0 w-full justify-center max-h-[400px] overflow-y-auto">
                    {payload.map((entry: any, index: number) => {
                      const itemCost = entry?.payload?.cost || entry?.payload?.value || 0;
                      const percent = totalCost > 0 ? ((itemCost / totalCost) * 100).toFixed(0) : 0;
                      return (
                        <li key={`item-${index}`} className="flex items-start gap-2 text-[11px] text-zinc-300">
                          <div className="w-3 h-3 rounded-[3px] mt-0.5 shrink-0" style={{ backgroundColor: entry.color }} />
                          <span className="leading-tight">{entry.value} ({percent}%)</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
