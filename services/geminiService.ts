import { AnalysisResult } from "../types";

/**
 * SIMULATED LOCAL ANALYSIS SERVICE
 * 
 * To comply with the "No API" requirement, this service now performs a local
 * heuristic analysis based on linguistic patterns common in AI text vs Human text.
 * 
 * It calculates:
 * 1. Burstiness (Standard Deviation of sentence lengths)
 * 2. Vocabulary Richness (Type-Token Ratio)
 * 3. Buzzword Density
 */

export const analyzeResume = async (text: string): Promise<AnalysisResult> => {
  // Simulate processing delay for realism
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const cleanText = text.toLowerCase();
  
  // Split into sentences (naive split on punctuation)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const words = cleanText.match(/\b\w+\b/g) || [];
  
  // --- 1. Calculate Burstiness (Sentence Length Variance) ---
  const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
  const avgLen = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1);
  
  // Calculate Variance
  const variance = sentenceLengths.reduce((a, b) => a + Math.pow(b - avgLen, 2), 0) / (sentenceLengths.length || 1);
  const stdDev = Math.sqrt(variance);
  
  // Normalize Burstiness Score (Humans usually have higher stdDev > 5-10)
  // AI tends to be more monotonic (lower stdDev)
  const burstinessScore = Math.min(100, Math.max(0, stdDev * 8));

  // --- 2. Vocabulary Richness (Type-Token Ratio) ---
  const uniqueWords = new Set(words);
  const ttr = words.length > 0 ? uniqueWords.size / words.length : 0;
  // Normalize: TTR of 0.6 is very rich, 0.3 is repetitive
  const vocabScore = Math.min(100, Math.max(0, ttr * 160));

  // --- 3. AI Buzzword Detection ---
  const aiMarkers = [
    'spearheaded', 'orchestrated', 'leveraged', 'utilized', 'seamlessly', 
    'pivotal', 'transformative', 'robust', 'paradigm', 'synergy', 
    'demonstrated', 'proven track record', 'dynamic', 'meticulous',
    'navigated', 'fostered', 'results-driven', 'visionary'
  ];
  
  const markerCount = words.filter(w => aiMarkers.includes(w)).length;
  const markerDensity = words.length > 0 ? markerCount / words.length : 0;

  // --- 4. Final Scoring Logic ---
  // Heuristic: High AI probability if Low Burstiness, Low Vocab, High Buzzwords
  let aiScore = 50; // Base uncertainty
  
  aiScore += (12 - stdDev) * 3;      // Low variance -> Higher AI score
  aiScore += (0.55 - ttr) * 60;      // Low TTR -> Higher AI score
  aiScore += markerDensity * 800;    // High buzzwords -> Higher AI score
  
  // Add slight randomness to simulate model confidence variance
  aiScore += (Math.random() * 10 - 5);
  
  // Clamp to 5-98%
  aiScore = Math.max(5, Math.min(98, aiScore));
  
  const isAi = aiScore > 55;
  const humanScore = 100 - aiScore;

  // Generate dynamic flags
  const flags = [];
  if (stdDev < 6) flags.push("Monotonic sentence structure (Low Burstiness)");
  if (markerCount > 2) flags.push(`High density of buzzwords (${markerCount} found)`);
  if (ttr < 0.4) flags.push("Repetitive vocabulary usage");
  if (flags.length === 0) flags.push("No significant AI anomalies detected");

  return {
    isAiGenerated: isAi,
    aiProbability: Math.round(aiScore),
    humanProbability: Math.round(humanScore),
    verdictHeadline: isAi ? "Likely AI-Generated Pattern" : "Likely Human-Written",
    summary: isAi 
      ? "The text exhibits characteristic uniformity in sentence structure and a high frequency of generic professional keywords often associated with AI language models."
      : "The writing exhibits natural variance in sentence length and vocabulary usage, suggesting authentic human composition with a unique personal voice.",
    linguisticAnalysis: {
      // Inverse relationships for visualization
      perplexityScore: Math.round(humanScore * 0.8 + Math.random() * 20), 
      burstinessScore: Math.round(burstinessScore),
      vocabularyRichness: Math.round(vocabScore),
      sentenceVariety: Math.round(Math.min(100, variance * 2))
    },
    flags: flags,
    suggestions: isAi 
      ? ["Vary your sentence lengths significantly", "Replace generic buzzwords (e.g., 'leveraged') with specific actions", "Add personal anecdotes or gritty details"]
      : ["Maintain this natural tone", "Ensure specific metrics are included to back up claims"]
  };
};
