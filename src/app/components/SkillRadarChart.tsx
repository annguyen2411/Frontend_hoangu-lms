import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from './ui/Card';
import { TrendingUp } from 'lucide-react';
import { progressTracker } from '../utils/progressTracker';

export function SkillRadarChart() {
  const skills = progressTracker.getSkillLevels();
  
  const data = [
    { skill: 'Nghe', value: skills.listening, fullMark: 100 },
    { skill: 'Nói', value: skills.speaking, fullMark: 100 },
    { skill: 'Đọc', value: skills.reading, fullMark: 100 },
    { skill: 'Viết', value: skills.writing, fullMark: 100 },
  ];

  const averageSkill = (skills.listening + skills.speaking + skills.reading + skills.writing) / 4;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">Kỹ năng 4 chiều</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Trung bình: {Math.round(averageSkill)}/100
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)]" />
          <span className="text-sm text-muted-foreground">Trình độ hiện tại</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis 
            dataKey="skill" 
            stroke="var(--foreground)"
            style={{ fontSize: '14px', fontWeight: '600' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            stroke="var(--muted-foreground)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`${value}/100`, 'Điểm']}
          />
          <Radar 
            name="Kỹ năng" 
            dataKey="value" 
            stroke="var(--theme-primary)" 
            fill="var(--theme-primary)" 
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Skill Breakdown */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">👂 Nghe</span>
              <span className="font-semibold text-foreground">{skills.listening}/100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${skills.listening}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">💬 Nói</span>
              <span className="font-semibold text-foreground">{skills.speaking}/100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                style={{ width: `${skills.speaking}%` }}
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">📖 Đọc</span>
              <span className="font-semibold text-foreground">{skills.reading}/100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${skills.reading}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">✍️ Viết</span>
              <span className="font-semibold text-foreground">{skills.writing}/100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                style={{ width: `${skills.writing}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}