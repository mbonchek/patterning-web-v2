import { useState, useEffect } from 'react';
import { GitBranch, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Pattern {
  id: string;
  pattern_id: string;
  pattern_ref: string;
  seed_id: string;
  parent_pattern_id: string | null;
  branch_point: string | null;
  generation: number;
  branch_count: number;
  user_likes: number;
  created_at: string;
  word_seeds: {
    text: string;
  };
  children?: Pattern[];
}

interface LineageData {
  roots: Pattern[];
  total_branches: number;
  max_generation: number;
}

const PIPELINE_STEPS = [
  { code: 'seed', label: 'Seed', color: 'bg-gray-500' },
  { code: 'vely', label: 'Verbal Layer', color: 'bg-green-500' },
  { code: 'vevc', label: 'Voicing', color: 'bg-cyan-500' },
  { code: 'vees', label: 'Verbal Essence', color: 'bg-cyan-600' },
  { code: 'vily', label: 'Visual Layer', color: 'bg-purple-500' },
  { code: 'vies', label: 'Visual Essence', color: 'bg-purple-600' },
  { code: 'viim', label: 'Image', color: 'bg-pink-500' },
];

export default function Branching() {
  const [lineageData, setLineageData] = useState<LineageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPatterns, setExpandedPatterns] = useState<Set<string>>(new Set());
  const [branching, setBranching] = useState(false);
  const [branchingFrom, setBranchingFrom] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchLineage = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/patterns/lineage-tree`
      );
      if (!response.ok) throw new Error('Failed to fetch lineage');
      const data = await response.json();
      setLineageData(data);
    } catch (error) {
      console.error('Error fetching lineage:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLineage();
  }, []);

  const toggleExpand = (patternId: string) => {
    setExpandedPatterns(prev => {
      const next = new Set(prev);
      if (next.has(patternId)) {
        next.delete(patternId);
      } else {
        next.add(patternId);
      }
      return next;
    });
  };

  const handleBranch = async (patternId: string, branchPoint: string) => {
    if (!confirm(`Create a branch from ${branchPoint}? This will reuse everything up to this point and regenerate the rest.`)) return;
    
    setBranching(true);
    setBranchingFrom(`${patternId}-${branchPoint}`);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/pattern/${patternId}/branch`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branch_point: branchPoint, collect_trace: false })
        }
      );

      if (!response.ok) throw new Error('Failed to create branch');

      // Read SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let newPatternId = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'complete') {
                  newPatternId = data.pattern_id;
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      if (newPatternId) {
        alert('Branch created successfully!');
        // Refresh the lineage tree
        await fetchLineage();
        // Expand the parent to show the new child
        setExpandedPatterns(prev => new Set(prev).add(patternId));
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      alert('Failed to create branch');
    } finally {
      setBranching(false);
      setBranchingFrom(null);
    }
  };

  const renderPipeline = (pattern: Pattern, depth: number = 0) => {
    const isExpanded = expandedPatterns.has(pattern.id);
    const hasChildren = pattern.children && pattern.children.length > 0;
    const seedWord = pattern.word_seeds?.text || 'unknown';

    return (
      <div key={pattern.id} className="mb-4">
        {/* Pattern Pipeline */}
        <div 
          className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-lg border border-[#00f0ff]/20 p-4"
          style={{ marginLeft: `${depth * 40}px` }}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(pattern.id)}
                  className="text-[#00f0ff] hover:text-[#00f0ff]/80 transition-colors"
                >
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
              )}
              <GitBranch size={18} className="text-[#00f0ff]" />
              <div>
                <h3 className="text-lg font-semibold text-white">{seedWord}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {pattern.generation > 0 && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                      gen {pattern.generation}
                    </span>
                  )}
                  {pattern.branch_point && (
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                      from {pattern.branch_point}
                    </span>
                  )}
                  {pattern.branch_count > 0 && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded">
                      {pattern.branch_count} {pattern.branch_count === 1 ? 'branch' : 'branches'}
                    </span>
                  )}
                  <span>{new Date(pattern.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/pattern/word/${pattern.id}`)}
              className="text-sm text-[#00f0ff] hover:text-[#00f0ff]/80 transition-colors"
            >
              View Details →
            </button>
          </div>

          {/* Pipeline Steps */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {PIPELINE_STEPS.map((step, index) => (
              <div key={step.code} className="flex items-center">
                {/* Step Node */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${step.color} ${
                      pattern.branch_point === step.code ? 'ring-4 ring-yellow-400' : ''
                    }`}
                    title={step.label}
                  />
                  <div className="text-xs text-gray-400 mt-1 whitespace-nowrap">{step.label}</div>
                  {/* Branch Button */}
                  {step.code !== 'seed' && (
                    <button
                      onClick={() => handleBranch(pattern.id, step.code)}
                      disabled={branching}
                      className="mt-1 text-xs px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`Branch from ${step.label}`}
                    >
                      {branching && branchingFrom === `${pattern.id}-${step.code}` ? '...' : 'Branch'}
                    </button>
                  )}
                </div>
                {/* Connector Line */}
                {index < PIPELINE_STEPS.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-600 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Render Children (if expanded) */}
        {isExpanded && hasChildren && pattern.children && (
          <div className="mt-2">
            {pattern.children.map(child => renderPipeline(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#00f0ff] text-lg">Loading lineage tree...</div>
      </div>
    );
  }

  if (!lineageData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">No lineage data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GitBranch size={32} className="text-[#00f0ff]" />
            Pattern Lineage
          </h1>
          <p className="text-gray-400 mt-1">Explore the evolutionary tree of pattern generations</p>
        </div>
        <button
          onClick={fetchLineage}
          className="px-4 py-2 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-lg border border-blue-500/30 p-6">
          <div className="text-4xl font-bold text-blue-400">{lineageData.roots.length}</div>
          <div className="text-gray-400 mt-1">Root Patterns</div>
        </div>
        <div className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-lg border border-purple-500/30 p-6">
          <div className="text-4xl font-bold text-purple-400">{lineageData.total_branches}</div>
          <div className="text-gray-400 mt-1">Total Branches</div>
        </div>
        <div className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-lg border border-green-500/30 p-6">
          <div className="text-4xl font-bold text-green-400">{lineageData.max_generation}</div>
          <div className="text-gray-400 mt-1">Max Generation</div>
        </div>
      </div>

      {/* Pipeline List */}
      <div className="space-y-4">
        {lineageData.roots.map(pattern => renderPipeline(pattern))}
      </div>
    </div>
  );
}
