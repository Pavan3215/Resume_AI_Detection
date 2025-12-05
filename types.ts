export interface AnalysisMetric {
  name: string;
  score: number; // 0-100
  description: string;
}

export interface AnalysisResult {
  isAiGenerated: boolean;
  aiProbability: number; // 0-100
  humanProbability: number; // 0-100
  verdictHeadline: string;
  summary: string;
  linguisticAnalysis: {
    perplexityScore: number; // Low = AI, High = Human
    burstinessScore: number; // Low = AI, High = Human
    vocabularyRichness: number;
    sentenceVariety: number;
  };
  flags: string[]; // Specific phrases or patterns detected
  suggestions: string[]; // How to make it more human
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}
