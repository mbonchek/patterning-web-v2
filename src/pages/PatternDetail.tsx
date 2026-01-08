import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft, Maximize2 } from 'lucide-react';

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
  const [fullscreenImage, setFullscreenImage] = useState(false);
  
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
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-[#00f0ff] text-xl font-serif">Loading pattern...</div>
      </div>
    );
  }

  if (!pattern) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-[#00f0ff] text-xl font-serif">Pattern not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate('/admin/library')}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1f2e]/80 hover:bg-[#1a1f2e] backdrop-blur-sm rounded-lg text-[#00f0ff] transition-all border border-[#00f0ff]/20 hover:border-[#00f0ff]/40"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-sans">Back to Library</span>
        </button>
      </div>

      {/* Hero Section - Full Width Image with Word and Verbal Essence Overlay */}
      <div className="relative w-full h-[70vh] min-h-[600px] overflow-hidden">
        {pattern.image_url ? (
          <>
            <img
              src={pattern.image_url}
              alt={pattern.word}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0d1117]" />
            
            {/* Fullscreen Button */}
            <button
              onClick={() => setFullscreenImage(true)}
              className="absolute top-6 right-6 p-3 bg-[#1a1f2e]/80 hover:bg-[#1a1f2e] backdrop-blur-sm rounded-lg text-[#00f0ff] transition-all z-10 border border-[#00f0ff]/20 hover:border-[#00f0ff]/40"
              title="View fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7c4dff] to-[#00f0ff]" />
        )}
        
        {/* Word and Verbal Essence Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-7xl md:text-9xl font-serif font-semibold text-white drop-shadow-2xl tracking-tight mb-8">
            {pattern.word}
          </h1>
          
          {/* Verbal Essence in Overlay */}
          {pattern.essence && (
            <div className="max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl text-white/95 leading-relaxed font-sans drop-shadow-lg">
                {pattern.essence}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Visual Essence (Brief) - Full Width */}
        {pattern.brief && (
          <div className="mb-12 bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-10 border border-[#00f0ff]/20 shadow-lg shadow-[#00f0ff]/5">
            <h2 className="text-3xl font-serif font-semibold text-[#00f0ff] mb-6">Visual Essence</h2>
            <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap font-sans">
              {pattern.brief}
            </div>
          </div>
        )}

        {/* Collapsible Voicing Section */}
        {pattern.voicing && (
          <div className="mb-6">
            <button
              onClick={() => setVoicingOpen(!voicingOpen)}
              className="w-full bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#7c4dff]/20 hover:border-[#7c4dff]/40 hover:bg-[#1a1f2e]/80 transition-all flex items-center justify-between group shadow-lg shadow-[#7c4dff]/5"
            >
              <h2 className="text-3xl font-serif font-semibold text-[#7c4dff]">Voicing</h2>
              {voicingOpen ? (
                <ChevronUp className="w-7 h-7 text-[#7c4dff] group-hover:scale-110 transition-transform" />
              ) : (
                <ChevronDown className="w-7 h-7 text-[#7c4dff] group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {voicingOpen && (
              <div className="mt-4 bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-10 border border-[#7c4dff]/20 shadow-lg shadow-[#7c4dff]/5">
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                  {pattern.voicing}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Collapsible Layers Section */}
        {pattern.layers && (
          <div className="mb-12">
            <button
              onClick={() => setLayersOpen(!layersOpen)}
              className="w-full bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#00e5a0]/20 hover:border-[#00e5a0]/40 hover:bg-[#1a1f2e]/80 transition-all flex items-center justify-between group shadow-lg shadow-[#00e5a0]/5"
            >
              <h2 className="text-3xl font-serif font-semibold text-[#00e5a0]">Layers</h2>
              {layersOpen ? (
                <ChevronUp className="w-7 h-7 text-[#00e5a0] group-hover:scale-110 transition-transform" />
              ) : (
                <ChevronDown className="w-7 h-7 text-[#00e5a0] group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {layersOpen && (
              <div className="mt-4 bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-10 border border-[#00e5a0]/20 shadow-lg shadow-[#00e5a0]/5">
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                  {pattern.layers}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Share URL */}
        <div className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#00f0ff]/20 shadow-lg shadow-[#00f0ff]/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-2 font-sans">Share this pattern</p>
              <p className="text-[#00f0ff] font-mono text-lg md:text-xl">GiveVoice.to/{pattern.word}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`GiveVoice.to/${pattern.word}`);
                alert('URL copied to clipboard!');
              }}
              className="px-8 py-3 bg-[#00f0ff] hover:bg-[#00f0ff]/90 text-[#0d1117] font-sans font-semibold rounded-lg transition-all shadow-lg shadow-[#00f0ff]/20 hover:shadow-[#00f0ff]/40"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && pattern.image_url && (
        <div 
          className="fixed inset-0 z-50 bg-[#0d1117]/98 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(false)}
        >
          <button
            onClick={() => setFullscreenImage(false)}
            className="absolute top-6 right-6 p-3 bg-[#1a1f2e]/80 hover:bg-[#1a1f2e] backdrop-blur-sm rounded-lg text-[#00f0ff] transition-all border border-[#00f0ff]/20"
            title="Close fullscreen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={pattern.image_url}
            alt={pattern.word}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
