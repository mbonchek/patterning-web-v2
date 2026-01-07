import { useState } from 'react';
import { Mic2, Play, AlertCircle, CheckCircle, Loader2, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';

interface TraceData {
  prompt: string;
  response: string;
  system?: string;
  model?: string;
  config?: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    top_k?: number;
  };
}

interface LogEntry {
  word: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message: string;
  step?: string;
  traces: {
    layers?: TraceData;
    voicing?: TraceData;
    essence?: TraceData;
    image_brief?: TraceData;
    image?: TraceData;
  };
}

export function VoiceLab() {
  const [inputWords, setInputWords] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [expandedTraces, setExpandedTraces] = useState<Set<string>>(new Set());

  const handleStart = async (force = true) => {
    const words = inputWords
      .split(/[\n,]/)
      .map(w => w.trim())
      .filter(w => w.length > 0);

    if (words.length === 0) {
      alert('Please enter at least one word.');
      return;
    }

    setIsProcessing(true);
    setLogs(words.map(w => ({ 
      word: w, 
      status: 'pending', 
      message: force ? 'Starting fresh...' : 'Resuming...', 
      traces: {} 
    })));

    // Process sequentially
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      setLogs(prev => prev.map((log, idx) => 
        idx === i 
          ? { ...log, status: 'processing', message: force ? 'Regenerating...' : 'Checking existing data...' } 
          : log
      ));

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/word/${word}/stream?force=${force}`, {
          method: 'GET',
          headers: { 'Accept': 'text/event-stream' }
        });

        if (!response.ok) throw new Error('Network response was not ok');
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;
            
            try {
              const data = JSON.parse(line.slice(6));
              
              setLogs(prev => prev.map((log, idx) => {
                if (idx !== i) return log;
                
                const updated = { ...log };
                
                if (data.type === 'step') {
                  updated.step = data.step;
                  updated.message = data.message || `Processing ${data.step}...`;
                }
                
                if (data.type === 'trace' && data.trace) {
                  updated.traces = {
                    ...updated.traces,
                    [data.step]: data.trace
                  };
                }
                
                if (data.type === 'complete') {
                  updated.status = 'success';
                  updated.message = 'Complete';
                }
                
                if (data.type === 'error') {
                  updated.status = 'error';
                  updated.message = data.error || 'Error occurred';
                }
                
                return updated;
              }));
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      } catch (error) {
        console.error('Error processing word:', error);
        setLogs(prev => prev.map((log, idx) => 
          idx === i 
            ? { ...log, status: 'error', message: `Error: ${error}` } 
            : log
        ));
      }
    }

    setIsProcessing(false);
  };

  const toggleTrace = (key: string) => {
    setExpandedTraces(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Mic2 className="text-teal-400" size={32} />
          <h1 className="text-3xl font-bold text-white">Voice Lab</h1>
        </div>
        <p className="text-slate-400">
          Test pattern generation with full trace visibility. Process words one at a time or in batch.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Words (one per line or comma-separated)
        </label>
        <textarea
          value={inputWords}
          onChange={(e) => setInputWords(e.target.value)}
          placeholder="petrichor&#10;serendipity&#10;ephemeral"
          rows={5}
          disabled={isProcessing}
          className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-teal-500 resize-y disabled:opacity-50"
        />
        
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => handleStart(true)}
            disabled={isProcessing}
            className="flex-1 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Processing...
              </>
            ) : (
              <>
                <Play size={18} />
                Force (Regenerate All)
              </>
            )}
          </button>
          
          <button
            onClick={() => handleStart(false)}
            disabled={isProcessing}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Resume (Fill Missing)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Logs Section */}
      {logs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Log List */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white mb-4">Processing Log</h2>
            {logs.map((log, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedLog(log)}
                className={`bg-slate-900/50 border rounded-xl p-4 cursor-pointer transition-all ${
                  selectedLog?.word === log.word
                    ? 'border-teal-500 bg-teal-900/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-lg">{log.word}</span>
                  {log.status === 'pending' && (
                    <span className="text-slate-500 text-sm">Pending</span>
                  )}
                  {log.status === 'processing' && (
                    <Loader2 className="text-teal-400 animate-spin" size={18} />
                  )}
                  {log.status === 'success' && (
                    <CheckCircle className="text-green-400" size={18} />
                  )}
                  {log.status === 'error' && (
                    <AlertCircle className="text-red-400" size={18} />
                  )}
                </div>
                <p className="text-sm text-slate-400">{log.message}</p>
                {log.step && (
                  <p className="text-xs text-teal-400 mt-1">Step: {log.step}</p>
                )}
              </div>
            ))}
          </div>

          {/* Right: Trace Details */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white mb-4">Trace Details</h2>
            {selectedLog ? (
              <div className="space-y-3">
                {Object.entries(selectedLog.traces).map(([step, trace]) => {
                  const key = `${selectedLog.word}-${step}`;
                  const isExpanded = expandedTraces.has(key);
                  
                  return (
                    <div key={step} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleTrace(key)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                      >
                        <span className="font-bold text-white capitalize">{step}</span>
                        {isExpanded ? (
                          <ChevronDown className="text-slate-400" size={18} />
                        ) : (
                          <ChevronRight className="text-slate-400" size={18} />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-4 border-t border-slate-800 space-y-4">
                          {trace.model && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Model</p>
                              <p className="text-sm text-slate-300 font-mono">{trace.model}</p>
                            </div>
                          )}
                          
                          {trace.system && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">System Prompt</p>
                              <pre className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                                {trace.system}
                              </pre>
                            </div>
                          )}
                          
                          <div>
                            <p className="text-xs text-slate-500 mb-1">User Prompt</p>
                            <pre className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                              {trace.prompt}
                            </pre>
                          </div>
                          
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Response</p>
                            <pre className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                              {trace.response}
                            </pre>
                          </div>
                          
                          {trace.config && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Config</p>
                              <pre className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded overflow-x-auto">
                                {JSON.stringify(trace.config, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {Object.keys(selectedLog.traces).length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    No trace data available yet
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                Select a word to view trace details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
