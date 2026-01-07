import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Settings } from 'lucide-react';

interface Prompt {
  id: string;
  slug: string;
  version: number;
  system_template: string;
  user_template: string;
  is_active: boolean;
  description: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
}

export function PromptEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Editor State
  const [systemTemplate, setSystemTemplate] = useState('');
  const [userTemplate, setUserTemplate] = useState('');
  const [description, setDescription] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Model Config State
  const [config, setConfig] = useState({
    temperature: 0.7,
    max_tokens: 4096,
    top_p: 0.95,
    top_k: 40
  });

  useEffect(() => {
    loadPrompt();
  }, [id]);

  const loadPrompt = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/prompts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPrompt(data);
        setSystemTemplate(data.system_template || '');
        setUserTemplate(data.user_template || '');
        setDescription(data.description || '');
        setConfig({
          temperature: data.temperature ?? 0.7,
          max_tokens: data.max_tokens ?? 4096,
          top_p: data.top_p ?? 0.95,
          top_k: data.top_k ?? 40
        });
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_template: systemTemplate,
          user_template: userTemplate,
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

      {/* System Template */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">System Template</label>
        <textarea
          value={systemTemplate}
          onChange={(e) => setSystemTemplate(e.target.value)}
          placeholder="System instructions..."
          rows={8}
          className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-teal-500 resize-y"
        />
      </div>

      {/* User Template */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">User Template</label>
        <textarea
          value={userTemplate}
          onChange={(e) => setUserTemplate(e.target.value)}
          placeholder="User message template with {{variables}}..."
          rows={12}
          className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-teal-500 resize-y"
        />
        <p className="text-xs text-slate-500 mt-2">
          Use {`{{variable_name}}`} for template variables
        </p>
      </div>
    </div>
  );
}
