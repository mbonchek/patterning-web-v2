import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Image as ImageIcon, 
  LayoutGrid, 
  List as ListIcon, 
  MoreHorizontal,
  Trash2,
  X,
  Loader2,
  Eye,
  Layers,
  Droplet,
  Podcast,
  LayoutDashboard,
  Sparkle
} from 'lucide-react';

interface Pattern {
  id: string;
  word: string;
  verbal_layer: string | null;
  verbal_voicing: string | null;
  verbal_essence: string | null;
  visual_layer: string | null;
  visual_essence: string | null;
  image_url: string | null;
  thumbnail_url?: string | null;
  created_at: string;
}

export function Library() {
  const navigate = useNavigate();
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

  // Image Modal State
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/patterns?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (res.ok) {
        const data = await res.json();
        setPatterns(data.patterns || []);
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

  const handleOpenPattern = (pattern: Pattern) => {
    navigate(`/pattern/word/${pattern.id}`);
  };

  const handleOpenImage = (imageUrl: string | null) => {
    if (!imageUrl) return;
    setSelectedImageUrl(imageUrl);
    setImageModalOpen(true);
  };

  const handleAction = async (action: 'delete_all' | 'clear_layers' | 'clear_voicing' | 'clear_essence' | 'clear_visual_layer' | 'clear_image') => {
    if (!selectedPattern) return;
    if (!confirm('Are you sure? This cannot be undone.')) return;

    setProcessingAction(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/manage-pattern`, {
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
            <div 
              key={pattern.id} 
              onClick={() => handleOpenPattern(pattern)}
              className="group bg-slate-900/50 border border-slate-800 hover:border-teal-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/10 flex flex-col relative cursor-pointer"
            >
              {/* Manage Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); handleManage(pattern); }}
                className="absolute top-3 right-3 z-20 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Manage Pattern"
              >
                <MoreHorizontal size={16} />
              </button>

              {/* Image */}
              <div className="relative h-40 overflow-hidden bg-slate-950">
                {pattern.image_url ? (
                  <img 
                    src={pattern.thumbnail_url || pattern.image_url} 
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
                <h3 className="text-lg font-bold text-white capitalize font-serif tracking-wide mb-4">{pattern.word}</h3>
                
                {/* Icon-based Rows */}
                <div className="space-y-3 mb-4">
                  {/* VERBAL Row */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider w-14">Verbal</span>
                    <div className="flex-grow grid grid-cols-3 gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleInspect(pattern.verbal_layer, 'Verbal Layers', pattern.word); }}
                        className={`flex items-center justify-center p-2 rounded border transition-all ${
                          pattern.verbal_layer ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20' : 'bg-slate-800/30 text-slate-600 border-slate-700/30'
                        }`}
                        title="Verbal Layers"
                        disabled={!pattern.verbal_layer}
                      >
                        <Layers size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleInspect(pattern.verbal_essence, 'Verbal Essence', pattern.word); }}
                        className={`flex items-center justify-center p-2 rounded border transition-all ${
                          pattern.verbal_essence ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20' : 'bg-slate-800/30 text-slate-600 border-slate-700/30'
                        }`}
                        title="Verbal Essence"
                        disabled={!pattern.verbal_essence}
                      >
                        <Droplet size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleInspect(pattern.verbal_voicing, 'Voicing', pattern.word); }}
                        className={`flex items-center justify-center p-2 rounded border transition-all ${
                          pattern.verbal_voicing ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20' : 'bg-slate-800/30 text-slate-600 border-slate-700/30'
                        }`}
                        title="Voicing"
                        disabled={!pattern.verbal_voicing}
                      >
                        <Podcast size={14} />
                      </button>
                    </div>
                  </div>

                  {/* VISUAL Row */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider w-14">Visual</span>
                    <div className="flex-grow grid grid-cols-3 gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleInspect(pattern.visual_layer, 'Visual Layers', pattern.word); }}
                        className={`flex items-center justify-center p-2 rounded border transition-all ${
                          pattern.visual_layer ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20' : 'bg-slate-800/30 text-slate-600 border-slate-700/30'
                        }`}
                        title="Visual Layers"
                        disabled={!pattern.visual_layer}
                      >
                        <LayoutDashboard size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleInspect(pattern.visual_essence, 'Visual Essence', pattern.word); }}
                        className={`flex items-center justify-center p-2 rounded border transition-all ${
                          pattern.visual_essence ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20' : 'bg-slate-800/30 text-slate-600 border-slate-700/30'
                        }`}
                        title="Visual Essence"
                        disabled={!pattern.visual_essence}
                      >
                        <Sparkle size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenImage(pattern.image_url); }}
                        className={`flex items-center justify-center p-2 rounded border transition-all ${
                          pattern.image_url ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20' : 'bg-slate-800/30 text-slate-600 border-slate-700/30'
                        }`}
                        title="View Image"
                        disabled={!pattern.image_url}
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 mt-auto">
                  {new Date(pattern.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPatterns.map((pattern) => (
            <div 
              key={pattern.id} 
              className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800 rounded-lg hover:border-teal-500/50 transition-all cursor-pointer group"
              onClick={() => handleOpenPattern(pattern)}
            >
              <div className="flex items-center gap-4 flex-grow">
                {pattern.thumbnail_url && (
                  <img 
                    src={pattern.thumbnail_url} 
                    alt={pattern.word} 
                    className="w-16 h-16 rounded object-cover" 
                  />
                )}
                <div>
                  <h3 className="text-lg font-bold text-white capitalize">{pattern.word}</h3>
                  <p className="text-xs text-slate-500">{new Date(pattern.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleManage(pattern); }}
                className="p-2 text-slate-400 hover:text-white"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inspector Modal */}
      {inspectorOpen && inspectorData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950">
              <h2 className="text-xl font-bold text-white">{inspectorData.type} - {inspectorData.word}</h2>
              <button 
                onClick={() => setInspectorOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <pre className="text-sm text-slate-300 bg-black/50 p-4 rounded border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                {inspectorData.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {imageModalOpen && selectedImageUrl && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <button
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all z-10"
            onClick={() => setImageModalOpen(false)}
          >
            <X size={24} />
          </button>
          <img
            src={selectedImageUrl}
            alt="Pattern"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Management Modal */}
      {isModalOpen && selectedPattern && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Manage Pattern</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => handleAction('delete_all')}
                disabled={processingAction}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processingAction ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
