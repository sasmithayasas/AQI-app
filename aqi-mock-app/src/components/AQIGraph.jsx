import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function AQIGraph({ data, themeColor }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>{label}</p>
          <p style={{ margin: '4px 0 0', color: themeColor, fontSize: '18px', fontWeight: 'bold' }}>AQI: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 250, marginTop: '20px' }} className="glass-pod">
      <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#002d40' }}>48-Hour Forecast & History</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#002d40', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#002d40', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x="Today" stroke="#002d40" strokeDasharray="3 3" label={{ position: 'top', value: 'Now', fill: '#002d40', fontSize: 12 }} />
          <Area type="monotone" dataKey="aqi" stroke={themeColor} strokeWidth={3} fillOpacity={0.2} fill={themeColor} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
