import { useState } from 'react';
import { Layout } from './components/Layout';
import { PromptEditor } from './components/PromptEditor';
import { WordInput } from './components/WordInput';
import { GenerationProgress } from './components/GenerationProgress';
import { PatternDisplay } from './components/PatternDisplay';
import { streamWordGeneration } from './lib/api';

interface Step {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'complete' | 'error';
  message?: string;
}

function App() {
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'patterns' | 'prompts'>('patterns');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<Step[]>([]);


  const handleSelectPattern = (pattern: any) => {
    setSelectedPattern(pattern);
    setCurrentView('patterns');
    setIsGenerating(false);
    setGenerationSteps([]);
  };

  const handleGenerate = async (word: string) => {

    setIsGenerating(true);
    setSelectedPattern(null);
    
    // Initialize steps
    const initialSteps: Step[] = [
      { id: 'layers', title: 'Gathering context', status: 'pending' },
      { id: 'voicing', title: 'Giving voice', status: 'pending' },
      { id: 'essence', title: 'Distilling essence', status: 'pending' },
      { id: 'image_brief', title: 'Optimizing for vision', status: 'pending' },
      { id: 'image', title: 'Generating image', status: 'pending' },
    ];
    setGenerationSteps(initialSteps);

    const generatedPattern: any = { word };

    streamWordGeneration(
      word,
      (data) => {
        // Handle SSE updates
        if (data.status === 'progress') {
          setGenerationSteps(prev => prev.map(step => 
            step.id === data.step 
              ? { ...step, status: 'in-progress', message: data.message }
              : step
          ));
        } else if (data.status === 'success') {
          setGenerationSteps(prev => prev.map(step => 
            step.id === data.step 
              ? { ...step, status: 'complete', message: data.message }
              : step
          ));

          // Store the generated content
          if (data.data?.content) {
            if (data.step === 'layers') {
              generatedPattern.layers = data.data.content;
            } else if (data.step === 'voicing') {
              generatedPattern.voicing = data.data.content;
            } else if (data.step === 'essence') {
              generatedPattern.essence = data.data.content;
            } else if (data.step === 'image_brief') {
              generatedPattern.image_brief = data.data.content;
            }
          }

          // Handle image URL
          if (data.step === 'image' && data.data?.image_url) {
            generatedPattern.image_url = data.data.image_url;
          }
        } else if (data.status === 'error') {
          setGenerationSteps(prev => prev.map(step => 
            step.id === data.step 
              ? { ...step, status: 'error', message: data.message }
              : step
          ));
        }
      },
      () => {
        // On complete
        setIsGenerating(false);
        setSelectedPattern(generatedPattern);
      },
      (error) => {
        // On error
        console.error('Generation error:', error);
        setIsGenerating(false);
        setGenerationSteps(prev => prev.map(step => 
          step.status === 'in-progress' || step.status === 'pending'
            ? { ...step, status: 'error', message: error }
            : step
        ));
      }
    );
  };

  return (
    <Layout onSelectPattern={handleSelectPattern} onViewChange={setCurrentView}>
      {currentView === 'prompts' ? (
        <PromptEditor />
      ) : (
        <div className="h-full">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full">
              <GenerationProgress steps={generationSteps} />
            </div>
          ) : selectedPattern ? (
            <PatternDisplay pattern={selectedPattern} />
          ) : (
            <WordInput onGenerate={handleGenerate} isGenerating={isGenerating} />
          )}
        </div>
      )}
    </Layout>
  );
}

export default App;
