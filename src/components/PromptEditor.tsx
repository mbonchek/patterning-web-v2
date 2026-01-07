import { useEffect, useState } from 'react';
import { listPrompts, getPrompt, updatePrompt, testPrompt } from '../lib/api';
import { Save, Play, Loader2 } from 'lucide-react';

export function PromptEditor() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');

  useEffect(() => {
    listPrompts().then(setSlugs).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      setLoading(true);
      getPrompt(selectedSlug)
        .then(setPrompt)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedSlug]);

  const handleSave = async () => {
    if (!prompt) return;
    setSaving(true);
    try {
      await updatePrompt(selectedSlug, prompt);
      alert('Saved successfully!');
    } catch (e) {
      alert('Failed to save: ' + e);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!prompt) return;
    setTesting(true);
    try {
      const res = await testPrompt('text', {
        system_prompt: prompt.system_template || '',
        user_prompt: prompt.template.replace('{{word}}', testInput).replace('{{input}}', testInput), // Simple replacement for now
      });
      setTestOutput(res.content || JSON.stringify(res, null, 2));
    } catch (e) {
      setTestOutput('Error: ' + e);
    } finally {
      setTesting(false);
    }
  };

  if (!slugs.length) return <div className="p-8">Loading prompts...</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center gap-4">
        <select 
          className="bg-muted border border-border rounded px-3 py-1"
          value={selectedSlug}
          onChange={(e) => setSelectedSlug(e.target.value)}
        >
          <option value="">Select a prompt...</option>
          {slugs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        
        {prompt && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">v{prompt.version}</span>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : prompt ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Editor Column */}
          <div className="flex-1 p-4 overflow-y-auto border-r border-border space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">System Template</label>
              <textarea
                className="w-full h-32 bg-muted/20 border border-border rounded p-2 font-mono text-sm"
                value={prompt.system_template || ''}
                onChange={(e) => setPrompt({ ...prompt, system_template: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">User Template</label>
              <textarea
                className="w-full h-64 bg-muted/20 border border-border rounded p-2 font-mono text-sm"
                value={prompt.template || ''}
                onChange={(e) => setPrompt({ ...prompt, template: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Temperature</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-muted/20 border border-border rounded p-2"
                  value={prompt.temperature ?? 0.7}
                  onChange={(e) => setPrompt({ ...prompt, temperature: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Tokens</label>
                <input
                  type="number"
                  className="w-full bg-muted/20 border border-border rounded p-2"
                  value={prompt.max_tokens ?? 1024}
                  onChange={(e) => setPrompt({ ...prompt, max_tokens: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Playground Column */}
          <div className="w-1/3 p-4 bg-muted/5 flex flex-col border-l border-border">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Play className="w-4 h-4" /> Playground
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Test Input (Word)</label>
              <input
                type="text"
                className="w-full bg-background border border-border rounded p-2"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="e.g. jellybean"
              />
            </div>
            <button
              onClick={handleTest}
              disabled={testing || !testInput}
              className="w-full bg-secondary text-secondary-foreground py-2 rounded mb-4 hover:opacity-90 disabled:opacity-50"
            >
              {testing ? 'Running...' : 'Run Test'}
            </button>
            <div className="flex-1 bg-black rounded p-2 overflow-y-auto font-mono text-xs whitespace-pre-wrap text-green-400">
              {testOutput || '// Output will appear here'}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Select a prompt to edit
        </div>
      )}
    </div>
  );
}
