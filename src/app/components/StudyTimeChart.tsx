import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from './ui/Card';
import { TrendingUp } from 'lucide-react';
import { progressTracker } from '../utils/progressTracker';

export function StudyTimeChart() {
  const data = progressTracker.getStudyTimeByPeriod(7).map(item => ({
    date: item.date.toLocaleDateString('vi-VN', { weekday: 'short' }),
    duration: item.duration,
    fullDate: item.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  }));

  const totalTime = data.reduce((sum, d) => sum + d.duration, 0);
  const avgTime = totalTime / data.length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">Thời gian học 7 ngày</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Trung bình: {Math.round(avgTime)} phút/ngày
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--theme-primary)]">
          <TrendingUp className="h-4 w-4" />
          <span className="font-semibold">+{Math.round((avgTime / 30) * 100)}%</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--muted-foreground)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="var(--muted-foreground)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}
            labelStyle={{ color: 'var(--foreground)' }}
            formatter={(value: number) => [`${value} phút`, 'Thời gian học']}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullDate;
              }
              return label;
            }}
          />
          <Bar 
            dataKey="duration" 
            fill="url(#colorGradient)" 
            radius={[8, 8, 0, 0]}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--theme-gradient-from)" />
              <stop offset="100%" stopColor="var(--theme-gradient-to)" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}