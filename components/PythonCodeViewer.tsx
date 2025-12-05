import React, { useState } from 'react';
import { Copy, Check, FileCode, Server, Database } from 'lucide-react';

const FILES = [
  {
    name: 'main.py',
    icon: <Server size={16} />,
    language: 'python',
    content: `from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from core import ResumeAnalyzer
import io
from pypdf import PdfReader
from docx import Document

app = FastAPI(title="ResumeGuard AI API")

# Initialize Local Analyzer (Loads BERT model into memory)
analyzer = ResumeAnalyzer()

class AnalysisResult(BaseModel):
    is_ai_generated: bool
    ai_probability: float
    verdict: str
    flags: List[str]
    linguistic_score: float

def extract_text_from_file(content: bytes, filename: str) -> str:
    """Extract text from PDF, DOCX, or TXT bytes."""
    try:
        if filename.endswith('.pdf'):
            reader = PdfReader(io.BytesIO(content))
            return "\\n".join([page.extract_text() for page in reader.pages])
        elif filename.endswith('.docx') or filename.endswith('.doc'):
            doc = Document(io.BytesIO(content))
            return "\\n".join([para.text for para in doc.paragraphs])
        else:
            return content.decode("utf-8")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Text extraction failed: {str(e)}")

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_resume(
    file: UploadFile = File(None), 
    text: Optional[str] = None
):
    """
    Endpoint to analyze a resume using local BERT model.
    Supports PDF, DOCX, and Plain Text.
    """
    resume_text = ""

    if file:
        content = await file.read()
        resume_text = extract_text_from_file(content, file.filename.lower())
    elif text:
        resume_text = text
    else:
        raise HTTPException(status_code=400, detail="No resume provided")

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file")

    try:
        # Run inference locally
        result = analyzer.analyze(resume_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`
  },
  {
    name: 'core.py',
    icon: <Database size={16} />,
    language: 'python',
    content: `from transformers import pipeline
import torch
from typing import Dict, Any

class ResumeAnalyzer:
    def __init__(self):
        print("Loading local BERT model...")
        # Using a RoBERTa model fine-tuned for AI detection
        # This runs entirely on the host machine/server
        self.classifier = pipeline(
            "text-classification", 
            model="roberta-base-openai-detector",
            device=0 if torch.cuda.is_available() else -1
        )

    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Analyzes text using the local Transformer model.
        """
        # Truncate to model's max input length (usually 512 tokens)
        # For full docs, we would use a sliding window approach
        chunks = [text[i:i+2000] for i in range(0, len(text), 2000)]
        
        # Get prediction for the first/main chunk
        prediction = self.classifier(chunks[0])[0]
        
        # Mapping label to score
        label = prediction['label']
        score = prediction['score']
        
        is_ai = label == 'Fake' or label == 'AI-Generated'
        ai_probability = score * 100 if is_ai else (1 - score) * 100

        # Heuristic checks for flags (Burstiness/Perplexity would be calc here)
        flags = []
        if ai_probability > 80:
            flags.append("High confidence AI pattern match")

        return {
            "is_ai_generated": is_ai,
            "ai_probability": round(ai_probability, 2),
            "verdict": "Likely AI-Generated" if is_ai else "Likely Human-Written",
            "flags": flags,
            "linguistic_score": round(100 - ai_probability, 2)
        }
`
  },
  {
    name: 'requirements.txt',
    icon: <FileCode size={16} />,
    language: 'text',
    content: `fastapi==0.109.0
uvicorn==0.27.0
python-multipart==0.0.9
pydantic==2.6.0
torch==2.1.0
transformers==4.36.0
numpy==1.26.0
pypdf==3.17.4
python-docx==1.1.0`
  }
];

export const PythonCodeViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(FILES[activeTab].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Python Backend (Local Model)</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          This project can be deployed as a self-contained Python microservice using <strong>FastAPI</strong> and 
          <strong>Hugging Face Transformers</strong>. No external APIs are required.
        </p>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
        {/* Tab Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex space-x-1">
            {FILES.map((file, idx) => (
              <button
                key={file.name}
                onClick={() => setActiveTab(idx)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${activeTab === idx 
                    ? 'bg-slate-800 text-blue-400 border border-slate-700' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
                `}
              >
                {file.icon}
                <span>{file.name}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Area */}
        <div className="relative">
          <div className="absolute top-0 left-0 w-8 h-full bg-slate-900 border-r border-slate-800 flex flex-col items-center pt-4 text-xs text-slate-600 select-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-6">{i + 1}</div>
            ))}
          </div>
          <div className="pl-10 p-4 overflow-x-auto">
            <pre className="text-sm font-mono text-slate-300 leading-6">
              <code>{FILES[activeTab].content}</code>
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          title="FastAPI"
          desc="High-performance async web framework for building APIs with Python 3.8+."
        />
        <FeatureCard 
          title="Hugging Face Transformers"
          desc="Loads pre-trained BERT/RoBERTa models locally for inference without external calls."
        />
        <FeatureCard 
          title="PDF/DOCX Extraction"
          desc="Native Python libraries (pypdf, python-docx) handle binary file parsing seamlessly."
        />
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-600">{desc}</p>
  </div>
);