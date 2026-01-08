import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Play, Check, AlertCircle, Copy, Settings, Search, History, Diff, Eye, EyeOff } from 'lucide-react';

interface Prompt {
  id: string;
  slug: string;
  version: number;
  template: string;
  is_active: boolean;
  description: string | null;
  input_variables: string[];
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
}

interface Pattern {
  id: string;
  word: string;
  layers?: string;
  voicing?: string;
  essence?: string;
  image_brief?: string;
  created_at: string;
  // V2 schema fields
  seed?: { text: string };
  verbal_layer?: { content: string };
  verbal_voicing?: { content: string };
  verbal_essence?: { content: string };
  visual_layer?: { content: string };
  visual_essence?: { content: string };
}

export function PromptEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  
  // Editor State
  const [template, setTemplate] = useState('');
  const [description, setDescription] = useState('');

  // Model Config State
  const [config, setConfig] = useState({
    temperature: 0.7,
    max_tokens: 4096,
    top_p: 1,
    top_k: 40
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  
  // Playground State
  const [testInputs, setTestInputs] = useState<Record<string, string>>({});
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [activeOutput, setActiveOutput] = useState<string | null>(null);
  const [recentPatterns, setRecentPatterns] = useState<Pattern[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [detectedVars, setDetectedVars] = useState<string[]>([]);

  useEffect(() => {
    loadPrompt();
    loadRecentPatterns();
  }, [id]);

  // Automatically detect variables in template
  useEffect(() => {
    const matches = template.match(/\{\{([^}]+)\}\}/g) || [];
    const vars = matches.map(m => m.replace(/\{\{|\}\}/g, '').trim());
    const uniqueVars = Array.from(new Set(vars));
    setDetectedVars(uniqueVars);
    
    setTestInputs(prev => {
      const next = { ...prev };
      uniqueVars.forEach(v => {
        if (next[v] === undefined) next[v] = '';
      });
      return next;
    });
  }, [template]);

  const loadRecentPatterns = async (query = '') => {
    setIsSearching(!!query);
    try {
      const url = query 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/history?search=${encodeURIComponent(query)}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/history`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecentPatterns(data.slice(0, 20));
      }
    } catch (e) {
      console.error('Failed to load patterns:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadTestData = (pattern: any) => {
    if (!pattern) return;
    
    const newInputs = { ...testInputs };
    
    // Intelligent mapping based on V2 schema and common variable names
    const mappings: Record<string, any> = {
      word: pattern.word || pattern.seed?.text,
      input: pattern.word || pattern.seed?.text,
      voicing: pattern.verbal_voicing?.content || pattern.voicing,
      word_voicing: pattern.verbal_voicing?.content || pattern.voicing,
      text: pattern.verbal_voicing?.content || pattern.voicing,
      essence: pattern.verbal_essence?.content || pattern.visual_essence?.content || pattern.essence,
      verbal_essence: pattern.verbal_essence?.content,
      visual_essence: pattern.visual_essence?.content,
      description: pattern.verbal_essence?.content || pattern.visual_essence?.content || pattern.essence,
      layers: pattern.verbal_layer?.content || pattern.visual_layer?.content || pattern.layers,
      verbal_layer: pattern.verbal_layer?.content,
      visual_layer: pattern.visual_layer?.content,
      brief: pattern.visual_layer?.content || pattern.image_brief,
      image_brief: pattern.visual_layer?.content || pattern.image_brief
    };

    // Apply mappings to all detected variables
    detectedVars.forEach(v => {
      if (mappings[v]) {
        newInputs[v] = mappings[v];
      }
    });
    
    setTestInputs(newInputs);
  };

  const loadPrompt = async () => {
    if (id === 'new') {
      setLoading(false);
      setPrompt({
        id: 'new',
        slug: 'new-prompt',
        version: 1,
        template: '',
        is_active: false,
        description: '',
        input_variables: ['word']
      });
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/prompts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPrompt(data);
        setTemplate(data.template || '');
        
        let desc = data.description || '';
        let cfg = {
          temperature: data.temperature ?? 0.7,
          max_tokens: data.max_tokens ?? 4096,
          top_p: data.top_p ?? 0.95,
          top_k: data.top_k ?? 40
        };

        if (desc.startsWith('JSON:')) {
          try {
            const parsed = JSON.parse(desc.substring(5));
            desc = parsed.description || '';
            if (data.temperature === null) cfg = { ...cfg, ...parsed.config };
          } catch (e) {}
        }

        setDescription(desc);
        setConfig(cfg);

        // Also load the currently active version for comparison
        const allRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/prompts`);
        const allPrompts = await allRes.json();
        const active = allPrompts.find((p: Prompt) => p.slug === data.slug && p.is_active);
        if (active && active.id !== data.id) {
          setActivePrompt(active);
        }
      }
    } catch (error) {
      console.error('Error loading prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!prompt) return;
    setSaving(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/prompts`);
      const allPrompts = await res.json();
      const sameSlug = allPrompts.filter((p: Prompt) => p.slug === prompt.slug);
      const newVersion = sameSlug.length > 0 ? Math.max(...sameSlug.map((p: Prompt) => p.version)) + 1 : 1;

      const saveRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: prompt.slug,
          version: newVersion,
          template: template,
          description: description,
          input_variables: detectedVars,
          is_active: false,
          temperature: config.temperature,
          top_p: config.top_p,
          top_k: config.top_k,
          max_tokens: config.max_tokens
        })
      });

      if (saveRes.ok) {
        const newPrompt = await saveRes.json();
        navigate(`/admin/prompts/${newPrompt.id}`);
      } else {
        alert('Error saving prompt: ' + await saveRes.text());
      }
    } catch (error: any) {
      alert('Error saving prompt: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRunTest = async (useActive = false) => {
    if (useActive) setActiveOutput(null); else setTestOutput(null);
    setTestError(null);
    setRunning(true);

    try {
      const targetTemplate = useActive ? activePrompt?.template : template;
      const targetConfig = useActive ? {
        temperature: activePrompt?.temperature,
        top_p: activePrompt?.top_p,
        max_tokens: activePrompt?.max_tokens
      } : config;

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: targetTemplate,
          inputs: testInputs,
          config: targetConfig,
          slug: prompt?.slug || ''
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Generation failed');
      
      if (useActive) setActiveOutput(result.output); else setTestOutput(result.output);
    } catch (err: any) {
      setTestError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const handleRunComparison = async () => {
    setRunning(true);
    await Promise.all([
      handleRunTest(false),
      activePrompt ? handleRunTest(true) : Promise.resolve()
    ]);
    setRunning(false);
  };

  if (loading) return <div className="text-slate-500 p-8 animate-pulse">Loading prompt DNA...</div>;
  if (!prompt) return <div className="text-red-500 p-8">Prompt not found</div>;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/prompts')} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
              {prompt.slug}
              <span className="text-sm bg-slate-800 text-slate-400 px-2 py-1 rounded font-mono">
                v{prompt.version}
              </span>
              {prompt.is_active && (
                <span className="text-xs bg-teal-900/30 text-teal-400 px-2 py-1 rounded border border-teal-900/50 font-sans flex items-center gap-1">
                  <Check size={12} /> Live
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowDiff(!showDiff)}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors border ${showDiff ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'bg-transparent border-slate-700 text-slate-400 hover:text-white'}`}
            title="Compare with Live Version"
          >
            <Diff size={18} />
            {showDiff ? 'Hide Comparison' : 'Compare Live'}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors border ${showSettings ? 'bg-slate-800 border-teal-500 text-teal-400' : 'bg-transparent border-slate-700 text-slate-400 hover:text-white'}`}
          >
            <Settings size={18} />
            Settings
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-md flex items-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-teal-900/20"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Version'}
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        
        {/* Left: Editor */}
        <div className="flex flex-col gap-4 h-full overflow-hidden">
          {showSettings && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 shrink-0 animate-in slide-in-from-top duration-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <Settings size={12} /> Model Configuration
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Temperature ({config.temperature})</label>
                  <input type="range" min="0" max="1" step="0.1" value={config.temperature} onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})} className="w-full accent-teal-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Max Tokens</label>
                  <input type="number" value={config.max_tokens} onChange={(e) => setConfig({...config, max_tokens: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 outline-none font-mono" />
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex-grow flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Template Editor</label>
              <div className="flex gap-2">
                {detectedVars.map(v => (
                  <span key={v} className="text-[10px] font-mono text-teal-500 bg-teal-950/30 px-1.5 py-0.5 rounded border border-teal-900/50">
                    {'{'}{v}{'}'}
                  </span>
                ))}
              </div>
            </div>
            <textarea 
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="flex-grow bg-slate-950 text-slate-200 font-mono text-sm p-4 rounded border border-slate-800 focus:border-teal-500 outline-none resize-none leading-relaxed"
              placeholder="Write your prompt template here... use {{variable}} for dynamic content."
            />
            <div className="mt-4">
              <label className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold block">Version Notes</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 text-slate-300 text-sm p-2 rounded border border-slate-800 focus:border-teal-500 outline-none"
                placeholder="What changed in this version?"
              />
            </div>
          </div>
        </div>

        {/* Right: Playground & Comparison */}
        <div className="flex flex-col gap-4 h-full overflow-hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex-grow flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <label className="text-xs uppercase tracking-widest text-teal-500 font-semibold">Playground</label>
                <div className="relative">
                  <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Search history..."
                    className="bg-slate-950 border border-slate-800 rounded-full pl-8 pr-4 py-1 text-xs text-slate-300 focus:border-teal-500 outline-none w-48"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      loadRecentPatterns(e.target.value);
                    }}
                  />
                </div>
              </div>
              <button 
                onClick={showDiff ? handleRunComparison : () => handleRunTest(false)}
                disabled={running}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Play size={14} /> {running ? 'Running...' : showDiff ? 'Run Comparison' : 'Run Test'}
              </button>
            </div>

            {/* Test Data Selection */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin scrollbar-thumb-slate-800">
              {recentPatterns.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleLoadTestData(p)}
                  className="shrink-0 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[10px] text-slate-400 hover:border-teal-500 hover:text-teal-400 transition-all"
                >
                  {p.word}
                </button>
              ))}
              {isSearching && <div className="text-[10px] text-slate-600 animate-pulse py-1">Searching...</div>}
            </div>

            {/* Variable Inputs */}
            <div className="grid grid-cols-1 gap-3 mb-4 max-h-48 overflow-y-auto pr-2">
              {detectedVars.map((variable) => (
                <div key={variable}>
                  <label className="text-[10px] text-slate-500 block font-mono mb-1 uppercase tracking-tighter">{variable}</label>
                  <textarea 
                    value={testInputs[variable] || ''}
                    onChange={(e) => setTestInputs({...testInputs, [variable]: e.target.value})}
                    className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800 focus:border-teal-500 outline-none min-h-[60px] resize-y font-mono"
                    placeholder={`Value for ${variable}`}
                  />
                </div>
              ))}
            </div>

            {/* Output Area */}
            <div className="flex-grow flex flex-col min-h-0">
              {testError && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <pre className="whitespace-pre-wrap font-sans">{testError}</pre>
                </div>
              )}

              <div className={`grid h-full gap-4 ${showDiff ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {/* Draft Output */}
                <div className="flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-teal-500 font-bold uppercase">Draft Output (v{prompt.version})</span>
                    {testOutput && (
                      <button onClick={() => navigator.clipboard.writeText(testOutput)} className="text-slate-500 hover:text-white"><Copy size={12} /></button>
                    )}
                  </div>
                  <div className="flex-grow bg-black/50 rounded border border-slate-800 p-4 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
                    {testOutput || <div className="text-slate-700 italic">Run test to see draft output...</div>}
                  </div>
                </div>

                {/* Active Output (Comparison) */}
                {showDiff && (
                  <div className="flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-blue-500 font-bold uppercase">Live Output (v{activePrompt?.version || '?'})</span>
                      {activeOutput && (
                        <button onClick={() => navigator.clipboard.writeText(activeOutput)} className="text-slate-500 hover:text-white"><Copy size={12} /></button>
                      )}
                    </div>
                    <div className="flex-grow bg-blue-950/10 rounded border border-blue-900/20 p-4 overflow-y-auto font-mono text-xs text-slate-400 leading-relaxed">
                      {!activePrompt ? (
                        <div className="text-slate-700 italic">No other active version to compare.</div>
                      ) : activeOutput ? (
                        activeOutput
                      ) : (
                        <div className="text-slate-700 italic">Run comparison to see live output...</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
