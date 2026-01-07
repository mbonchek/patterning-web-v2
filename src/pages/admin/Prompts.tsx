import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, CheckCircle, Clock, Calendar, Power, ChevronDown, History } from 'lucide-react';

interface Prompt {
  id: string;
  slug: string;
  version: number;
  version_label?: string;
  template: string;
  is_active: boolean;
  description: string;
  created_at: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  input_variables?: string[];
}

export function Prompts() {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/prompts`);
      if (res.ok) {
        const data = await res.json();
        setPrompts(data);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group prompts by slug
  const groupedPrompts = prompts.reduce((acc, prompt) => {
    if (!acc[prompt.slug]) acc[prompt.slug] = [];
    acc[prompt.slug].push(prompt);
    return acc;
  }, {} as Record<string, Prompt[]>);

  const handleActivate = async (id: string, slug: string) => {
    if (!confirm('Are you sure you want to activate this version? It will replace the currently active prompt.')) return;
    
    setActivatingId(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/prompts/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, slug })
      });

      if (res.ok) {
        await fetchPrompts();
      } else {
        alert('Failed to activate prompt');
      }
    } catch (error) {
      console.error('Activation error:', error);
      alert('Error activating prompt');
    } finally {
      setActivatingId(null);
    }
  };

  const toggleExpand = (slug: string) => {
    setExpandedSlugs(prev => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getVariantTag = (prompt: Prompt) => {
    let tag = `v${prompt.version}`;
    if (prompt.temperature !== undefined) tag += `.t${Math.round(prompt.temperature * 100)}`;
    if (prompt.top_p !== undefined) tag += `.p${Math.round(prompt.top_p * 100)}`;
    if (prompt.top_k !== undefined) tag += `.k${prompt.top_k}`;
    if (prompt.max_tokens !== undefined) tag += `.n${prompt.max_tokens}`;
    return tag;
  };

  const promptOrder = ['system', 'layers', 'voicing', 'essence', 'image_brief', 'image'];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Active Prompts</h1>
          <p className="text-slate-400">Manage the DNA of your pattern generation engine.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/prompts/new')}
          className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow-lg shadow-teal-900/20"
        >
          <Plus size={18} /> New Prompt
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 animate-pulse">Loading prompt DNA...</div>
      ) : Object.keys(groupedPrompts).length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
          <p className="text-slate-400 mb-4">No prompts found.</p>
          <p className="text-sm text-slate-500">Create your first prompt to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {Object.entries(groupedPrompts)
            .sort(([slugA], [slugB]) => {
              const indexA = promptOrder.indexOf(slugA.toLowerCase());
              const indexB = promptOrder.indexOf(slugB.toLowerCase());
              if (indexA !== -1 && indexB !== -1) return indexA - indexB;
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              return slugA.localeCompare(slugB);
            })
            .map(([slug, versions]) => {
              const activeVersion = versions.find(p => p.is_active) || versions[0];
              const history = versions.filter(p => p.id !== activeVersion.id)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              const isExpanded = expandedSlugs.has(slug);

              return (
                <div key={slug} className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-bold text-white capitalize">{slug}</h2>
                          <span className="flex items-center gap-1 text-xs font-bold text-teal-400 bg-teal-900/30 px-2 py-1 rounded-full">
                            <CheckCircle size={12} />
                            Active
                          </span>
                          <span className="text-xs text-slate-500 font-mono">{getVariantTag(activeVersion)}</span>
                        </div>
                        <p className="text-sm text-slate-400">{activeVersion.description || 'No description'}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(activeVersion.created_at)}
                          </span>
                          {activeVersion.temperature !== undefined && (
                            <span>temp: {activeVersion.temperature}</span>
                          )}
                          {activeVersion.max_tokens !== undefined && (
                            <span>max: {activeVersion.max_tokens}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/prompts/${activeVersion.id}`)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm flex items-center gap-2 transition-colors"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        {history.length > 0 && (
                          <button
                            onClick={() => toggleExpand(slug)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm flex items-center gap-2 transition-colors"
                          >
                            <History size={14} />
                            {history.length}
                            <ChevronDown 
                              size={14} 
                              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Version History */}
                  {isExpanded && history.length > 0 && (
                    <div className="p-6 bg-slate-950/50">
                      <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Version History</h3>
                      <div className="space-y-2">
                        {history.map((version) => (
                          <div 
                            key={version.id}
                            className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
                          >
                            <div className="flex-grow">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-mono text-slate-300">{getVariantTag(version)}</span>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Clock size={10} />
                                  {formatDate(version.created_at)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">{version.description || 'No description'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigate(`/admin/prompts/${version.id}`)}
                                className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleActivate(version.id, slug)}
                                disabled={activatingId === version.id}
                                className="px-2 py-1 text-xs bg-teal-900/30 hover:bg-teal-900/50 text-teal-400 rounded flex items-center gap-1 disabled:opacity-50"
                              >
                                <Power size={10} />
                                {activatingId === version.id ? 'Activating...' : 'Activate'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
