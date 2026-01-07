import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Play, Check, AlertCircle, Copy, Settings } from 'lucide-react';

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
}

export function PromptEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
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
  
  // Playground State
  const [testInputs, setTestInputs] = useState<Record<string, string>>({});
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [recentPatterns, setRecentPatterns] = useState<Pattern[]>([]);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    loadPrompt();
    loadRecentPatterns();
  }, [id]);

  const loadRecentPatterns = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/history`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecentPatterns(data.slice(0, 10));
      }
    } catch (e) {
      console.error('Failed to load recent patterns:', e);
    }
  };

  const handleLoadTestData = (pattern: Pattern) => {
    if (!pattern) return;
    
    const newInputs = { ...testInputs };
    const vars = prompt?.input_variables || [];
    
    if (pattern.word) {
      if (vars.includes('word')) newInputs['word'] = pattern.word;
      if (vars.includes('input')) newInputs['input'] = pattern.word;
    }

    if (pattern.voicing) {
      if (vars.includes('word_voicing')) newInputs['word_voicing'] = pattern.voicing;
      if (vars.includes('voicing')) newInputs['voicing'] = pattern.voicing;
      if (vars.includes('text')) newInputs['text'] = pattern.voicing;
    }

    if (pattern.essence) {
      if (vars.includes('essence')) newInputs['essence'] = pattern.essence;
      if (vars.includes('description')) newInputs['description'] = pattern.essence;
    }

    if (pattern.layers) {
      if (vars.includes('layers')) newInputs['layers'] = pattern.layers;
    }

    if (pattern.image_brief) {
      if (vars.includes('brief')) newInputs['brief'] = pattern.image_brief;
      if (vars.includes('image_brief')) newInputs['image_brief'] = pattern.image_brief;
    }
    
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
          } catch (e) {
            // Ignore parse errors
          }
        }

        setDescription(desc);
        setConfig(cfg);

        const inputs: Record<string, string> = {};
        (data.input_variables || []).forEach((v: string) => inputs[v] = '');
        setTestInputs(inputs);
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
      // Get the latest version number to avoid conflicts
      let newVersion = 1;
      if (prompt.id !== 'new') {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/prompts`);
        const allPrompts = await res.json();
        const sameSlug = allPrompts.filter((p: Prompt) => p.slug === prompt.slug);
        if (sameSlug.length > 0) {
          const maxVersion = Math.max(...sameSlug.map((p: Prompt) => p.version));
          newVersion = maxVersion + 1;
        }
      }

      const saveRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: prompt.slug,
          version: newVersion,
          template: template,
          description: description,
          input_variables: prompt.input_variables,
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
        const error = await saveRes.text();
        alert('Error saving prompt: ' + error);
      }
    } catch (error: any) {
      alert('Error saving prompt: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRunTest = async () => {
    setRunning(true);
    setTestOutput(null);
    setTestError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: template,
          inputs: testInputs,
          config: config
        })
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || 'Generation failed');
      
      setTestOutput(result.output);
    } catch (err: any) {
      setTestError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const getVariantTag = (version: number, cfg: any) => {
    let tag = `v${version}`;
    if (cfg.temperature !== undefined) tag += `.t${Math.round(cfg.temperature * 100)}`;
    if (cfg.top_p !== undefined) tag += `.p${Math.round(cfg.top_p * 100)}`;
    if (cfg.top_k !== undefined) tag += `.k${cfg.top_k}`;
    if (cfg.max_tokens !== undefined) tag += `.n${cfg.max_tokens}`;
    return tag;
  };

  const handleActivate = async () => {
    if (!prompt || prompt.id === 'new') return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/prompts/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prompt.id, slug: prompt.slug })
      });

      if (res.ok) {
        setPrompt({ ...prompt, is_active: true });
        alert(`Version ${prompt.version} is now LIVE.`);
      } else {
        alert('Failed to activate prompt');
      }
    } catch (error) {
      console.error('Error activating prompt:', error);
      alert('Error activating prompt');
    }
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;
  if (!prompt) return <div className="text-red-500">Prompt not found</div>;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/prompts')} className="text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
              {prompt.slug}
              <span className="text-sm bg-slate-800 text-slate-400 px-2 py-1 rounded font-mono">
                {getVariantTag(prompt.version, config)}
              </span>
              {prompt.is_active && (
                <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-900 font-sans flex items-center gap-1">
                  <Check size={12} /> Live
                </span>
              )}
            </h1>
            {prompt.input_variables && prompt.input_variables.length > 0 && (
              <div className="flex gap-2 mt-1">
                {prompt.input_variables.map(v => (
                  <span key={v} className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {'{'}{v}{'}'}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {!prompt.is_active && prompt.id !== 'new' && (
            <button 
              onClick={handleActivate}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-sm transition-colors"
            >
              Promote to Live
            </button>
          )}
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
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save New Version'}
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        
        {/* Left: Editor */}
        <div className="flex flex-col gap-4 h-full">
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 shrink-0">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <Settings size={12} /> Model Configuration
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-slate-500">Temperature</label>
                    <span className={`text-xs font-mono ${config.temperature !== 1 ? 'text-teal-400' : 'text-slate-600'}`}>
                      {config.temperature}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setConfig({
                        ...config, 
                        temperature: val,
                        top_p: val < 1 ? 1 : config.top_p 
                      });
                    }}
                    className={`w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer ${config.temperature !== 1 ? 'accent-teal-500' : 'accent-slate-600'}`}
                  />
                  <div className="text-[10px] text-slate-600 mt-1">
                    {config.temperature === 1 ? 'Disabled (using Top P)' : 'Active (Top P disabled)'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Max Tokens</label>
                  <input 
                    type="number" 
                    value={config.max_tokens}
                    onChange={(e) => setConfig({...config, max_tokens: parseInt(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:border-teal-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Top P</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="1"
                    value={config.top_p}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setConfig({
                        ...config, 
                        top_p: val,
                        temperature: val < 1 ? 1 : config.temperature
                      });
                    }}
                    className={`w-full bg-slate-950 border rounded px-2 py-1 text-xs outline-none font-mono ${config.top_p !== 1 ? 'border-teal-500 text-teal-400' : 'border-slate-800 text-slate-500'}`}
                  />
                  <div className="text-[10px] text-slate-600 mt-1">
                    {config.top_p === 1 ? 'Disabled (using Temp)' : 'Active (Temp disabled)'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Top K</label>
                  <input 
                    type="number" 
                    value={config.top_k}
                    onChange={(e) => setConfig({...config, top_k: parseInt(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:border-teal-500 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex-grow flex flex-col overflow-y-auto">
            <label className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">User Prompt Template</label>
            <textarea 
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="flex-grow min-h-[300px] bg-slate-950 text-slate-200 font-mono text-sm p-4 rounded border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none leading-relaxed"
              placeholder="Write a poem about {{word}}..."
            />
            <div className="mt-4">
              <label className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold block">Description / Notes</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 text-slate-300 text-sm p-2 rounded border border-slate-800 focus:border-teal-500 outline-none"
                placeholder="e.g. Added more emphasis on metaphors..."
              />
            </div>
          </div>
        </div>

        {/* Right: Playground */}
        <div className="flex flex-col gap-4 h-full">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs uppercase tracking-widest text-teal-500 font-semibold">Playground</label>
              <button 
                onClick={handleRunTest}
                disabled={running}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-xs rounded flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Play size={14} /> {running ? 'Running...' : 'Run Test'}
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              {/* Test Data Loader */}
              <div className="mb-2">
                <label className="text-xs text-slate-500 mb-1 block font-mono">Load Test Data</label>
                <select 
                  className="w-full bg-slate-950 text-slate-300 text-sm p-2 rounded border border-slate-800 focus:border-teal-500 outline-none"
                  onChange={(e) => {
                    const pattern = recentPatterns.find(p => p.id === e.target.value);
                    if (pattern) handleLoadTestData(pattern);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Select a recent word...</option>
                  {recentPatterns.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.word} ({new Date(p.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              {(prompt.input_variables || ['word']).map((variable) => (
                <div key={variable}>
                  <label className="text-xs text-slate-500 block font-mono mb-1">{variable}</label>
                  <textarea 
                    value={testInputs[variable] || ''}
                    onChange={(e) => setTestInputs({...testInputs, [variable]: e.target.value})}
                    className="w-full bg-slate-950 text-white text-sm p-2 rounded border border-slate-800 focus:border-teal-500 outline-none min-h-[100px] resize-y"
                    placeholder={`Value for ${variable}`}
                  />
                </div>
              ))}
            </div>

            {/* Output */}
            <div className="flex-grow bg-black rounded border border-slate-800 p-4 overflow-y-auto font-mono text-sm relative group">
              {testError ? (
                <div className="text-red-400 flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5" />
                  <pre className="whitespace-pre-wrap font-sans">{testError}</pre>
                </div>
              ) : testOutput ? (
                <pre className="whitespace-pre-wrap text-slate-300">{testOutput}</pre>
              ) : (
                <div className="text-slate-600 italic text-center mt-10">
                  Run a test to see output here...
                </div>
              )}
              
              {testOutput && (
                <button 
                  onClick={() => navigator.clipboard.writeText(testOutput)}
                  className="absolute top-2 right-2 p-2 bg-slate-800 text-slate-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy Output"
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
