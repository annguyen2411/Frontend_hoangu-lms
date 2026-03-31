import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from './ui/Card';
import { TrendingUp } from 'lucide-react';
import { progressTracker } from '../utils/progressTracker';

export function ProgressLineChart() {
  const sessions = progressTracker.getStudySessions(30);
  
  // Group by date and calculate cumulative XP and lessons
  const dataMap = new Map<string, { xp: number; lessons: number }>();
  let cumulativeXP = 0;
  let cumulativeLessons = 0;

  sessions.forEach(session => {
    const dateKey = new Date(session.date).toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit' 
    });
    
    cumulativeXP += session.xpEarned;
    cumulativeLessons += session.lessonsCompleted;

    dataMap.set(dateKey, {
      xp: cumulativeXP,
      lessons: cumulativeLessons
    });
  });

  const data = Array.from(dataMap.entries()).map(([date, values]) => ({
    date,
    xp: values.xp,
    lessons: values.lessons
  })).slice(-14); // Last 14 days

  const totalXP = data.length > 0 ? data[data.length - 1].xp : 0;
  const totalLessons = data.length > 0 ? data[data.length - 1].lessons : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">Tiến độ tích lũy</h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)]" />
              <span className="text-sm text-muted-foreground">
                {totalXP.toLocaleString()} XP
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">
                {totalLessons} bài học
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <TrendingUp className="h-4 w-4" />
          <span className="font-semibold">Tiến bộ tốt!</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--muted-foreground)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            yAxisId="left"
            stroke="var(--muted-foreground)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="var(--muted-foreground)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}
            labelStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '14px' }}
            formatter={(value) => {
              if (value === 'xp') return 'Kinh nghiệm (XP)';
              if (value === 'lessons') return 'Bài học';
              return value;
            }}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="xp" 
            stroke="var(--theme-primary)" 
            strokeWidth={2}
            dot={{ fill: 'var(--theme-primary)', r: 4 }}
            activeDot={{ r: 6 }}
            name="xp"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="lessons" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
            name="lessons"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}