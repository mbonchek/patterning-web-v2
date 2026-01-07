import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface WordInputProps {
  onGenerate: (word: string) => void;
  isGenerating: boolean;
}

export function WordInput({ onGenerate, isGenerating }: WordInputProps) {
  const [word, setWord] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (word.trim() && !isGenerating) {
      onGenerate(word.trim().toLowerCase());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold">Explore a Word</h2>
        <p className="text-muted-foreground">
          Enter a word to discover its layers, voicing, essence, and visual representation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div className="relative">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter a word..."
            disabled={isGenerating}
            className="w-full px-6 py-4 text-lg border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={!word.trim() || isGenerating}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Pattern
            </>
          )}
        </button>
      </form>

      {isGenerating && (
        <div className="text-center text-sm text-muted-foreground">
          This may take 30-60 seconds...
        </div>
      )}
    </div>
  );
}
