import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

interface Pattern {
  word: string;
  image_url?: string;
  essence?: string;
  brief?: string;
  voicing?: string;
  layers?: string;
  created_at?: string;
}

export default function PatternDetail() {
  const { word } = useParams<{ word: string }>();
  const navigate = useNavigate();
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [voicingOpen, setVoicingOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  
  console.log('PatternDetail mounted, word:', word);

  useEffect(() => {
    if (!word) return;
    
    // Fetch pattern data from API
    const fetchPattern = async () => {
      try {
        setLoading(true);
        console.log('Fetching pattern for word:', word);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/word/${word}`);
        console.log('Response status:', response.status);
        if (!response.ok) throw new Error('Pattern not found');
        const data = await response.json();
        console.log('Pattern data received:', data);
        
        // API returns flat structure, use directly
        const transformedPattern: Pattern = {
          word: data.word || word,
          image_url: data.image_url,
          essence: data.essence,
          brief: data.brief,
          voicing: data.voicing,
          layers: data.layers,
          created_at: data.created_at
        };
        
        setPattern(transformedPattern);
      } catch (error) {
        console.error('Error fetching pattern:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPattern();
  }, [word]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading pattern...</div>
      </div>
    );
  }

  if (!pattern) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Pattern not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate('/admin/library')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Library
        </button>
      </div>

      {/* Hero Section - Full Width Image with Word Overlay */}
      <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
        {pattern.image_url ? (
          <>
            <img
              src={pattern.image_url}
              alt={pattern.word}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/90" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600" />
        )}
        
        {/* Word Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-7xl md:text-9xl font-bold text-white drop-shadow-2xl tracking-tight">
            {pattern.word}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Essence and Brief Side-by-Side */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Verbal Essence */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">Verbal Essence</h2>
            <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
              {pattern.essence || 'No essence available'}
            </div>
          </div>

          {/* Visual Essence (Brief) */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-semibold text-blue-300 mb-4">Visual Essence</h2>
            <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
              {pattern.brief || 'No brief available'}
            </div>
          </div>
        </div>

        {/* Collapsible Voicing Section */}
        <div className="mb-6">
          <button
            onClick={() => setVoicingOpen(!voicingOpen)}
            className="w-full bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between group"
          >
            <h2 className="text-2xl font-semibold text-emerald-300">Voicing</h2>
            {voicingOpen ? (
              <ChevronUp className="w-6 h-6 text-emerald-300 group-hover:scale-110 transition-transform" />
            ) : (
              <ChevronDown className="w-6 h-6 text-emerald-300 group-hover:scale-110 transition-transform" />
            )}
          </button>
          
          {voicingOpen && (
            <div className="mt-4 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="text-gray-200 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                {pattern.voicing || 'No voicing available'}
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Layers Section */}
        <div className="mb-12">
          <button
            onClick={() => setLayersOpen(!layersOpen)}
            className="w-full bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between group"
          >
            <h2 className="text-2xl font-semibold text-amber-300">Layers</h2>
            {layersOpen ? (
              <ChevronUp className="w-6 h-6 text-amber-300 group-hover:scale-110 transition-transform" />
            ) : (
              <ChevronDown className="w-6 h-6 text-amber-300 group-hover:scale-110 transition-transform" />
            )}
          </button>
          
          {layersOpen && (
            <div className="mt-4 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="text-gray-200 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                {pattern.layers || 'No layers available'}
              </div>
            </div>
          )}
        </div>

        {/* Share URL */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Share this pattern</p>
              <p className="text-white font-mono text-lg">GiveVoice.to/{pattern.word}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`GiveVoice.to/${pattern.word}`);
                alert('URL copied to clipboard!');
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
