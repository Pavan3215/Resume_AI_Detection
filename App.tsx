import React, { useState } from 'react';
import { ShieldCheck, Cpu, BarChart3, AlertTriangle, CheckCircle2, RefreshCw, Code2, PlayCircle } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ProbabilityBarChart, FeatureRadarChart } from './components/Charts';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { analyzeResume } from './services/geminiService';
import { AnalysisResult, AppState } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [viewMode, setViewMode] = useState<'demo' | 'code'>('demo');

  const handleAnalyze = async (text: string) => {
    setAppState(AppState.ANALYZING);
    setErrorMsg('');

    try {
      // Local analysis service (No API key required)
      const data = await analyzeResume(text);
      setResult(data);
      setAppState(AppState.RESULTS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during analysis.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setViewMode('demo')}>
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              ResumeGuard AI
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="hidden md:flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('demo')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'demo' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <PlayCircle size={16} />
                <span>Live Demo</span>
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'code' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Code2 size={16} />
                <span>Python Code</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Toggle (Visible only on small screens) */}
      <div className="md:hidden px-4 py-2 bg-white border-b border-slate-200 flex justify-center">
        <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 w-full max-w-xs flex">
          <button
            onClick={() => setViewMode('demo')}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'demo' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <PlayCircle size={16} />
            <span>Live Demo</span>
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'code' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Code2 size={16} />
            <span>Python Code</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {viewMode === 'code' ? (
          <PythonCodeViewer />
        ) : (
          <>
            {/* State: IDLE or ANALYZING */}
            {(appState === AppState.IDLE || appState === AppState.ANALYZING) && (
              <div className="animate-fade-in-up">
                <div className="text-center mb-12">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    Is that Resume <span className="text-blue-600">Human</span> or <span className="text-indigo-600">AI?</span>
                  </h1>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Advanced NLP forensics to detect generated content. No external API required for this demo.
                  </p>
                </div>

                <FileUpload onAnalyze={handleAnalyze} isAnalyzing={appState === AppState.ANALYZING} />
              </div>
            )}

            {/* State: ERROR */}
            {appState === AppState.ERROR && (
               <div className="max-w-2xl mx-auto text-center mt-12 p-8 bg-white rounded-2xl shadow-xl border border-red-100">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
                    <AlertTriangle size={32} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800 mb-2">Analysis Failed</h2>
                 <p className="text-slate-600 mb-8">{errorMsg}</p>
                 <button 
                   onClick={handleReset}
                   className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                 >
                   Try Again
                 </button>
               </div>
            )}

            {/* State: RESULTS */}
            {appState === AppState.RESULTS && result && (
              <div className="space-y-8 animate-fade-in">
                {/* Top Bar: Verdict */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className={`p-1 h-2 w-full ${result.isAiGenerated ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <div className="p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase ${
                          result.isAiGenerated ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {result.isAiGenerated ? 'AI Generated' : 'Human Written'}
                        </span>
                        <span className="text-slate-400 text-sm">Confidence: {(Math.max(result.aiProbability, result.humanProbability)).toFixed(0)}%</span>
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-4">{result.verdictHeadline}</h2>
                      <p className="text-slate-600 text-lg leading-relaxed">{result.summary}</p>
                    </div>
                    
                    <div className="flex-shrink-0 text-center">
                      <div className="relative inline-flex items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                          <circle 
                            cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" 
                            strokeDasharray={351.86} 
                            strokeDashoffset={351.86 - (351.86 * result.aiProbability) / 100} 
                            className={result.isAiGenerated ? 'text-red-500' : 'text-green-500'}
                          />
                        </svg>
                        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-slate-900">{result.aiProbability}%</span>
                          <span className="text-xs text-slate-500 uppercase font-semibold">AI Prob</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Col: Charts */}
                  <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-blue-500"/> Probability Split
                      </h3>
                      <ProbabilityBarChart aiProb={result.aiProbability} humanProb={result.humanProbability} />
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                        <Cpu size={20} className="text-indigo-500"/> Linguistic Features
                      </h3>
                      <FeatureRadarChart analysis={result.linguisticAnalysis} />
                      <div className="mt-4 text-xs text-slate-400 text-center">
                        High scores generally indicate human-like variance (Burstiness, Perplexity)
                      </div>
                    </div>
                  </div>

                  {/* Right Col: Details */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Metric Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <MetricCard 
                        title="Perplexity" 
                        value={result.linguisticAnalysis.perplexityScore} 
                        label="Predictability"
                        desc="Low = AI"
                      />
                      <MetricCard 
                        title="Burstiness" 
                        value={result.linguisticAnalysis.burstinessScore} 
                        label="Sentence Var"
                        desc="Low = AI"
                      />
                      <MetricCard 
                        title="Vocab" 
                        value={result.linguisticAnalysis.vocabularyRichness} 
                        label="Diversity"
                        desc="Low = AI"
                      />
                      <MetricCard 
                        title="Structure" 
                        value={result.linguisticAnalysis.sentenceVariety} 
                        label="Complexity"
                        desc="Low = AI"
                      />
                    </div>

                    {/* Analysis Breakdown */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                      <h3 className="text-xl font-bold text-slate-900 mb-6">Forensic Analysis</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Detected Flags</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.flags.map((flag, idx) => (
                              <span key={idx} className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-50 text-orange-700 text-sm font-medium border border-orange-100">
                                <AlertTriangle size={14} className="mr-1.5" /> {flag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                           <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Improvement Suggestions</h4>
                           <ul className="space-y-3">
                             {result.suggestions.map((suggestion, idx) => (
                               <li key={idx} className="flex items-start text-slate-600">
                                 <CheckCircle2 size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                 <span>{suggestion}</span>
                               </li>
                             ))}
                           </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pb-12">
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-300 rounded-full text-slate-700 font-medium hover:bg-slate-50 hover:shadow-md transition-all"
                  >
                    <RefreshCw size={18} />
                    <span>Analyze Another Resume</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const MetricCard: React.FC<{ title: string; value: number; label: string; desc: string }> = ({ title, value, label, desc }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
    <div className="text-xs text-slate-400 font-semibold uppercase mb-1">{title}</div>
    <div className={`text-2xl font-bold mb-1 ${value < 40 ? 'text-red-500' : 'text-slate-800'}`}>{value}</div>
    <div className="text-xs text-slate-500 font-medium">{label}</div>
    <div className="text-[10px] text-slate-400 mt-1">{desc}</div>
  </div>
);

export default App;
