import { useState } from 'react';
import { Mic2, Play, AlertCircle, CheckCircle, Loader2, ChevronRight, ChevronDown, Globe } from 'lucide-react';

interface HttpTrace {
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  error?: string;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  cost?: {
    input: number;
    output: number;
    total: number;
  };
  model?: string;
}

interface LogEntry {
  word: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message: string;
  step?: string;
  data?: any;
  httpTraces: HttpTrace[];
}

export function VoiceLab() {
  const [inputWords, setInputWords] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [expandedHttpTraces, setExpandedHttpTraces] = useState<Set<number>>(new Set());

  const handleStart = async () => {
    const words = inputWords
      .split(/[\n,]/)
      .map(w => w.trim())
      .filter(w => w.length > 0);

    if (words.length === 0) {
      alert('Please enter at least one word.');
      return;
    }

    setIsProcessing(true);
    const initialLogs = words.map(w => ({ 
      word: w, 
      status: 'pending' as const, 
      message: 'Waiting...', 
      httpTraces: []
    }));
    setLogs(initialLogs);

    // Process sequentially
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      setLogs(prev => prev.map((log, idx) => 
        idx === i 
          ? { ...log, status: 'processing' as const, message: 'Starting generation...' } 
          : log
      ));

      try {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/word/${word}/generate`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Accept': 'text/event-stream' }
        });

        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentTrace: HttpTrace | null = null;

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
              
              setLogs(prev => {
                const newLogs = [...prev];
                const log = { ...newLogs[i] };
                
                if (data.type === 'step') {
                  log.step = data.step;
                  log.message = data.message;
                } else if (data.type === 'http_trace') {
                  const trace = data.http_trace;
                  if (trace.method) {
                    // Start of a new trace
                    const newTrace = {
                      ...trace,
                      timestamp: new Date().toISOString()
                    };
                    currentTrace = newTrace;
                    // Append to history instead of replacing
                    log.httpTraces = [...log.httpTraces, newTrace];
                  } else if (currentTrace) {
                    // Update the most recent trace with response data
                    log.httpTraces = log.httpTraces.map((t, idx) => 
                      idx === log.httpTraces.length - 1 ? { ...t, ...trace } : t
                    );
                  }
                } else if (data.type === 'success') {
                  log.message = `Completed ${data.step}`;
                } else if (data.type === 'complete') {
                  log.status = 'success';
                  log.message = 'Generation complete';
                  log.data = data.data;
                } else if (data.type === 'error') {
                  log.status = 'error';
                  log.message = data.message;
                }
                
                newLogs[i] = log;
                // Update selected log if it's the one being processed
                if (selectedLog?.word === log.word) {
                  setSelectedLog(log);
                }
                return newLogs;
              });
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      } catch (error: any) {
        setLogs(prev => {
          const newLogs = [...prev];
          newLogs[i] = { 
            ...newLogs[i], 
            status: 'error', 
            message: error.message 
          };
          return newLogs;
        });
      }
    }

    setIsProcessing(false);
  };

  const toggleHttpTrace = (index: number) => {
    setExpandedHttpTraces(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-slate-500';
    if (status >= 200 && status < 300) return 'text-green-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Mic2 className="text-teal-400" size={32} />
          <h1 className="text-3xl font-bold text-white">Voice Lab</h1>
        </div>
        <p className="text-slate-400">Process words with full real-time HTTP trace visibility.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-6">
        <textarea
          value={inputWords}
          onChange={(e) => setInputWords(e.target.value)}
          placeholder="Enter words to voice..."
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-white font-mono text-sm focus:border-teal-500 outline-none"
        />
        <button
          onClick={() => handleStart()}
          disabled={isProcessing}
          className="mt-4 w-full bg-teal-600 hover:bg-teal-500 text-white py-3 rounded font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
          {isProcessing ? 'Voicing...' : 'Start Generation'}
        </button>
      </div>

      {logs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Queue</h2>
            {logs.map((log, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedLog(log)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedLog?.word === log.word ? 'border-teal-500 bg-teal-900/20' : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white">{log.word}</span>
                  {log.status === 'processing' && <Loader2 className="text-teal-400 animate-spin" size={14} />}
                  {log.status === 'success' && <CheckCircle className="text-green-400" size={14} />}
                  {log.status === 'error' && <AlertCircle className="text-red-400" size={14} />}
                </div>
                <p className="text-xs text-slate-400 truncate">{log.message}</p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Traces</h2>
            {selectedLog ? (
              <div className="space-y-4">
                {selectedLog.httpTraces.map((trace, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleHttpTrace(idx)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Globe size={16} className="text-blue-400" />
                        <span className="text-xs font-mono font-bold text-blue-400">{trace.method}</span>
                        <span className={`text-xs font-mono font-bold ${getStatusColor(trace.status)}`}>
                          {trace.status || 'PENDING'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">{trace.url}</span>
                      </div>
                      {expandedHttpTraces.has(idx) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    
                    {expandedHttpTraces.has(idx) && (
                      <div className="p-4 bg-black/40 border-t border-slate-800 space-y-4">
                        {trace.requestBody && (
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Request</p>
                            <pre className="text-[11px] text-slate-300 bg-slate-950 p-3 rounded border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(trace.requestBody, null, 2)}
                            </pre>
                          </div>
                        )}
                        {trace.responseBody && (
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Response</p>
                            <pre className="text-[11px] text-teal-400 bg-slate-950 p-3 rounded border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(trace.responseBody, null, 2)}
                            </pre>
                          </div>
                        )}
                        {trace.error && (
                          <div className="p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs font-mono">
                            {trace.error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {selectedLog.httpTraces.length === 0 && (
                  <div className="text-center py-12 text-slate-600 italic border border-slate-800 border-dashed rounded-xl">
                    No traces available for this word yet.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-600 italic border border-slate-800 border-dashed rounded-xl">
                Select a word from the queue to view its generation DNA.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
