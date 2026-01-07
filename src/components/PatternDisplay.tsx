import { useState } from 'react';
import { Eye, Code } from 'lucide-react';

interface Pattern {
  id?: string;
  word: string;
  layers?: string;
  voicing?: string;
  essence?: string;
  image_brief?: string;
  image_url?: string;
  created_at?: string;
}

interface PatternDisplayProps {
  pattern: Pattern;
}

export function PatternDisplay({ pattern }: PatternDisplayProps) {
  const [viewMode, setViewMode] = useState<'formatted' | 'json'>('formatted');

  if (!pattern) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No pattern selected</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold capitalize">{pattern.word}</h2>
          {pattern.created_at && (
            <p className="text-sm text-muted-foreground mt-1">
              Generated {new Date(pattern.created_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('formatted')}
            className={`px-3 py-2 rounded flex items-center gap-2 ${
              viewMode === 'formatted' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <Eye className="w-4 h-4" />
            Formatted
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-2 rounded flex items-center gap-2 ${
              viewMode === 'json' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <Code className="w-4 h-4" />
            Raw
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === 'formatted' ? (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Image */}
            {pattern.image_url && (
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Visual</h3>
                <div className="rounded-lg overflow-hidden border border-border">
                  <img 
                    src={pattern.image_url} 
                    alt={`Visual representation of ${pattern.word}`}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}

            {/* Essence */}
            {pattern.essence && (
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Essence</h3>
                <div className="bg-muted/10 p-6 rounded-lg border border-border">
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {pattern.essence}
                  </p>
                </div>
              </div>
            )}

            {/* Voicing */}
            {pattern.voicing && (
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Voicing</h3>
                <div className="bg-muted/10 p-6 rounded-lg border border-border">
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {pattern.voicing}
                  </p>
                </div>
              </div>
            )}

            {/* Layers */}
            {pattern.layers && (
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Layers</h3>
                <div className="bg-muted/10 p-6 rounded-lg border border-border">
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {pattern.layers}
                  </p>
                </div>
              </div>
            )}

            {/* Image Brief (Optional, for debugging) */}
            {pattern.image_brief && (
              <details className="space-y-2">
                <summary className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground">
                  Image Brief (Technical)
                </summary>
                <div className="bg-muted/10 p-4 rounded-lg border border-border mt-2">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                    {pattern.image_brief}
                  </p>
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className="bg-muted/10 p-6 rounded-lg border border-border">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {JSON.stringify(pattern, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
