"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export function BudgetPieChart({ budget, currency = "LEI", isPdf = false, isPptx = false }: { budget: any[], currency?: string, isPdf?: boolean, isPptx?: boolean }) {
  if (!budget || budget.length === 0) return null;

  const data = budget.map((b) => ({
    name: b.item,
    cost: parseInt(b.cost?.toString().replace(/[^0-9]/g, '') || '0')
  })).sort((a, b) => b.cost - a.cost);

  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);

  // Premium, harmonious color palette
  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316'];

  const disableAnimation = isPdf || isPptx;

  return (
    <div className={`flex ${isPdf || isPptx ? 'flex-row' : 'flex-col lg:flex-row'} gap-8 w-full h-full items-center justify-center select-none outline-none pointer-events-none md:pointer-events-auto`}>
      {/* Pie Chart Container */}
      <motion.div 
        className={`h-[450px] ${isPdf || isPptx ? 'w-1/2' : 'w-full lg:w-1/2'} outline-none flex justify-center items-center`}
        initial={disableAnimation ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.8, rotate: -20 }}
        whileInView={disableAnimation ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
        viewport={disableAnimation ? undefined : { once: true, margin: "-50px" }}
        transition={disableAnimation ? undefined : { duration: 0.8, type: "spring", bounce: 0.4 }}
      >
        {disableAnimation ? (
          <PieChart width={isPptx ? 500 : 400} height={isPptx ? 450 : 400} style={{ outline: 'none' }}>
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
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        ) : (
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
                isAnimationActive={true}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [`${Number(value).toLocaleString()} ${currency}`, "Cost"]}
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', borderRadius: '12px', outline: 'none', fontSize: '13px' }}
                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Legend Container */}
      <motion.div 
        className={`${isPdf || isPptx ? 'w-1/2 pl-10' : 'w-full lg:w-1/2 pl-0 lg:pl-10'} flex items-center justify-center py-4`}
        initial={disableAnimation ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
        whileInView={disableAnimation ? undefined : { opacity: 1, x: 0 }}
        viewport={disableAnimation ? undefined : { once: true, margin: "-50px" }}
        transition={disableAnimation ? undefined : { duration: 0.6, delay: 0.2 }}
      >
        <ul className="flex flex-col gap-2 p-0 m-0 w-full justify-center">
          {data.map((item, index) => {
            const percent = totalCost > 0 ? ((item.cost / totalCost) * 100).toFixed(0) : '0';
            return (
              <li key={`legend-item-${index}`} className={`flex items-start gap-2.5 ${isPdf ? 'text-[18px] text-gray-700 font-medium' : 'text-[14px] text-zinc-300'}`}>
                <div className="w-4 h-4 rounded-[3px] mt-1 shrink-0 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="leading-tight">{item.name} <strong className={isPdf ? 'text-gray-500 font-bold' : 'text-zinc-500'}>({percent}%)</strong></span>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}

