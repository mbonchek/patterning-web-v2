import { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2, Play, ChevronDown, ChevronRight } from 'lucide-react';

export function ImageLab() {
  const [word, setWord] = useState('');
  const [brief, setBrief] = useState('');
  const [essence, setEssence] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [availableWords, setAvailableWords] = useState<any[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [flashImageUrl, setFlashImageUrl] = useState<string | null>(null);
  const [flashGenerationTime, setFlashGenerationTime] = useState<number | null>(null);
  const [flashTrace, setFlashTrace] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTrace, setShowTrace] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [flashPrompt, setFlashPrompt] = useState<string>('');
  const [promptTemplate, setPromptTemplate] = useState<string>('');

  useEffect(() => {
    // Fetch available patterns
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/history`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableWords(data);
      })
      .catch(err => console.error('Error loading words:', err));
    
    // Fetch prompt template
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/prompts/word_visual_image`)
      .then(res => res.json())
      .then(data => {
        if (data.template) setPromptTemplate(data.template);
      })
      .catch(err => console.error('Error loading prompt template:', err));
  }, []);

  const reconstructPrompt = (template: string, wordValue: string, briefValue: string) => {
    return template
      .replace(/\{\{word\}\}/g, wordValue)
      .replace(/\{\{visual_brief\}\}/g, briefValue);
  };

  const handleLoadPattern = async (selectedWord: string) => {
    const pattern = availableWords.find(p => p.word === selectedWord);
    if (pattern) {
      setSelectedPattern(pattern);
      setWord(selectedWord);
      setEssence(pattern.essence || '');
      
      // Load the visual_brief from the pattern's visual_brief_id
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/patterns/${pattern.id}`);
        if (response.ok) {
          const data = await response.json();
          const visualBrief = data.visual_brief?.content || pattern.image_brief || '';
          setBrief(visualBrief);
          
          // Reconstruct the original prompt
          if (promptTemplate) {
            const reconstructed = reconstructPrompt(promptTemplate, selectedWord, visualBrief);
            setOriginalPrompt(reconstructed);
          }
        } else {
          const visualBrief = pattern.image_brief || '';
          setBrief(visualBrief);
          
          // Reconstruct the original prompt
          if (promptTemplate) {
            const reconstructed = reconstructPrompt(promptTemplate, selectedWord, visualBrief);
            setOriginalPrompt(reconstructed);
          }
        }
      } catch (err) {
        console.error('Failed to load visual brief:', err);
        const visualBrief = pattern.image_brief || '';
        setBrief(visualBrief);
        
        // Reconstruct the original prompt
        if (promptTemplate) {
          const reconstructed = reconstructPrompt(promptTemplate, selectedWord, visualBrief);
          setOriginalPrompt(reconstructed);
        }
      }
      
      setOriginalImageUrl(pattern.image_url || null);
      setFlashImageUrl(null);
      setFlashGenerationTime(null);
      setFlashTrace(null);
      setFlashPrompt('');
      setError(null);
    }
  };

  const handleGenerateFlash = async () => {
    if (!brief.trim()) {
      setError('Please load a pattern first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setFlashImageUrl(null);
    setFlashGenerationTime(null);
    setFlashTrace(null);
    setFlashPrompt('');

    const startTime = Date.now();

    try {
      const request = { 
        word: word || 'test',
        essence: essence || '',
        brief,
        model: 'gemini-2.5-flash-image'
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const responseData = await response.json();
      const endTime = Date.now();
      setFlashGenerationTime(endTime - startTime);

      if (!response.ok) {
        setError(responseData.error || 'Failed to generate image');
        setFlashTrace(responseData.trace || null);
        return;
      }

      if (responseData.image_url) {
        setFlashImageUrl(responseData.image_url);
      }
      
      if (responseData.trace) {
        setFlashTrace(responseData.trace);
        // Extract the full prompt from trace if available
        if (responseData.trace.request?.prompt) {
          setFlashPrompt(responseData.trace.request.prompt);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <ImageIcon className="text-teal-500" /> Image Lab - Model Comparison
        </h1>
        <p className="text-slate-400">Compare gemini-3-pro-image-preview (original) vs gemini-2.5-flash-image (15x cheaper)</p>
      </div>

      {/* Pattern Selection & Prompt Editing */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-bold text-teal-400 uppercase mb-4">1. Select Pattern & Edit Prompt</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Pattern from Library</label>
              <select
                value={word}
                onChange={(e) => handleLoadPattern(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="">Select a pattern...</option>
                {availableWords.map(p => (
                  <option key={p.id} value={p.word}>{p.word}</option>
                ))}
              </select>
            </div>
            
            {selectedPattern && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Original Model</label>
                <div className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-purple-400 text-sm font-mono">
                  gemini-3-pro-image-preview (~$0.15)
                </div>
              </div>
            )}
          </div>

          {/* Original Prompt (Reconstructed) */}
          {selectedPattern && originalPrompt && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Original Prompt (sent to gemini-3-pro-image-preview)
              </label>
              <div className="bg-slate-950 border border-purple-800/50 rounded px-3 py-2 text-slate-300 text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                {originalPrompt}
              </div>
            </div>
          )}

          {selectedPattern && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Visual Brief (Edit to test different prompts with gemini-2.5-flash)
              </label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Visual brief will load here..."
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-teal-500 resize-y"
              />
            </div>
          )}

          {/* Flash Prompt (After Generation) */}
          {flashPrompt && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                New Prompt (sent to gemini-2.5-flash-image)
              </label>
              <div className="bg-slate-950 border border-cyan-800/50 rounded px-3 py-2 text-slate-300 text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                {flashPrompt}
              </div>
            </div>
          )}

          {selectedPattern && (
            <button
              onClick={handleGenerateFlash}
              disabled={isGenerating || !brief.trim()}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white px-4 py-3 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Generating with gemini-2.5-flash-image...
                </>
              ) : (
                <>
                  <Play size={18} />
                  2. Generate with gemini-2.5-flash-image (~$0.01)
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Comparison Grid */}
      {selectedPattern && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Original Image (gemini-3-pro) */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-purple-400 uppercase">Original (gemini-3-pro)</h2>
              <span className="text-xs text-slate-400">~$0.15 per image</span>
            </div>
            
            {originalImageUrl ? (
              <div className="space-y-3">
                <div className="bg-slate-950 border border-slate-800 rounded overflow-hidden">
                  <img 
                    src={originalImageUrl} 
                    alt="Original" 
                    className="w-full h-auto"
                  />
                </div>
                <a 
                  href={originalImageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-teal-400 hover:text-teal-300 underline"
                >
                  Open in new tab
                </a>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded p-8 text-center text-slate-500">
                No image available for this pattern
              </div>
            )}
          </div>

          {/* New Image (gemini-2.5-flash) */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-cyan-400 uppercase">New (gemini-2.5-flash)</h2>
              <span className="text-xs text-slate-400">~$0.01 per image (15x cheaper)</span>
            </div>
            
            {flashImageUrl ? (
              <div className="space-y-3">
                <div className="bg-slate-950 border border-slate-800 rounded overflow-hidden">
                  <img 
                    src={flashImageUrl} 
                    alt="Flash Generated" 
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <a 
                    href={flashImageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-teal-400 hover:text-teal-300 underline"
                  >
                    Open in new tab
                  </a>
                  {flashGenerationTime && (
                    <span className="text-xs text-slate-400">
                      Generated in {(flashGenerationTime / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded p-8 text-center text-slate-500">
                {isGenerating ? 'Generating...' : 'Click "Generate" above to create comparison image'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trace Data */}
      {flashTrace && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <button
            onClick={() => setShowTrace(!showTrace)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-sm font-bold text-slate-400 uppercase">Request Trace (gemini-2.5-flash)</h2>
            {showTrace ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
          </button>
          
          {showTrace && (
            <div className="mt-4 space-y-4">
              {/* Model & Config */}
              <div>
                <h3 className="text-xs font-bold text-teal-400 uppercase mb-2">Model & Configuration</h3>
                <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-300 font-mono whitespace-pre-wrap">
                  {JSON.stringify({
                    model: 'gemini-2.5-flash-image',
                    config: {
                      response_modalities: ['IMAGE'],
                      generation_config: {
                        image_config: {
                          aspect_ratio: '16:9',
                          image_size: '1K'
                        }
                      }
                    }
                  }, null, 2)}
                </div>
              </div>

              {/* Full Trace */}
              <div>
                <h3 className="text-xs font-bold text-orange-400 uppercase mb-2">Full Response Trace</h3>
                <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-400 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {JSON.stringify(flashTrace, null, 2)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
