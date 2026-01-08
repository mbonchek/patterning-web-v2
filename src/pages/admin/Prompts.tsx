import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Play, CheckCircle, Clock, Power, ChevronDown, History } from 'lucide-react';

interface Prompt {
  id: string;
  slug: string;
  version: number;
  version_label?: string;
  template: string;
  is_active: boolean;
  description: string | null;
  created_at: string;
  input_variables?: string[];
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
}

export function Prompts() {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/prompts`);
      if (res.ok) {
        const data = await res.json();
        setPrompts(data);
      } else {
        console.error('Failed to fetch prompts:', await res.text());
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/prompts/activate`, {
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Invalid Date';
    }
  };

  const parseConfig = (prompt: Prompt) => {
    // Prefer columns if available
    if (prompt.temperature !== null && prompt.temperature !== undefined) {
      return {
        temperature: prompt.temperature,
        top_p: prompt.top_p,
        top_k: prompt.top_k,
        max_tokens: prompt.max_tokens
      };
    }
    // Fallback to JSON description
    try {
      if (prompt.description?.startsWith('JSON:')) {
        const data = JSON.parse(prompt.description.substring(5));
        return data.config || {};
      }
    } catch (e) { 
      return {}; 
    }
    return {};
  };

  const getVariantTag = (version: number, config: any) => {
    let tag = `v${version}`;
    if (config.temperature !== undefined) tag += `.t${Math.round(config.temperature * 100)}`;
    if (config.top_p !== undefined) tag += `.p${Math.round(config.top_p * 100)}`;
    if (config.top_k !== undefined) tag += `.k${config.top_k}`;
    if (config.max_tokens !== undefined) tag += `.n${config.max_tokens}`;
    return tag;
  };

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
        <div className="space-y-12">
          {/* System Section */}
          {groupedPrompts['system'] && (
            <div>
              <h2 className="text-lg font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-slate-500 rounded-full"></div>
                System
              </h2>
              <div className="grid grid-cols-1 gap-8">
                {renderPromptCard('system', groupedPrompts['system'])}
              </div>
            </div>
          )}

          {/* Verbal Section */}
          <div>
            <h2 className="text-lg font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              Verbal
            </h2>
            <div className="grid grid-cols-1 gap-8">
              {['word_verbal_layer', 'word_verbal_voicing', 'word_verbal_essence'].map(slug => 
                groupedPrompts[slug] && renderPromptCard(slug, groupedPrompts[slug])
              )}
            </div>
          </div>

          {/* Visual Section */}
          <div>
            <h2 className="text-lg font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
              Visual
            </h2>
            <div className="grid grid-cols-1 gap-8">
              {['word_visual_layer', 'word_visual_essence', 'word_visual_image'].map(slug => 
                groupedPrompts[slug] && renderPromptCard(slug, groupedPrompts[slug])
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderPromptCard(slug: string, versions: Prompt[]) {
              // Find active version, or fallback to latest
    const activeVersion = versions.find(p => p.is_active) || versions[0];
    const history = versions.filter(p => p.id !== activeVersion.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // Display name mapping
    let displayName = slug.replace('word_verbal_', '').replace('word_visual_', '').replace('_', ' ');
    // Pluralize "layer" to "layers"
    if (displayName === 'layer') displayName = 'layers';

    return (
                <div key={slug} className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-slate-950/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${
                        slug === 'voicing' ? 'bg-purple-500' : 
                        slug === 'layers' ? 'bg-blue-500' : 
                        slug === 'essence' ? 'bg-amber-500' : 
                        slug === 'image_brief' ? 'bg-pink-500' :
                        slug === 'image' ? 'bg-teal-500' : 'bg-slate-500'
                      }`}></div>
                      <div>
                        <h2 className="text-xl font-bold text-white font-serif capitalize tracking-wide leading-none mb-1">
                          {displayName}
                        </h2>
                        {activeVersion.input_variables && activeVersion.input_variables.length > 0 && (
                          <div className="flex gap-1.5">
                            {activeVersion.input_variables.map(v => (
                              <span key={v} className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                {'{'}{v}{'}'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* History Dropdown */}
                    <div className="relative group">
                      <button className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 hover:text-slate-300 hover:border-slate-700 transition-colors">
                        <History size={12} />
                        {versions.length} Version{versions.length !== 1 ? 's' : ''}
                        <ChevronDown size={12} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
                        <div className="max-h-64 overflow-y-auto py-1">
                          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-950/50 border-b border-slate-800">
                            Version History
                          </div>
                          {/* Active Item */}
                          <button 
                            onClick={() => navigate(`/admin/prompts/${activeVersion.id}`)}
                            className="w-full text-left block px-4 py-2 hover:bg-slate-800 border-l-2 border-teal-500 bg-teal-900/10"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-teal-400 font-bold">v{activeVersion.version} (Active)</span>
                              <span className="text-[10px] text-slate-500">{formatDate(activeVersion.created_at)}</span>
                            </div>
                          </button>
                          
                          {/* History Items */}
                          {history.map(h => (
                            <div key={h.id} className="group/item relative">
                              <button 
                                onClick={() => navigate(`/admin/prompts/${h.id}`)}
                                className="w-full text-left block px-4 py-2 hover:bg-slate-800 border-l-2 border-transparent hover:border-slate-600"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-400 font-mono">{getVariantTag(h.version, parseConfig(h))}</span>
                                  <span className="text-[10px] text-slate-600">{formatDate(h.created_at)}</span>
                                </div>
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleActivate(h.id, h.slug);
                                }}
                                disabled={activatingId === h.id}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-slate-800 text-slate-400 hover:text-teal-400 rounded opacity-0 group-hover/item:opacity-100 transition-opacity disabled:opacity-50"
                                title="Restore this version"
                              >
                                <Power size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Active Prompt Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5 bg-teal-950/50 px-2 py-1 rounded border border-teal-900/50 font-mono">
                          <CheckCircle size={12} /> 
                          {getVariantTag(activeVersion.version, parseConfig(activeVersion))}
                        </span>
                        
                        {/* Config Badges */}
                        {(() => {
                          const config = parseConfig(activeVersion);
                          if (Object.keys(config).length === 0) return null;
                          return (
                            <div className="flex gap-1.5">
                              {config.temperature !== undefined && <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800" title="Temperature">T:{config.temperature}</span>}
                              {config.top_p !== undefined && <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800" title="Top P">P:{config.top_p}</span>}
                              {config.top_k !== undefined && <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800" title="Top K">K:{config.top_k}</span>}
                              {config.max_tokens !== undefined && <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800" title="Max Tokens">N:{config.max_tokens}</span>}
                            </div>
                          );
                        })()}

                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock size={10} />
                          Updated {formatDate(activeVersion.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/prompts/${activeVersion.id}`)}
                          className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                          title="Edit Prompt"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/prompts/${activeVersion.id}`)}
                          className="p-2 hover:bg-teal-500/20 rounded-md text-teal-500 hover:text-teal-300 transition-colors"
                          title="Test in Playground"
                        >
                          <Play size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="relative group/code">
                      <pre className="text-slate-300 text-sm font-mono bg-black/40 p-4 rounded-lg border border-white/5 overflow-x-auto whitespace-pre-wrap max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {activeVersion.template}
                      </pre>
                      {activeVersion.description && (
                        <div className="mt-3 text-xs text-slate-500 italic border-l-2 border-slate-800 pl-3">
                          {activeVersion.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
    );
  }
}
