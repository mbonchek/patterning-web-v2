import { useState, useEffect } from 'react';
import { FileText, Loader2, Copy, Check, Play } from 'lucide-react';

export function BriefLab() {
  const [word, setWord] = useState('');
  const [voicing, setVoicing] = useState('');
  const [essence, setEssence] = useState('');
  const [layers, setLayers] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [availableWords, setAvailableWords] = useState<any[]>([]);
  const [sentRequest, setSentRequest] = useState<any>(null);
  const [receivedResponse, setReceivedResponse] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/history`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableWords(data);
      })
      .catch(err => console.error('Error loading words:', err));
  }, []);

  const handleLoadWord = (selectedWord: string) => {
    const pattern = availableWords.find(p => p.word === selectedWord);
    if (pattern) {
      setWord(pattern.word);
      setVoicing(pattern.voicing || '');
      setEssence(pattern.essence || '');
      setLayers(pattern.layers || '');
      setSentRequest(null);
      setReceivedResponse(null);
      setGeneratedContent(null);
      setError(null);
    }
  };

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerateBrief = async () => {
    setIsGenerating(true);
    setError(null);
    setSentRequest(null);
    setReceivedResponse(null);
    setGeneratedContent(null);

    try {
      const request = { 
        word,
        voicing,
        essence,
        layers
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/generate-brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const responseData = await response.json();

      setSentRequest(request);
      setReceivedResponse(responseData);

      if (!response.ok) {
        setError(responseData.error || 'Failed to generate brief');
        return;
      }

      if (responseData.content) {
        setGeneratedContent(responseData.content);
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
          <FileText className="text-teal-500" /> Brief Lab
        </h1>
        <p className="text-slate-400">Test image brief generation in isolation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: Inputs */}
        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-bold text-teal-400 uppercase mb-4">Input Variables</h2>
            
            <div className="space-y-4">
              {/* Load Word */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Load Word</label>
                <select
                  value={word}
                  onChange={(e) => handleLoadWord(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="">Select a word...</option>
                  {availableWords.map(p => (
                    <option key={p.id} value={p.word}>{p.word}</option>
                  ))}
                </select>
              </div>

              {/* Word */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Word</label>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="Enter word..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Voicing */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Voicing</label>
                <textarea
                  value={voicing}
                  onChange={(e) => setVoicing(e.target.value)}
                  placeholder="Enter voicing..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-teal-500 resize-y"
                />
              </div>

              {/* Essence */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Essence</label>
                <textarea
                  value={essence}
                  onChange={(e) => setEssence(e.target.value)}
                  placeholder="Enter essence..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-teal-500 resize-y"
                />
              </div>

              {/* Layers */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Layers</label>
                <textarea
                  value={layers}
                  onChange={(e) => setLayers(e.target.value)}
                  placeholder="Enter layers..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-teal-500 resize-y"
                />
              </div>

              <button
                onClick={handleGenerateBrief}
                disabled={isGenerating || !word}
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
                    Generate Brief
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Output & Trace */}
        <div className="space-y-4">
          
          {/* Generated Brief */}
          {generatedContent && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-teal-400 uppercase">Generated Brief</h2>
                <button
                  onClick={handleCopy}
                  className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded p-4 text-sm text-slate-300 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                {generatedContent}
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
