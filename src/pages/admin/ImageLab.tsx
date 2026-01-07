import { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2, Play } from 'lucide-react';

export function ImageLab() {
  const [brief, setBrief] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [availableWords, setAvailableWords] = useState<any[]>([]);
  const [sentRequest, setSentRequest] = useState<any>(null);
  const [receivedResponse, setReceivedResponse] = useState<any>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/history`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableWords(data);
      })
      .catch(err => console.error('Error loading words:', err));
  }, []);

  const handleLoadBrief = (selectedWord: string) => {
    const pattern = availableWords.find(p => p.word === selectedWord);
    if (pattern && pattern.image_brief) {
      setBrief(pattern.image_brief);
      setSentRequest(null);
      setReceivedResponse(null);
      setGeneratedImageUrl(null);
      setError(null);
    }
  };

  const handleGenerateImage = async () => {
    if (!brief.trim()) {
      setError('Please enter a brief');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSentRequest(null);
    setReceivedResponse(null);
    setGeneratedImageUrl(null);

    try {
      const request = { brief };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const responseData = await response.json();

      setSentRequest(request);
      setReceivedResponse(responseData);

      if (!response.ok) {
        setError(responseData.error || 'Failed to generate image');
        return;
      }

      if (responseData.image_url) {
        setGeneratedImageUrl(responseData.image_url);
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
          <ImageIcon className="text-teal-500" /> Image Lab
        </h1>
        <p className="text-slate-400">Test image generation in isolation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: Input */}
        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-bold text-teal-400 uppercase mb-4">Input</h2>
            
            <div className="space-y-4">
              {/* Load Brief */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Load Brief from Pattern</label>
                <select
                  onChange={(e) => handleLoadBrief(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="">Select a word...</option>
                  {availableWords
                    .filter(p => p.image_brief)
                    .map(p => (
                      <option key={p.id} value={p.word}>{p.word}</option>
                    ))}
                </select>
              </div>

              {/* Brief */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Image Brief</label>
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Enter image generation brief..."
                  rows={12}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-teal-500 resize-y"
                />
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={isGenerating || !brief.trim()}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white px-4 py-3 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Generate Image
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Output & Trace */}
        <div className="space-y-4">
          
          {/* Generated Image */}
          {generatedImageUrl && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-bold text-teal-400 uppercase mb-4">Generated Image</h2>
              <div className="bg-slate-950 border border-slate-800 rounded overflow-hidden">
                <img 
                  src={generatedImageUrl} 
                  alt="Generated" 
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-3">
                <a 
                  href={generatedImageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-teal-400 hover:text-teal-300 underline"
                >
                  Open in new tab
                </a>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Trace Data */}
          {sentRequest && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase mb-4">Trace Data</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Request Sent</h3>
                  <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-400 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {JSON.stringify(sentRequest, null, 2)}
                  </div>
                </div>

                {receivedResponse && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Response Received</h3>
                    <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-400 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {JSON.stringify(receivedResponse, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
