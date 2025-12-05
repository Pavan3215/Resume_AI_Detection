import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell
} from 'recharts';
import { AnalysisResult } from '../types';

interface ChartsProps {
  data: AnalysisResult;
}

export const ProbabilityBarChart: React.FC<{ aiProb: number; humanProb: number }> = ({ aiProb, humanProb }) => {
  const chartData = [
    { name: 'AI Generated', value: aiProb, color: '#ef4444' },
    { name: 'Human Written', value: humanProb, color: '#22c55e' },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fontWeight: 600}} />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const FeatureRadarChart: React.FC<{ analysis: AnalysisResult['linguisticAnalysis'] }> = ({ analysis }) => {
  const data = [
    { subject: 'Perplexity', A: analysis.perplexityScore, fullMark: 100 },
    { subject: 'Burstiness', A: analysis.burstinessScore, fullMark: 100 },
    { subject: 'Vocab Richness', A: analysis.vocabularyRichness, fullMark: 100 },
    { subject: 'Sentence Variety', A: analysis.sentenceVariety, fullMark: 100 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="#3b82f6"
            fillOpacity={0.3}
          />
          <Tooltip 
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};