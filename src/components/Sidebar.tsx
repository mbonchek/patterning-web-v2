import { useEffect, useState } from 'react';
import { fetchHistory } from '../lib/api';
import { Layers, Plus, RefreshCw } from 'lucide-react';

interface Pattern {
  id: string;
  word: string;
  created_at: string;
}

export function Sidebar({ onSelect }: { onSelect: (pattern: any) => void }) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory();
      setPatterns(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="w-64 border-r border-border bg-muted/10 h-screen flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h1 className="font-bold text-lg flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Patterning
        </h1>
        <button onClick={loadHistory} className="p-1 hover:bg-muted rounded">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {patterns.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="w-full text-left px-3 py-2 rounded hover:bg-muted/50 text-sm truncate"
          >
            {p.word}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 rounded font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          New Pattern
        </button>
      </div>
    </div>
  );
}
