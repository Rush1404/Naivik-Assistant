import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const GanttView = ({ data }) => {
  // Set "Today" to Feb 1, 2026 to match your stress test environment
  const today = new Date('2026-02-01');
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  // Define the 7-day window (3.5 days back, 3.5 days forward)
  const dayInMs = 86400000;
  const domain = [
    todayMs - (3.5 * dayInMs), 
    todayMs + (3.5 * dayInMs)
  ];

  const chartData = data
    .map((item) => {
      const parseDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return todayMs;
        const [m, d, y] = dateStr.split('/');
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).getTime();
      };

      const start = parseDate(item.date);
      const duration = 3 * dayInMs; // 3-day bar length
      const end = start + duration;

      return {
        name: item.task,
        start: start,
        end: end,
        duration: duration,
        priority: item.priority,
        displayDate: item.date
      };
    })
    // ZOOM FILTER: Only show tasks that fall within our 7-day domain
    .filter(task => task.end >= domain[0] && task.start <= domain[1])
    .sort((a, b) => a.start - b.start);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, priority, displayDate } = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 shadow-xl rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="font-bold text-slate-900 dark:text-white text-xs">{name}</p>
          <p className="text-[10px] text-slate-500 mb-1">Target: {displayDate}</p>
          <p className={`text-[10px] font-black uppercase ${priority === 'High' ? 'text-rose-500' : 'text-indigo-500'}`}>
            {priority} Priority
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[450px] bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Project Timeline</h3>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">7-Day Rolling View</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Today: Feb 1
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart 
          layout="vertical" 
          data={chartData} 
          margin={{ left: -20, right: 30, top: 10 }}
          barSize={14}
        >
          <XAxis 
            type="number" 
            domain={domain} 
            scale="time" 
            tickFormatter={(t) => new Date(t).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })} 
            stroke="#94a3b8"
            fontSize={10}
            fontWeight="600"
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          
          <ReferenceLine 
            x={todayMs} 
            stroke="#f59e0b" 
            strokeWidth={2}
            strokeDasharray="4 4" 
          />

          <Bar dataKey="start" stackId="a" fill="transparent" />
          <Bar dataKey="duration" stackId="a" radius={[4, 4, 4, 4]}>
            {chartData.map((entry, i) => (
              <Cell 
                key={i} 
                fill={entry.priority === 'High' ? '#f43f5e' : entry.priority === 'Medium' ? '#6366f1' : '#94a3b8'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GanttView;