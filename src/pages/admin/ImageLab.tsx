import { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2, Play } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/history`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableWords(data);
      })
      .catch(err => console.error('Error loading words:', err));
  }, []);

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
          setBrief(data.visual_brief?.content || pattern.image_brief || '');
        } else {
          setBrief(pattern.image_brief || '');
        }
      } catch (err) {
        console.error('Failed to load visual brief:', err);
        setBrief(pattern.image_brief || '');
      }
      
      setOriginalImageUrl(pattern.image_url || null);
      setFlashImageUrl(null);
      setFlashGenerationTime(null);
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
        return;
      }

      if (responseData.image_url) {
        setFlashImageUrl(responseData.image_url);
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
        <p className="text-slate-400">Compare gemini-3-pro-image-preview (original) vs gemini-2.5-flash-image (cheaper alternative)</p>
      </div>

      {/* Pattern Selection */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-bold text-teal-400 uppercase mb-4">Select Pattern from Library</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Pattern</label>
            <select
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
              <div className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm">
                gemini-3-pro-image-preview (~$0.15)
              </div>
            </div>
          )}
        </div>

        {selectedPattern && (
          <div className="mt-4">
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
                  Generate with gemini-2.5-flash-image (cheaper)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Comparison Grid */}
      {selectedPattern && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
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

      {/* Brief Display */}
      {selectedPattern && brief && (
        <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase mb-4">Image Brief (Used for Both)</h2>
          <div className="bg-slate-950 border border-slate-800 rounded p-4 text-sm text-slate-300 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
            {brief}
          </div>
        </div>
      )}
    </div>
  );
}
