import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Loader2 } from 'lucide-react';

interface Prompt {
  id: string;
  slug: string;
  version: number;
  template: string;
  is_active: boolean;
  description: string | null;
  created_at: string;
}

export function Prompts() {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/prompts`);
      if (res.ok) {
        const data = await res.json();
        // Only show active prompts
        const activePrompts = data.filter((p: Prompt) => p.is_active);
        setPrompts(activePrompts);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const promptOrder = ['system', 'layers', 'voicing', 'essence', 'image_brief', 'image'];

  const sortedPrompts = [...prompts].sort((a, b) => {
    const indexA = promptOrder.indexOf(a.slug);
    const indexB = promptOrder.indexOf(b.slug);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.slug.localeCompare(b.slug);
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Invalid Date';
    }
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
          className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> New Prompt
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-teal-400" size={32} />
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
          <p className="text-slate-400 mb-4">No active prompts found.</p>
          <p className="text-sm text-slate-500">Create your first prompt to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPrompts.map((prompt) => (
            <div 
              key={prompt.id}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-xl font-bold text-white capitalize">{prompt.slug}</h2>
                <span className="text-xs text-teal-400 bg-teal-900/30 px-2 py-1 rounded font-mono">
                  v{prompt.version}
                </span>
              </div>
              
              {prompt.description && (
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{prompt.description}</p>
              )}
              
              <div className="text-xs text-slate-500 mb-4">
                {formatDate(prompt.created_at)}
              </div>

              <button
                onClick={() => navigate(`/admin/prompts/${prompt.id}`)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
              >
                <Edit size={16} />
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
