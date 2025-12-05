import React, { useCallback, useState, useEffect } from 'react';
import { Upload, FileText, Search, Loader2, FileType, AlertCircle } from 'lucide-react';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import mammoth from 'mammoth';

interface FileUploadProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onAnalyze, isAnalyzing }) => {
  const [text, setText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize PDF worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      readFile(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      readFile(e.target.files[0]);
    }
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const readFile = async (file: File) => {
    setExtractionError(null);
    setIsExtracting(true);
    setText('');
    
    const name = file.name.toLowerCase();

    try {
      let extractedText = '';

      if (name.endsWith('.pdf')) {
        extractedText = await extractTextFromPdf(file);
      } else if (name.endsWith('.docx') || name.endsWith('.doc')) {
        extractedText = await extractTextFromDocx(file);
      } else {
        // Plain text / standard reading
        extractedText = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsText(file);
        });
      }

      if (!extractedText.trim()) {
        throw new Error("No text content could be found in this file.");
      }

      setText(extractedText);
    } catch (err: any) {
      console.error("Extraction error:", err);
      setExtractionError("Failed to read file. Please ensure it is a valid text-based PDF or DOCX, or copy-paste the text manually.");
    } finally {
      setIsExtracting(false);
    }
  };

  const isBusy = isAnalyzing || isExtracting;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div 
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'}
          ${isBusy ? 'opacity-50 pointer-events-none' : ''}
          ${extractionError ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${extractionError ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            {isExtracting ? <Loader2 className="animate-spin" size={32} /> : extractionError ? <AlertCircle size={32} /> : <Upload size={32} />}
          </div>
          <h3 className="text-xl font-semibold text-slate-800">
            {isExtracting ? 'Extracting Text...' : 'Upload Resume'}
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Drag & drop your resume file (PDF, DOCX, TXT) to automatically extract text and detect AI patterns.
          </p>
          
          {extractionError && (
            <p className="text-red-600 text-sm font-medium">{extractionError}</p>
          )}

          <div className="flex justify-center mt-4">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
              <span>Select a file</span>
              <input 
                id="file-upload" 
                name="file-upload" 
                type="file" 
                className="sr-only" 
                accept=".txt,.md,.json,.pdf,.docx,.doc"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-3 left-3 text-slate-400">
          {isExtracting ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isExtracting ? "Reading file content..." : "Or paste resume content here..."}
          className="w-full h-64 p-4 pl-10 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-700 shadow-sm"
          disabled={isBusy}
        />
        <div className="absolute bottom-4 right-4 text-xs text-slate-400">
          {text.length} chars
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={() => onAnalyze(text)}
          disabled={!text.trim() || isBusy}
          className={`
            flex items-center space-x-2 px-8 py-4 rounded-full text-lg font-semibold text-white shadow-lg transform transition-all
            ${!text.trim() || isBusy 
              ? 'bg-slate-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 hover:shadow-xl'}
          `}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              <span>Analyzing Patterns...</span>
            </>
          ) : (
            <>
              <Search size={20} />
              <span>Detect AI Content</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};