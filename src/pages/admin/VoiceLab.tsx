import { useState } from 'react';
import { Mic2, Play, AlertCircle, CheckCircle, Loader2, ChevronRight, ChevronDown, RefreshCw, Globe, Clock } from 'lucide-react';

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
  httpTraces: HttpTrace[];
}

export function VoiceLab() {
  const [inputWords, setInputWords] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [expandedTraces, setExpandedTraces] = useState<Set<string>>(new Set());
  const [expandedHttpTraces, setExpandedHttpTraces] = useState<Set<number>>(new Set());

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
      status: 'pending' as const, 
      message: force ? 'Starting fresh...' : 'Resuming...', 
      traces: {},
      httpTraces: []
    })));

    // Process sequentially
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      setLogs(prev => prev.map((log, idx) => 
        idx === i 
          ? { ...log, status: 'processing' as const, message: force ? 'Regenerating...' : 'Checking existing data...' } 
          : log
      ));

      try {
        // Use V2 endpoint for generation
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/word/${word}/generate`;
        const startTime = Date.now();
        
        // Log the initial HTTP request
        setLogs(prev => prev.map((log, idx) => {
          if (idx !== i) return log;
          return {
            ...log,
            httpTraces: [
              ...log.httpTraces,
              {
                timestamp: new Date().toISOString(),
                method: 'POST',
                url: url,
                requestHeaders: { 'Accept': 'text/event-stream' }
              }
            ]
          };
        }));

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Accept': 'text/event-stream' }
        });

        // Log the response
        const duration = Date.now() - startTime;
        setLogs(prev => prev.map((log, idx) => {
          if (idx !== i) return log;
          const traces = [...log.httpTraces];
          traces[traces.length - 1] = {
            ...traces[traces.length - 1],
            status: response.status,
            duration: duration,
            responseHeaders: Object.fromEntries(response.headers.entries())
          };
          return { ...log, httpTraces: traces };
        }));

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
                
                // Log HTTP traces from backend
                if (data.type === 'http_trace' && data.http_trace) {
                  updated.httpTraces = [
                    ...updated.httpTraces,
                    {
                      ...data.http_trace,
                      timestamp: data.http_trace.timestamp || new Date().toISOString()
                    }
                  ];
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
            ? { 
                ...log, 
                status: 'error' as const, 
                message: `Error: ${error}`,
                httpTraces: [
                  ...log.httpTraces,
                  {
                    timestamp: new Date().toISOString(),
                    method: 'GET',
                    url: `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/word/${log.word}/stream`,
                    error: String(error)
                  }
                ]
              } 
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

  const toggleHttpTrace = (index: number) => {
    setExpandedHttpTraces(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-slate-500';
    if (status >= 200 && status < 300) return 'text-green-400';
    if (status >= 300 && status < 400) return 'text-blue-400';
    if (status >= 400 && status < 500) return 'text-yellow-400';
    return 'text-red-400';
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
                {log.httpTraces.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    {log.httpTraces.length} HTTP {log.httpTraces.length === 1 ? 'request' : 'requests'}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Right: Detailed Traces */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white mb-4">Detailed Traces</h2>
            {selectedLog ? (
              <div className="space-y-3">
                {/* HTTP Traces Section */}
                {selectedLog.httpTraces.length > 0 && (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                      <div className="flex items-center gap-2">
                        <Globe className="text-blue-400" size={18} />
                        <h3 className="font-bold text-white">HTTP Trace Log</h3>
                        <span className="text-xs text-slate-500 ml-auto">
                          {selectedLog.httpTraces.length} {selectedLog.httpTraces.length === 1 ? 'request' : 'requests'}
                        </span>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {selectedLog.httpTraces.map((trace, idx) => {
                        const isExpanded = expandedHttpTraces.has(idx);
                        return (
                          <div key={idx} className="border-b border-slate-800 last:border-b-0">
                            <button
                              onClick={() => toggleHttpTrace(idx)}
                              className="w-full flex items-start gap-3 p-4 hover:bg-slate-800/30 transition-colors text-left"
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                {isExpanded ? (
                                  <ChevronDown className="text-slate-400" size={16} />
                                ) : (
                                  <ChevronRight className="text-slate-400" size={16} />
                                )}
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-blue-400 font-mono">{trace.method}</span>
                                  {trace.status && (
                                    <span className={`text-xs font-bold font-mono ${getStatusColor(trace.status)}`}>
                                      {trace.status}
                                    </span>
                                  )}
                                  {trace.duration && (
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                      <Clock size={12} />
                                      {formatDuration(trace.duration)}
                                    </span>
                                  )}
                                  {trace.tokens && (
                                    <span className="text-xs text-purple-400 font-mono">
                                      {trace.tokens.total.toLocaleString()} tokens
                                    </span>
                                  )}
                                  {trace.cost && (
                                    <span className="text-xs text-emerald-400 font-mono font-bold">
                                      ${trace.cost.total.toFixed(4)}
                                    </span>
                                  )}
                                  {trace.error && (
                                    <span className="text-xs font-bold text-red-400">ERROR</span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 font-mono truncate">{trace.url}</p>
                                <p className="text-xs text-slate-600 mt-0.5">
                                  {new Date(trace.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </button>
                            
                            {isExpanded && (
                              <div className="p-4 bg-slate-950/50 space-y-3 text-xs">
                                {trace.model && (
                                  <div>
                                    <p className="text-slate-500 mb-1 font-semibold">Model</p>
                                    <p className="text-slate-300 font-mono">{trace.model}</p>
                                  </div>
                                )}
                                
                                {trace.tokens && (
                                  <div>
                                    <p className="text-slate-500 mb-1 font-semibold">Token Usage</p>
                                    <div className="bg-slate-900 p-2 rounded space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Input:</span>
                                        <span className="text-purple-400 font-mono">{trace.tokens.input.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Output:</span>
                                        <span className="text-purple-400 font-mono">{trace.tokens.output.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between border-t border-slate-800 pt-1 mt-1">
                                        <span className="text-slate-300 font-semibold">Total:</span>
                                        <span className="text-purple-300 font-mono font-bold">{trace.tokens.total.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {trace.cost && (
                                  <div>
                                    <p className="text-slate-500 mb-1 font-semibold">Cost Breakdown</p>
                                    <div className="bg-slate-900 p-2 rounded space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Input:</span>
                                        <span className="text-emerald-400 font-mono">${trace.cost.input.toFixed(6)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Output:</span>
                                        <span className="text-emerald-400 font-mono">${trace.cost.output.toFixed(6)}</span>
                                      </div>
                                      <div className="flex justify-between border-t border-slate-800 pt-1 mt-1">
                                        <span className="text-slate-300 font-semibold">Total:</span>
                                        <span className="text-emerald-300 font-mono font-bold">${trace.cost.total.toFixed(6)}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {trace.requestHeaders && (
                                  <div>
                                    <p className="text-slate-500 mb-1 font-semibold">Request Headers</p>
                                    <pre className="text-slate-300 font-mono bg-slate-900 p-2 rounded overflow-x-auto">
                                      {JSON.stringify(trace.requestHeaders, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                
                                {trace.requestBody && (
                                  <div>
                                    <p className="text-slate-500 mb-1 font-semibold">Request Body</p>
                                    <pre className="text-slate-300 font-mono bg-slate-900 p-2 rounded overflow-x-auto max-h-40 overflow-y-auto">
                                      {typeof trace.requestBody === 'string' 
                                        ? trace.requestBody 
                                        : JSON.stringify(trace.requestBody, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                
                                {trace.responseHeaders && (
                                  <div>
                                    <p className="text-slate-500 mb-1 font-semibold">Response Headers</p>
                                    <pre className="text-slate-300 font-mono bg-slate-900 p-2 rounded overflow-x-auto">
                                      {JSON.stringify(trace.responseHeaders, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                
                                {trace.responseBody && (
                                  <div>
                                    <p className="text-slate-500 mb-1 font-semibold">Response Body</p>
                                    <pre className="text-slate-300 font-mono bg-slate-900 p-2 rounded overflow-x-auto max-h-40 overflow-y-auto">
                                      {typeof trace.responseBody === 'string' 
                                        ? trace.responseBody 
                                        : JSON.stringify(trace.responseBody, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                
                                {trace.error && (
                                  <div>
                                    <p className="text-red-500 mb-1 font-semibold">Error</p>
                                    <pre className="text-red-300 font-mono bg-red-950/30 p-2 rounded overflow-x-auto">
                                      {trace.error}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* AI Traces Section */}
                {Object.keys(selectedLog.traces).length > 0 && (
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
                                  <pre className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                                    {trace.system}
                                  </pre>
                                </div>
                              )}
                              
                              <div>
                                <p className="text-xs text-slate-500 mb-1">User Prompt</p>
                                <pre className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                                  {trace.prompt}
                                </pre>
                              </div>
                              
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Response</p>
                                <pre className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
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
                  </div>
                )}

                {selectedLog.httpTraces.length === 0 && Object.keys(selectedLog.traces).length === 0 && (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
                    <p className="text-slate-500">No trace data available yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
                <p className="text-slate-500">Select a log entry to view traces</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
