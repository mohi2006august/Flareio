import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

// Dummy data to match the visual in the screenshot
const data = [
  { time: '12:00', x: 67, m: 40, c: 19, b: 20 },
  { time: '15:00', x: 75, m: 42, c: 25, b: 21 },
  { time: '18:00', x: 81, m: 58, c: 33, b: 34 },
  { time: '21:00', x: 72, m: 50, c: 30, b: 32 },
  { time: '00:00', x: 71, m: 48, c: 24, b: 28 },
  { time: '03:00', x: 62, m: 38, c: 22, b: 20 },
  { time: '06:00', x: 76, m: 47, c: 27, b: 21 },
  { time: '09:00', x: 88, m: 58, c: 31, b: 15, isFuture: true },
  { time: '12:00', x: 97, m: 62, c: 28, b: 10, isFuture: true },
];

export default function FlareProbabilityChart() {
  return (
    <div style={{
      background: 'rgba(10, 15, 30, 0.7)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        fontFamily: 'Orbitron, sans-serif',
        fontWeight: '700',
        fontSize: '14px',
        letterSpacing: '1px',
        color: 'white',
        marginBottom: '20px'
      }}>
        FLARE PROBABILITY (NEXT 24 HOURS) <span style={{opacity: 0.5, marginLeft: '4px'}}>ⓘ</span>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '20px' }}>
        
        {/* Left: Legend and Probabilities */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '20px',
          minWidth: '120px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontWeight: 600 }}>
            <span style={{ color: '#ef4444' }}>X-Class</span>
            <span style={{ color: '#ef4444' }}>25%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontWeight: 600 }}>
            <span style={{ color: '#f4a623' }}>M-Class</span>
            <span style={{ color: '#f4a623' }}>65%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontWeight: 600 }}>
            <span style={{ color: '#eab308' }}>C-Class</span>
            <span style={{ color: '#eab308' }}>70%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontWeight: 600 }}>
            <span style={{ color: '#22c55e' }}>B-Class</span>
            <span style={{ color: '#22c55e' }}>40%</span>
          </div>
        </div>

        {/* Right: Line Chart */}
        <div style={{ flex: 1, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }} 
                itemStyle={{ fontFamily: 'Inter', fontSize: '12px' }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter', fontSize: '12px' }}
              />
              
              {/* Reference line for "Current Time" / start of forecast */}
              <ReferenceLine x="06:00" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />

              {/* Real Data Lines */}
              <Line type="monotone" dataKey="x" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="m" stroke="#f4a623" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="c" stroke="#eab308" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="b" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          
          <div style={{ 
            position: 'absolute', 
            top: 0, bottom: 0, left: 0, 
            display: 'flex', alignItems: 'center', 
            transform: 'rotate(-90deg) translateY(-20px) translateX(-50%)',
            transformOrigin: 'left center',
            fontFamily: 'Inter',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)'
          }}>
            Probability (%)
          </div>
          
          <div style={{ 
            position: 'absolute', 
            bottom: -20, left: 0, right: 0, 
            textAlign: 'center',
            fontFamily: 'Inter',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)'
          }}>
            Time (UTC)
          </div>
        </div>

      </div>
    </div>
  );
}
