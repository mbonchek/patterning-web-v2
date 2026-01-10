import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid3x3, List, Search } from 'lucide-react';

interface Pattern {
  id: string;
  word: string;
  created_at: string;
  thumbnail_url?: string;
  image_url?: string;
}

export default function Gallery() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [filteredPatterns, setFilteredPatterns] = useState<Pattern[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatterns();
  }, []);

  useEffect(() => {
    // Filter patterns based on search query
    if (searchQuery.trim() === '') {
      setFilteredPatterns(patterns);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredPatterns(
        patterns.filter(p => p.word.toLowerCase().includes(query))
      );
    }
  }, [searchQuery, patterns]);

  const fetchPatterns = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/patterns`);
      const data = await response.json();
      
      // Extract patterns array from response
      const patternsList = data.patterns || [];
      
      // Sort alphabetically by word
      const sorted = patternsList.sort((a: Pattern, b: Pattern) => 
        a.word.localeCompare(b.word)
      );
      
      setPatterns(sorted);
      setFilteredPatterns(sorted);
    } catch (error) {
      console.error('Error fetching patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatternClick = (pattern: Pattern) => {
    navigate(`/pattern/${pattern.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-[#00f0ff] text-xl font-serif">Loading patterns...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#1a1f2e]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-serif font-semibold text-[#00f0ff] mb-2">
                GiveVoice
              </h1>
              <p className="text-slate-400 font-sans">
                Revealing the intelligence in words
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-2 bg-[#1a1f2e] rounded-lg p-1 border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#00f0ff]/20 text-[#00f0ff]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#00f0ff]/20 text-[#00f0ff]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1f2e] border border-slate-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
            />
          </div>
        </div>
      </header>

      {/* Gallery Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {filteredPatterns.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              {searchQuery ? 'No patterns found matching your search.' : 'No patterns yet.'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPatterns.map((pattern) => (
                  <PatternTile
                    key={pattern.id}
                    pattern={pattern}
                    onClick={() => handlePatternClick(pattern)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPatterns.map((pattern) => (
                  <PatternListItem
                    key={pattern.id}
                    pattern={pattern}
                    onClick={() => handlePatternClick(pattern)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Grid Tile Component
function PatternTile({ pattern, onClick }: { pattern: Pattern; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative aspect-video bg-[#1a1f2e] rounded-lg overflow-hidden cursor-pointer border border-slate-800 hover:border-[#00f0ff]/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
    >
      {/* Image */}
      {pattern.thumbnail_url ? (
        <img
          src={pattern.thumbnail_url}
          alt={pattern.word}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1f2e] to-[#0d1117]">
          <span className="text-slate-600 text-6xl font-serif">?</span>
        </div>
      )}
      
      {/* Word Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center p-6">
        <h3 className="text-3xl font-serif font-semibold text-white group-hover:text-[#00f0ff] transition-colors duration-300">
          {pattern.word}
        </h3>
      </div>
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00f0ff]/10 to-transparent" />
      </div>
    </div>
  );
}

// List Item Component
function PatternListItem({ pattern, onClick }: { pattern: Pattern; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-6 bg-[#1a1f2e] rounded-lg p-4 border border-slate-800 hover:border-[#00f0ff]/50 cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]"
    >
      {/* Thumbnail */}
      <div className="w-32 h-20 flex-shrink-0 rounded overflow-hidden bg-[#0d1117]">
        {pattern.thumbnail_url ? (
          <img
            src={pattern.thumbnail_url}
            alt={pattern.word}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-slate-600 text-3xl font-serif">?</span>
          </div>
        )}
      </div>
      
      {/* Word */}
      <div className="flex-1">
        <h3 className="text-2xl font-serif font-semibold text-white group-hover:text-[#00f0ff] transition-colors duration-300">
          {pattern.word}
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {new Date(pattern.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
}
