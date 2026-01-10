import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft, Maximize2 } from 'lucide-react';

interface Pattern {
  id: string;
  word: string;
  image_url?: string;
  verbal_essence?: string;
  visual_brief?: string;
  verbal_layer?: string;
  verbal_voicing?: string;
  visual_layer?: string;
  created_at?: string;
}

export default function PatternDetail() {
  const { word, id } = useParams<{ word?: string; id?: string }>();
  const navigate = useNavigate();
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [voicingOpen, setVoicingOpen] = useState(false);
  const [verbalLayerOpen, setVerbalLayerOpen] = useState(false);
  const [visualLayerOpen, setVisualLayerOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(false);
  
  console.log('PatternDetail mounted, word:', word);

  useEffect(() => {
    if (!word && !id) return;
    
    // Fetch pattern data from API
    const fetchPattern = async () => {
      try {
        setLoading(true);
        
        let apiUrl;
        if (id) {
          // Fetching by pattern ID (preferred)
          console.log('Fetching pattern by ID:', id);
          apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/patterns/${id}`;
        } else {
          // Fetching by word (legacy route - may not work)
          console.log('Fetching pattern for word:', word);
          apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/word/${word}`;
        }
        
        const response = await fetch(apiUrl);
        console.log('Response status:', response.status);
        if (!response.ok) throw new Error('Pattern not found');
        const data = await response.json();
        console.log('Pattern data received:', data);
        
        let patternData;
        if (id) {
          // Single pattern response from /api/patterns/:id (flat structure)
          patternData = data.pattern;
          
          // Data is already flat, use directly
          const transformedPattern: Pattern = {
            id: patternData.id,
            word: patternData.word,
            image_url: patternData.image_url,
            verbal_essence: patternData.verbal_essence,
            visual_brief: patternData.visual_brief,
            verbal_layer: patternData.verbal_layer,
            verbal_voicing: patternData.verbal_voicing,
            visual_layer: patternData.visual_layer,
            created_at: patternData.created_at
          };
          setPattern(transformedPattern);
        } else {
          // Array of patterns from /api/word/:word (nested structure)
          const patterns = data.patterns || [];
          if (patterns.length === 0) {
            throw new Error('No patterns found for this word');
          }
          patternData = patterns[0]; // Already sorted by created_at desc
          
          // Transform nested structure to flat
          const transformedPattern: Pattern = {
            id: patternData.id,
            word: patternData.word_seeds?.text || word || '',
            image_url: patternData.word_visual_image?.image_url,
            verbal_essence: patternData.word_verbal_essence?.content,
            visual_brief: patternData.word_visual_brief?.content,
            verbal_layer: patternData.word_verbal_layer?.content,
            verbal_voicing: patternData.word_verbal_voicing?.content,
            visual_layer: patternData.word_visual_layer?.content,
            created_at: patternData.created_at
          };
          setPattern(transformedPattern);
        }
      } catch (error) {
        console.error('Error fetching pattern:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPattern();
  }, [word, id]);

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

      {/* Hero Section - Full Width Image with Word Overlay */}
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
        
        {/* Word Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-7xl md:text-9xl font-serif font-semibold text-white drop-shadow-2xl tracking-tight">
            {pattern.word}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Dual Essences - Side by Side */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Verbal Essence */}
          {pattern.verbal_essence && (
            <div className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#00f0ff]/30 shadow-lg shadow-[#00f0ff]/10">
              <h2 className="text-2xl font-serif font-semibold text-[#00f0ff] mb-4">Verbal Essence</h2>
              <p className="text-gray-200 text-lg leading-relaxed font-sans">
                {pattern.verbal_essence}
              </p>
            </div>
          )}
          
          {/* Visual Brief */}
          {pattern.visual_brief && (
            <div className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#7c4dff]/30 shadow-lg shadow-[#7c4dff]/10">
              <h2 className="text-2xl font-serif font-semibold text-[#7c4dff] mb-4">Visual Brief</h2>
              <p className="text-gray-200 text-lg leading-relaxed font-sans">
                {pattern.visual_brief}
              </p>
            </div>
          )}
        </div>

        {/* Collapsible Voicing Section */}
        {pattern.verbal_voicing && (
          <div className="mb-6">
            <button
              onClick={() => setVoicingOpen(!voicingOpen)}
              className="w-full bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#00f0ff]/20 hover:border-[#00f0ff]/40 hover:bg-[#1a1f2e]/80 transition-all flex items-center justify-between group shadow-lg shadow-[#00f0ff]/5"
            >
              <h2 className="text-3xl font-serif font-semibold text-[#00f0ff]">Voicing</h2>
              {voicingOpen ? (
                <ChevronUp className="w-7 h-7 text-[#00f0ff] group-hover:scale-110 transition-transform" />
              ) : (
                <ChevronDown className="w-7 h-7 text-[#00f0ff] group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {voicingOpen && (
              <div className="mt-4 bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-10 border border-[#00f0ff]/20 shadow-lg shadow-[#00f0ff]/5">
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                  {pattern.verbal_voicing}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Collapsible Verbal Layer Section */}
        {pattern.verbal_layer && (
          <div className="mb-6">
            <button
              onClick={() => setVerbalLayerOpen(!verbalLayerOpen)}
              className="w-full bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#00e5a0]/20 hover:border-[#00e5a0]/40 hover:bg-[#1a1f2e]/80 transition-all flex items-center justify-between group shadow-lg shadow-[#00e5a0]/5"
            >
              <h2 className="text-3xl font-serif font-semibold text-[#00e5a0]">Verbal Layers</h2>
              {verbalLayerOpen ? (
                <ChevronUp className="w-7 h-7 text-[#00e5a0] group-hover:scale-110 transition-transform" />
              ) : (
                <ChevronDown className="w-7 h-7 text-[#00e5a0] group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {verbalLayerOpen && (
              <div className="mt-4 bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-10 border border-[#00e5a0]/20 shadow-lg shadow-[#00e5a0]/5">
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                  {pattern.verbal_layer}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Collapsible Visual Layer Section */}
        {pattern.visual_layer && (
          <div className="mb-12">
            <button
              onClick={() => setVisualLayerOpen(!visualLayerOpen)}
              className="w-full bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#7c4dff]/20 hover:border-[#7c4dff]/40 hover:bg-[#1a1f2e]/80 transition-all flex items-center justify-between group shadow-lg shadow-[#7c4dff]/5"
            >
              <h2 className="text-3xl font-serif font-semibold text-[#7c4dff]">Visual Layers</h2>
              {visualLayerOpen ? (
                <ChevronUp className="w-7 h-7 text-[#7c4dff] group-hover:scale-110 transition-transform" />
              ) : (
                <ChevronDown className="w-7 h-7 text-[#7c4dff] group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {visualLayerOpen && (
              <div className="mt-4 bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-10 border border-[#7c4dff]/20 shadow-lg shadow-[#7c4dff]/5">
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                  {pattern.visual_layer}
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
                navigator.clipboard.writeText(`https://GiveVoice.to/${pattern.word}`);
              }}
              className="px-6 py-3 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/30 hover:border-[#00f0ff]/50 rounded-lg text-[#00f0ff] font-sans transition-all"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && pattern.image_url && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(false)}
        >
          <button
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
            onClick={() => setFullscreenImage(false)}
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
