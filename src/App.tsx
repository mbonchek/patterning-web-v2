import { useState } from 'react';
import { Layout } from './components/Layout';
import { PromptEditor } from './components/PromptEditor';

function App() {
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'patterns' | 'prompts'>('patterns');

  const handleSelectPattern = (pattern: any) => {
    setSelectedPattern(pattern);
    setCurrentView('patterns');
  };

  return (
    <Layout onSelectPattern={handleSelectPattern} onViewChange={setCurrentView}>
      {currentView === 'prompts' ? (
        <PromptEditor />
      ) : (
        <div className="p-8 max-w-4xl mx-auto">
          {selectedPattern ? (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold capitalize">{selectedPattern.word}</h2>
              <div className="bg-muted/10 p-6 rounded-lg border border-border">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {JSON.stringify(selectedPattern, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
              <p>Select a pattern from the sidebar or create a new one.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

export default App;
