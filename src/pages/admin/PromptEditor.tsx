import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Settings, Play, Loader2 } from 'lucide-react';

interface Prompt {
  id: string;
  slug: string;
  version: number;
  template: string;
  is_active: boolean;
  description: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  input_variables?: string[];
}

interface Pattern {
  id: string;
  word: string;
  layers?: string;
  voicing?: string;
  essence?: string;
  image_brief?: string;
  image_url?: string;
}

export function PromptEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Editor State
  const [template, setTemplate] = useState('');
  const [description, setDescription] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Model Config State
  const [config, setConfig] = useState({
    temperature: 0.7,
    max_tokens: 4096,
    top_p: 0.95,
    top_k: 40
  });

  // Playground State
  const [showPlayground, setShowPlayground] = useState(false);
  const [recentPatterns, setRecentPatterns] = useState<Pattern[]>([]);
  const [testInputs, setTestInputs] = useState<Record<string, string>>({});
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadPrompt();
    loadRecentPatterns();
  }, [id]);

  const loadPrompt = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/prompts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPrompt(data);
        setTemplate(data.template || '');
        setDescription(data.description || '');
        setConfig({
          temperature: data.temperature ?? 0.7,
          max_tokens: data.max_tokens ?? 4096,
          top_p: data.top_p ?? 0.95,
          top_k: data.top_k ?? 40
        });

        // Initialize test inputs based on input_variables
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

  const loadRecentPatterns = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/history`);
      if (res.ok) {
        const data = await res.json();
        setRecentPatterns(data.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading patterns:', error);
    }
  };

  const handleLoadPattern = (pattern: Pattern) => {
    const newInputs = { ...testInputs };
    const vars = prompt?.input_variables || [];

    if (pattern.word && vars.includes('word')) newInputs['word'] = pattern.word;
    if (pattern.layers && vars.includes('layers')) newInputs['layers'] = pattern.layers;
    if (pattern.voicing) {
      if (vars.includes('voicing')) newInputs['voicing'] = pattern.voicing;
      if (vars.includes('word_voicing')) newInputs['word_voicing'] = pattern.voicing;
    }
    if (pattern.essence && vars.includes('essence')) newInputs['essence'] = pattern.essence;
    if (pattern.image_brief && vars.includes('brief')) newInputs['brief'] = pattern.image_brief;

    setTestInputs(newInputs);
  };

  const handleTestPrompt = async () => {
    if (!prompt) return;

    setTesting(true);
    setTestOutput(null);

    try {
      // Replace variables in template
      let finalPrompt = template;
      Object.entries(testInputs).forEach(([key, value]) => {
        finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/playground/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'text',
          system_prompt: '', // System prompt is loaded from the system slug
          user_prompt: finalPrompt
        })
      });

      const data = await res.json();
      if (data.content) {
        setTestOutput(data.content);
      }
    } catch (error) {
      console.error('Error testing prompt:', error);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!prompt) return;
    
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          description,
          ...config
        })
      });

      if (res.ok) {
        alert('Prompt saved successfully!');
        navigate('/admin/prompts');
      } else {
        alert('Failed to save prompt');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving prompt');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12 text-slate-500 animate-pulse">Loading prompt...</div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12 text-slate-400">Prompt not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/prompts')}
            className="p-2 hover:bg-slate-800 rounded transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white capitalize">{prompt.slug}</h1>
            <p className="text-sm text-slate-400 mt-1">Version {prompt.version}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`px-3 py-2 rounded flex items-center gap-2 transition-colors ${
              showSettings 
                ? 'bg-teal-900/30 text-teal-400' 
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <Settings size={16} />
            Settings
          </button>
          <button
            onClick={() => setShowPlayground(!showPlayground)}
            className={`px-3 py-2 rounded flex items-center gap-2 transition-colors ${
              showPlayground 
                ? 'bg-teal-900/30 text-teal-400' 
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <Play size={16} />
            Playground
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Model Configuration</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Temperature</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Max Tokens</label>
              <input
                type="number"
                step="100"
                min="100"
                value={config.max_tokens}
                onChange={(e) => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Top P</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={config.top_p}
                onChange={(e) => setConfig({ ...config, top_p: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Top K</label>
              <input
                type="number"
                step="1"
                min="1"
                value={config.top_k}
                onChange={(e) => setConfig({ ...config, top_k: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Playground Panel */}
      {showPlayground && (
        <div className="mb-6 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Playground</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Load Recent Pattern</label>
                <select
                  onChange={(e) => {
                    const pattern = recentPatterns.find(p => p.word === e.target.value);
                    if (pattern) handleLoadPattern(pattern);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="">Select a pattern...</option>
                  {recentPatterns.map(p => (
                    <option key={p.id} value={p.word}>{p.word}</option>
                  ))}
                </select>
              </div>

              {prompt.input_variables?.map(varName => (
                <div key={varName}>
                  <label className="block text-sm text-slate-400 mb-2 capitalize">{varName}</label>
                  <textarea
                    value={testInputs[varName] || ''}
                    onChange={(e) => setTestInputs({ ...testInputs, [varName]: e.target.value })}
                    placeholder={`Enter ${varName}...`}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-teal-500 resize-y"
                  />
                </div>
              ))}

              <button
                onClick={handleTestPrompt}
                disabled={testing}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white px-4 py-3 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Test Prompt
                  </>
                )}
              </button>
            </div>

            {/* Right: Output */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Output</label>
              <div className="bg-slate-950 border border-slate-800 rounded p-4 text-sm text-slate-300 font-mono whitespace-pre-wrap min-h-[400px] max-h-[600px] overflow-y-auto">
                {testOutput || 'Output will appear here...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this prompt..."
          className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2 text-white focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* Input Variables */}
      {prompt.input_variables && prompt.input_variables.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">Input Variables</label>
          <div className="flex flex-wrap gap-2">
            {prompt.input_variables.map(v => (
              <span key={v} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm font-mono">
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Template */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">Prompt Template</label>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder="Prompt template with {{variables}}..."
          rows={16}
          className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-teal-500 resize-y"
        />
        <p className="text-xs text-slate-500 mt-2">
          Use {`{{variable_name}}`} for template variables
        </p>
      </div>
    </div>
  );
}
