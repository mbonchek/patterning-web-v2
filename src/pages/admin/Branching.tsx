import { useState, useEffect } from 'react';
import { GitBranch, ChevronRight, ChevronDown } from 'lucide-react';

interface Pattern {
  id: string;
  pattern_id: string;
  pattern_ref: string;
  parent_pattern_id: string | null;
  branch_point: string | null;
  generation: number;
  branch_count: number;
  created_at: string;
  word_seeds: {
    text: string;
  };
  children?: Pattern[];
}

export default function Branching() {
  const [roots, setRoots] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLineageTree();
  }, []);

  const fetchLineageTree = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/patterns/lineage-tree`);
      if (!response.ok) throw new Error('Failed to fetch lineage tree');
      
      const data = await response.json();
      setRoots(data.roots || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lineage tree');
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (patternId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(patternId)) {
        next.delete(patternId);
      } else {
        next.add(patternId);
      }
      return next;
    });
  };

  const renderTree = (pattern: Pattern, depth: number = 0) => {
    const hasChildren = pattern.children && pattern.children.length > 0;
    const isExpanded = expandedNodes.has(pattern.id);
    const indent = depth * 24;

    return (
      <div key={pattern.id} className="border-l-2 border-gray-700">
        <div
          className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 cursor-pointer"
          style={{ paddingLeft: `${indent + 12}px` }}
          onClick={() => hasChildren && toggleNode(pattern.id)}
        >
          {/* Expand/collapse icon */}
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )
          ) : (
            <div className="w-4 h-4 flex-shrink-0" />
          )}

          {/* Branch icon */}
          <GitBranch className="w-4 h-4 text-blue-400 flex-shrink-0" />

          {/* Pattern info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white truncate">
                {pattern.word_seeds.text}
              </span>
              {pattern.generation > 0 && (
                <span className="text-xs text-gray-400">
                  gen {pattern.generation}
                </span>
              )}
              {pattern.branch_point && (
                <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                  from {pattern.branch_point}
                </span>
              )}
              {pattern.branch_count > 0 && (
                <span className="text-xs text-gray-400">
                  {pattern.branch_count} {pattern.branch_count === 1 ? 'branch' : 'branches'}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 truncate mt-0.5">
              {pattern.pattern_ref || pattern.pattern_id}
            </div>
          </div>

          {/* Created date */}
          <div className="text-xs text-gray-500 flex-shrink-0">
            {new Date(pattern.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="ml-3">
            {pattern.children!.map(child => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <GitBranch className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Pattern Lineage</h1>
          </div>
          <div className="text-gray-400">Loading lineage tree...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <GitBranch className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Pattern Lineage</h1>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <GitBranch className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold">Pattern Lineage</h1>
              <p className="text-gray-400 text-sm mt-1">
                Explore the evolutionary tree of pattern generations
              </p>
            </div>
          </div>
          <button
            onClick={fetchLineageTree}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
          >
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">
              {roots.length}
            </div>
            <div className="text-sm text-gray-400">Root Patterns</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">
              {roots.reduce((sum, r) => sum + (r.branch_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-400">Total Branches</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {Math.max(...roots.map(r => r.generation || 0), 0)}
            </div>
            <div className="text-sm text-gray-400">Max Generation</div>
          </div>
        </div>

        {/* Tree view */}
        {roots.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-12 text-center">
            <GitBranch className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No patterns yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Generate patterns and create branches to see the lineage tree
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            {roots.map(root => renderTree(root))}
          </div>
        )}
      </div>
    </div>
  );
}
