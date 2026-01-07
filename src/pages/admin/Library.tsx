import { useEffect, useState } from 'react';
import { 
  Search, 
 
  Image as ImageIcon, 
  LayoutGrid, 
  List as ListIcon, 
  MoreHorizontal,
  Trash2,
  X,
  Loader2,
  Layers,
  Mic,
  Sparkles
} from 'lucide-react';

interface Pattern {
  id: string;
  word: string;
  layers: string | null;
  voicing: string | null;
  essence: string | null;
  image_url: string | null;
  image_brief?: string | null;
  created_at: string;
  layers_version?: string;
  voicing_version?: string;
  essence_version?: string;
  image_version?: string;
}

export function Library() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modal State
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  // Inspector State
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorData, setInspectorData] = useState<any>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/history?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (res.ok) {
        const data = await res.json();
        setPatterns(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManage = (pattern: Pattern) => {
    setSelectedPattern(pattern);
    setIsModalOpen(true);
  };

  const handleInspect = (content: string | null, type: string, word: string) => {
    if (!content) return;
    setInspectorOpen(true);
    setInspectorData({ type, content, word });
  };

  const handleAction = async (action: 'delete_all' | 'clear_layers' | 'clear_voicing' | 'clear_essence' | 'clear_brief' | 'clear_image') => {
    if (!selectedPattern) return;
    if (!confirm('Are you sure? This cannot be undone.')) return;

    setProcessingAction(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/manage-pattern`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: selectedPattern.id, 
          action 
        })
      });

      if (res.ok) {
        await fetchHistory();
        setIsModalOpen(false);
      } else {
        alert('Action failed');
      }
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  const filteredPatterns = patterns.filter(p => 
    p.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pattern Library</h1>
          <p className="text-slate-400">Visual archive of all generated patterns.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ListIcon size={18} />
            </button>
          </div>
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search patterns..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-slate-900 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-slate-300 focus:outline-none focus:border-teal-500 transition-colors" 
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="bg-slate-900/50 rounded-xl h-96 border border-slate-800"></div>)}
        </div>
      ) : filteredPatterns.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
          <p className="text-slate-500">No patterns found{searchQuery && ` matching "${searchQuery}"`}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPatterns.map((pattern) => (
            <div key={pattern.id} className="group bg-slate-900/50 border border-slate-800 hover:border-teal-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/10 flex flex-col relative">
              
              {/* Manage Button */}
              <button 
                onClick={() => handleManage(pattern)}
                className="absolute top-3 right-3 z-20 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Manage Pattern"
              >
                <MoreHorizontal size={16} />
              </button>

              {/* Image */}
              <div className="relative h-40 overflow-hidden bg-slate-950">
                {pattern.image_url ? (
                  <img 
                    src={pattern.image_url} 
                    alt={pattern.word} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    loading="lazy" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 gap-2">
                    <ImageIcon size={32} opacity={0.2} />
                    <span className="text-xs font-mono opacity-50">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 z-10">
                  {pattern.image_url ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-teal-100 bg-teal-900/80 px-2 py-1 rounded-full backdrop-blur-md border border-teal-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> DONE
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-100 bg-amber-900/80 px-2 py-1 rounded-full backdrop-blur-md border border-amber-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> PAUSED
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-white capitalize font-serif tracking-wide mb-3">{pattern.word}</h3>
                
                {/* Component Status */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleInspect(pattern.layers, 'Layers', pattern.word)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded ${
                      pattern.layers 
                        ? 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20' 
                        : 'bg-slate-800/50 text-slate-600'
                    }`}
                    disabled={!pattern.layers}
                  >
                    <Layers size={12} />
                    Layers
                  </button>
                  <button
                    onClick={() => handleInspect(pattern.voicing, 'Voicing', pattern.word)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded ${
                      pattern.voicing 
                        ? 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20' 
                        : 'bg-slate-800/50 text-slate-600'
                    }`}
                    disabled={!pattern.voicing}
                  >
                    <Mic size={12} />
                    Voicing
                  </button>
                  <button
                    onClick={() => handleInspect(pattern.essence, 'Essence', pattern.word)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded ${
                      pattern.essence 
                        ? 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20' 
                        : 'bg-slate-800/50 text-slate-600'
                    }`}
                    disabled={!pattern.essence}
                  >
                    <Sparkles size={12} />
                    Essence
                  </button>
                  <button
                    onClick={() => handleInspect(pattern.image_brief || null, 'Brief', pattern.word)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded ${
                      pattern.image_brief 
                        ? 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20' 
                        : 'bg-slate-800/50 text-slate-600'
                    }`}
                    disabled={!pattern.image_brief}
                  >
                    <ImageIcon size={12} />
                    Brief
                  </button>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  {new Date(pattern.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPatterns.map((pattern) => (
            <div key={pattern.id} className="bg-slate-900/50 border border-slate-800 hover:border-teal-500/50 rounded-lg p-4 flex items-center gap-4 transition-colors">
              <div className="w-16 h-16 rounded overflow-hidden bg-slate-950 flex-shrink-0">
                {pattern.image_url ? (
                  <img src={pattern.image_url} alt={pattern.word} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700">
                    <ImageIcon size={24} opacity={0.2} />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <h3 className="text-white font-bold capitalize">{pattern.word}</h3>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(pattern.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                {pattern.layers && <span className="text-xs text-teal-400">Layers</span>}
                {pattern.voicing && <span className="text-xs text-teal-400">Voicing</span>}
                {pattern.essence && <span className="text-xs text-teal-400">Essence</span>}
                {pattern.image_url && <span className="text-xs text-teal-400">Image</span>}
              </div>
              <button 
                onClick={() => handleManage(pattern)}
                className="p-2 hover:bg-slate-800 rounded"
              >
                <MoreHorizontal size={18} className="text-slate-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Manage Modal */}
      {isModalOpen && selectedPattern && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white capitalize">{selectedPattern.word}</h2>
                <p className="text-sm text-slate-400 mt-1">Manage pattern components</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleAction('clear_layers')}
                disabled={!selectedPattern.layers || processingAction}
                className="w-full text-left px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded text-sm text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Layers
              </button>
              <button
                onClick={() => handleAction('clear_voicing')}
                disabled={!selectedPattern.voicing || processingAction}
                className="w-full text-left px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded text-sm text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Voicing
              </button>
              <button
                onClick={() => handleAction('clear_essence')}
                disabled={!selectedPattern.essence || processingAction}
                className="w-full text-left px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded text-sm text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Essence
              </button>
              <button
                onClick={() => handleAction('clear_brief')}
                disabled={!selectedPattern.image_brief || processingAction}
                className="w-full text-left px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded text-sm text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Brief
              </button>
              <button
                onClick={() => handleAction('clear_image')}
                disabled={!selectedPattern.image_url || processingAction}
                className="w-full text-left px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded text-sm text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Image
              </button>
              <button
                onClick={() => handleAction('delete_all')}
                disabled={processingAction}
                className="w-full text-left px-4 py-2 bg-red-900/20 hover:bg-red-900/30 rounded text-sm text-red-400 flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete Entire Pattern
              </button>
            </div>

            {processingAction && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
                <Loader2 className="animate-spin" size={16} />
                Processing...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inspector Panel */}
      {inspectorOpen && inspectorData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-start p-6 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">{inspectorData.type}</h2>
                <p className="text-sm text-slate-400 mt-1 capitalize">{inspectorData.word}</p>
              </div>
              <button onClick={() => setInspectorOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-6">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                {inspectorData.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
