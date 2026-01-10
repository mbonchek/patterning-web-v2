import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface VoicingResult {
  voicing: string;
  loading: boolean;
  error?: string;
}

export default function PatternPlay() {
  const [word, setWord] = useState('');
  const [layers, setLayers] = useState('');
  
  // Column 1: Current Patterning (with layers)
  const [patterningSystemPrompt, setPatterningSystemPrompt] = useState('');
  const [patterningUserPrompt, setPatterningUserPrompt] = useState('');
  const [patterningResult, setPatterningResult] = useState<VoicingResult>({ voicing: '', loading: false });
  
  // Column 2: PatternPlay (no layers, poetic)
  const [patternplaySystemPrompt, setPatternplaySystemPrompt] = useState('');
  const [patternplayUserPrompt, setPatternplayUserPrompt] = useState('');
  const [patternplayResult, setPatternplayResult] = useState<VoicingResult>({ voicing: '', loading: false });
  
  // Column 3: Custom
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [customUserPrompt, setCustomUserPrompt] = useState('');
  const [customUseLayers, setCustomUseLayers] = useState(false);
  const [customResult, setCustomResult] = useState<VoicingResult>({ voicing: '', loading: false });

  const loadPrompts = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      // Load current Patterning prompts from database
      const patterningResponse = await fetch(`${apiUrl}/api/prompts/word_verbal_voicing`);
      if (patterningResponse.ok) {
        const data = await patterningResponse.json();
        setPatterningSystemPrompt(data.system_prompt || '');
        setPatterningUserPrompt(data.template || '');
      }
      
      // Set PatternPlay prompts (legacy, more poetic)
      setPatternplaySystemPrompt(`You are a poetic voice that reveals the essence of words through evocative language.

Your task is to create a "voicing" - a poetic expression that captures the word's meaning, feeling, and resonance.

Guidelines:
- Use vivid, sensory language
- Embrace metaphor and imagery
- Capture emotional and experiential dimensions
- Be concise but evocative (2-4 sentences)
- Let the language breathe and resonate`);
      
      setPatternplayUserPrompt('Create a poetic voicing for the word: {{word}}');
      
      // Set custom to match PatternPlay initially
      setCustomSystemPrompt(patternplaySystemPrompt);
      setCustomUserPrompt(patternplayUserPrompt);
      
    } catch (error) {
      console.error('Error loading prompts:', error);
    }
  };

  const generateVoicing = async (
    systemPrompt: string,
    userPrompt: string,
    useLayers: boolean,
    setResult: React.Dispatch<React.SetStateAction<VoicingResult>>
  ) => {
    setResult({ voicing: '', loading: true });
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      // Replace placeholders
      let finalUserPrompt = userPrompt.replace(/\{\{word\}\}/g, word);
      if (useLayers && layers) {
        finalUserPrompt = finalUserPrompt.replace(/\{\{layers\}\}/g, layers);
      }
      
      const response = await fetch(`${apiUrl}/api/generate-voicing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: systemPrompt,
          user_prompt: finalUserPrompt
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate voicing');
      }
      
      const data = await response.json();
      setResult({ voicing: data.voicing, loading: false });
      
    } catch (error) {
      setResult({ 
        voicing: '', 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const generateAll = async () => {
    if (!word.trim()) {
      alert('Please enter a word');
      return;
    }
    
    // Generate all three in parallel
    await Promise.all([
      generateVoicing(patterningSystemPrompt, patterningUserPrompt, true, setPatterningResult),
      generateVoicing(patternplaySystemPrompt, patternplayUserPrompt, false, setPatternplayResult),
      generateVoicing(customSystemPrompt, customUserPrompt, customUseLayers, setCustomResult)
    ]);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold text-white mb-2">PatternPlay</h1>
        <p className="text-slate-400">Compare voicing generation approaches side-by-side</p>
      </div>

      {/* Input Section */}
      <div className="mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Word</label>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter a word..."
            className="w-full bg-[#1a1f2e] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Layers (Optional - for Patterning approach)
          </label>
          <textarea
            value={layers}
            onChange={(e) => setLayers(e.target.value)}
            placeholder="Paste layers content here..."
            rows={4}
            className="w-full bg-[#1a1f2e] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] font-mono text-sm"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={loadPrompts}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Load Prompts
          </button>
          <button
            onClick={generateAll}
            disabled={!word.trim() || patterningResult.loading || patternplayResult.loading || customResult.loading}
            className="px-6 py-3 bg-[#00f0ff] hover:bg-[#00d0dd] text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Sparkles size={20} />
            Generate All Voicings
          </button>
        </div>
      </div>

      {/* Three Column Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Current Patterning */}
        <VoicingColumn
          title="Current Patterning"
          subtitle="With layers, structured approach"
          systemPrompt={patterningSystemPrompt}
          setSystemPrompt={setPatterningSystemPrompt}
          userPrompt={patterningUserPrompt}
          setUserPrompt={setPatterningUserPrompt}
          result={patterningResult}
          borderColor="border-purple-500"
          useLayers={true}
        />

        {/* Column 2: PatternPlay */}
        <VoicingColumn
          title="PatternPlay"
          subtitle="No layers, poetic approach"
          systemPrompt={patternplaySystemPrompt}
          setSystemPrompt={setPatternplaySystemPrompt}
          userPrompt={patternplayUserPrompt}
          setUserPrompt={setPatternplayUserPrompt}
          result={patternplayResult}
          borderColor="border-[#00f0ff]"
          useLayers={false}
        />

        {/* Column 3: Custom */}
        <VoicingColumn
          title="Custom"
          subtitle="Your experimental approach"
          systemPrompt={customSystemPrompt}
          setSystemPrompt={setCustomSystemPrompt}
          userPrompt={customUserPrompt}
          setUserPrompt={setCustomUserPrompt}
          result={customResult}
          borderColor="border-green-500"
          useLayers={customUseLayers}
          setUseLayers={setCustomUseLayers}
        />
      </div>
    </div>
  );
}

interface VoicingColumnProps {
  title: string;
  subtitle: string;
  systemPrompt: string;
  setSystemPrompt: (value: string) => void;
  userPrompt: string;
  setUserPrompt: (value: string) => void;
  result: VoicingResult;
  borderColor: string;
  useLayers: boolean;
  setUseLayers?: (value: boolean) => void;
}

function VoicingColumn({
  title,
  subtitle,
  systemPrompt,
  setSystemPrompt,
  userPrompt,
  setUserPrompt,
  result,
  borderColor,
  useLayers,
  setUseLayers
}: VoicingColumnProps) {
  return (
    <div className={`bg-[#1a1f2e] rounded-lg border-2 ${borderColor} p-6 flex flex-col h-full`}>
      <div className="mb-4">
        <h3 className="text-xl font-serif font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-400">{subtitle}</p>
        {setUseLayers && (
          <label className="flex items-center gap-2 mt-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={useLayers}
              onChange={(e) => setUseLayers(e.target.checked)}
              className="rounded"
            />
            Use layers
          </label>
        )}
      </div>

      <div className="space-y-4 flex-1 flex flex-col">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={6}
            className="w-full bg-[#0d1117] border border-slate-700 rounded px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#00f0ff]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">User Prompt</label>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            rows={3}
            className="w-full bg-[#0d1117] border border-slate-700 rounded px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#00f0ff]"
          />
        </div>

        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-400 mb-2">Generated Voicing</label>
          <div className="bg-[#0d1117] border border-slate-700 rounded p-4 min-h-[200px]">
            {result.loading ? (
              <div className="flex items-center justify-center h-full text-[#00f0ff]">
                <div className="animate-pulse">Generating...</div>
              </div>
            ) : result.error ? (
              <div className="text-red-400 text-sm">{result.error}</div>
            ) : result.voicing ? (
              <p className="text-white text-sm leading-relaxed">{result.voicing}</p>
            ) : (
              <p className="text-slate-500 text-sm italic">No voicing generated yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
