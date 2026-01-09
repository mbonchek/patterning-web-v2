import { useState, useEffect } from 'react';
import { Mic2, Play, AlertCircle, CheckCircle, Loader2, ChevronRight, ChevronDown } from 'lucide-react';

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
  step?: string;
  prompt_slug?: string;
}

interface StepDetail {
  step: string;
  prompt_slug: string;
  prompt_version: string;
  model: string;
  inputs: Record<string, any>;
  config: Record<string, any>;
  timestamp: string;
}

interface SavedEvent {
  step: string;
  table: string;
  id: string;
  prompt_version: string;
  storage?: {
    image_url?: string;
    thumbnail_url?: string;
  };
  timestamp: string;
}

interface LogEntry {
  word: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message: string;
  step?: string;
  data?: any;
  pattern_id?: string;
  httpTraces: HttpTrace[];
  stepDetails: StepDetail[];
  savedEvents: SavedEvent[];
}

interface HistoryEntry {
  id: string;
  pattern_id?: string;
  word: string;
  created_at: string;
  has_trace: boolean;
}

function FormattedTraceViewer({ patternId, word }: { patternId: string; word: string }) {
  const [trace, setTrace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchTrace();
  }, [patternId]);

  const fetchTrace = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/pattern/${patternId}/trace`);
      if (res.ok) {
        const data = await res.json();
        setTrace(data);
      }
    } catch (error) {
      console.error('Failed to load trace:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (idx: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-teal-400" size={32} />
      </div>
    );
  }

  if (!trace || !trace.events) {
    return (
      <div className="text-center py-12 text-slate-600 italic border border-slate-800 border-dashed rounded-xl">
        No trace data available for this pattern.
      </div>
    );
  }

  // Group events by step
  const stepGroups: Record<string, { httpTrace?: any, stepDetail?: any, success?: any }> = {};
  trace.events.forEach((event: any) => {
    const step = event.step || event.http_trace?.step || 'unknown';
    if (!stepGroups[step]) stepGroups[step] = {};
    
    if (event.type === 'http_trace') {
      stepGroups[step].httpTrace = event.http_trace;
    } else if (event.type === 'step_detail') {
      stepGroups[step].stepDetail = event;
    } else if (event.type === 'success') {
      stepGroups[step].success = event;
    }
  });

  return (
    <div className="space-y-3">
      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-1">{word}</h3>
        <p className="text-xs text-slate-500">Generated: {new Date(trace.created_at).toLocaleString()}</p>
      </div>

      {Object.entries(stepGroups).map(([step, group], idx) => {
        const { stepDetail, httpTrace, success } = group;
        const isExpanded = expandedSteps.has(idx);

        return (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleStep(idx)}
              className="w-full flex items-center justify-between p-3 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-teal-400 uppercase">{step}</span>
                {httpTrace && (
                  <>
                    <span className="text-[10px] text-slate-500">|</span>
                    <span className="text-[10px] font-mono text-blue-400">{httpTrace.prompt_slug}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">{httpTrace.model}</span>
                  </>
                )}
              </div>
              {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
            </button>

            {isExpanded && (
              <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-950/50">
                {/* INPUT SECTION */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-xs text-blue-400 uppercase font-bold">Input</p>
                  </div>
                  
                  {httpTrace?.requestBody?.system_prompt && (
                    <div className="ml-4">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">System Prompt</p>
                      <div className="text-[11px] text-amber-300 bg-slate-900/80 p-3 rounded border border-amber-900/30 whitespace-pre-wrap">
                        {httpTrace.requestBody.system_prompt}
                      </div>
                    </div>
                  )}
                  
                  {httpTrace?.requestBody?.prompt_preview && (
                    <div className="ml-4">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">User Prompt</p>
                      <div className="text-[11px] text-blue-300 bg-slate-900/80 p-3 rounded border border-blue-900/30 whitespace-pre-wrap">
                        {httpTrace.requestBody.prompt_preview}
                      </div>
                    </div>
                  )}
                  
                  {httpTrace?.requestBody && (
                    <div className="ml-4">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Config</p>
                      <div className="text-[10px] text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800 font-mono">
                        <div><span className="text-slate-500">temperature:</span> {httpTrace.requestBody.temperature}</div>
                        <div><span className="text-slate-500">max_tokens:</span> {httpTrace.requestBody.max_tokens}</div>
                        <div><span className="text-slate-500">model:</span> {httpTrace.requestBody.model}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ARROW */}
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-blue-500 to-teal-500"></div>
                  <span className="text-slate-600">↓</span>
                </div>

                {/* OUTPUT SECTION */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <p className="text-xs text-teal-400 uppercase font-bold">Output</p>
                  </div>
                  
                  {success?.data?.content && (
                    <div className="ml-4">
                      <div className="text-[11px] text-teal-300 bg-slate-900/80 p-3 rounded border border-teal-900/30 whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {success.data.content}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function VoiceLab() {
  const [inputWords, setInputWords] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<HistoryEntry | null>(null);
  const [expandedHttpTraces, setExpandedHttpTraces] = useState<Set<number>>(new Set());
  const [collectTrace, setCollectTrace] = useState(true);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Auto-refresh selected log during processing
  useEffect(() => {
    if (!selectedLog || selectedLog.status !== 'processing') return;

    const interval = setInterval(() => {
      // Force re-render to show updated trace
      setSelectedLog(prev => prev ? { ...prev } : null);
    }, 500);

    return () => clearInterval(interval);
  }, [selectedLog?.status]);

  const fetchHistory = async () => {
    try {
      console.log('Fetching history...');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/generations/history?limit=50`);
      console.log('History response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('History data:', data);
        setHistory(data.patterns || []);
      } else {
        console.error('History fetch failed:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

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
      httpTraces: [],
      stepDetails: [],
      savedEvents: []
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
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/word/${word}/generate?collect_trace=${collectTrace}`;
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
                } else if (data.type === 'step_detail') {
                  // Capture detailed step information
                  const stepDetail: StepDetail = {
                    step: data.step,
                    prompt_slug: data.prompt_slug,
                    prompt_version: data.prompt_version,
                    model: data.model,
                    inputs: data.inputs,
                    config: data.config,
                    timestamp: new Date().toISOString()
                  };
                  log.stepDetails = [...log.stepDetails, stepDetail];
                  log.message = `Running ${data.prompt_slug} (v${data.prompt_version}) with ${data.model}`;
                } else if (data.type === 'saved') {
                  // Capture save confirmation
                  const savedEvent: SavedEvent = {
                    step: data.step,
                    table: data.table,
                    id: data.id,
                    prompt_version: data.prompt_version,
                    storage: data.storage,
                    timestamp: new Date().toISOString()
                  };
                  log.savedEvents = [...log.savedEvents, savedEvent];
                  log.message = `Saved to ${data.table} (id: ${data.id.slice(0, 8)}...)`;
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
                  log.pattern_id = data.pattern_id;
                  // Refresh history to show new generation
                  fetchHistory();
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
        <div className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            id="collectTrace"
            checked={collectTrace}
            onChange={(e) => setCollectTrace(e.target.checked)}
            className="w-4 h-4 text-teal-600 bg-slate-950 border-slate-700 rounded focus:ring-teal-500"
          />
          <label htmlFor="collectTrace" className="text-sm text-slate-400">
            Collect generation trace (for debugging)
          </label>
        </div>
        <button
          onClick={() => handleStart()}
          disabled={isProcessing}
          className="mt-4 w-full bg-teal-600 hover:bg-teal-500 text-white py-3 rounded font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
          {isProcessing ? 'Voicing...' : 'Start Generation'}
        </button>
      </div>

      {(logs.length > 0 || history.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            {logs.length > 0 && (
              <div className="space-y-3">
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
            )}
            
            {/* History Section */}
            {!isProcessing && history.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recent History</h2>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {history.slice(0, 20).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedHistory(item)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all text-sm ${
                        selectedHistory?.id === item.id ? 'border-teal-500 bg-teal-900/20' : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-sm">{item.word}</span>
                        {item.has_trace && (
                          <span className="text-[10px] px-2 py-0.5 bg-teal-900/50 text-teal-400 rounded">TRACE</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4 overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pipeline Trace</h2>
              {(selectedLog?.pattern_id || selectedHistory?.id) && (
                <button
                  onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/pattern/${selectedLog?.pattern_id || selectedHistory?.id}/trace`, '_blank')}
                  className="text-xs px-3 py-1.5 bg-teal-900/30 text-teal-400 border border-teal-900/50 rounded hover:bg-teal-900/50 transition-all"
                >
                  View Raw JSON
                </button>
              )}
            </div>
            {selectedLog ? (
              <div className="space-y-3">
                {/* Step-by-step timeline */}
                {selectedLog.stepDetails.map((detail, idx) => {
                  const savedEvent = selectedLog.savedEvents.find(s => s.step === detail.step);
                  // Find httpTrace by step name (most reliable) or prompt_slug
                  const httpTrace = selectedLog.httpTraces.find(t => 
                    t.step === detail.step || t.prompt_slug === detail.prompt_slug
                  );
                  
                  return (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleHttpTrace(idx)}
                        className="w-full flex items-center justify-between p-3 hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-teal-400 uppercase">{detail.step}</span>
                          <span className="text-[10px] text-slate-500">|</span>
                          <span className="text-[10px] font-mono text-blue-400">{detail.prompt_slug}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-purple-900/50 text-purple-300 rounded">v{detail.prompt_version}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">{detail.model}</span>
                          {savedEvent && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-green-900/50 text-green-300 rounded flex items-center gap-1">
                              <CheckCircle size={10} /> saved
                            </span>
                          )}
                        </div>
                        {expandedHttpTraces.has(idx) ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                      </button>
                      
                      {expandedHttpTraces.has(idx) && (
                        <div className="p-3 bg-black/40 border-t border-slate-800 space-y-3">
                          {/* Inputs */}
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Inputs</p>
                            <div className="space-y-1">
                              {Object.entries(detail.inputs).map(([key, value]) => (
                                <div key={key} className="text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                                  <span className="text-blue-400 font-mono">{key}:</span>
                                  <span className="text-slate-300 ml-2">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Config */}
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Config</p>
                            <pre className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto">
                              {JSON.stringify(detail.config, null, 2)}
                            </pre>
                          </div>
                          
                          {/* HTTP Request/Response */}
                          {httpTrace && (
                            <>
                              <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">API Call</p>
                                <div className="flex items-center gap-2 text-[11px] mb-2">
                                  <span className="font-mono text-blue-400">{httpTrace.method}</span>
                                  <span className={`font-mono font-bold ${getStatusColor(httpTrace.status)}`}>
                                    {httpTrace.status || 'PENDING'}
                                  </span>
                                  <span className="text-slate-500 font-mono truncate">{httpTrace.url}</span>
                                </div>
                                {httpTrace.requestBody && (
                                  <pre className="text-[11px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                                    {JSON.stringify(httpTrace.requestBody, null, 2)}
                                  </pre>
                                )}
                              </div>
                              {httpTrace.responseBody && (
                                <div>
                                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Response</p>
                                  <pre className="text-[11px] text-teal-400 bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                                    {JSON.stringify(httpTrace.responseBody, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Save confirmation */}
                          {savedEvent && (
                            <div className="p-2 bg-green-900/20 border border-green-900/50 rounded">
                              <p className="text-[10px] text-green-400 uppercase font-bold mb-1">Saved to Database</p>
                              <div className="text-[11px] text-green-300 font-mono">
                                <span className="text-slate-400">Table:</span> {savedEvent.table}
                                <span className="text-slate-400 ml-3">ID:</span> {savedEvent.id}
                                <span className="text-slate-400 ml-3">Version:</span> {savedEvent.prompt_version}
                              </div>
                              {savedEvent.storage && (
                                <div className="mt-2 text-[10px] text-slate-400">
                                  <a href={savedEvent.storage.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View Image</a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Show HTTP traces that don't have step details (like seed) */}
                {selectedLog.httpTraces.length > 0 && selectedLog.stepDetails.length === 0 && (
                  <div className="text-center py-8 text-slate-600 italic">
                    Processing... waiting for step details
                  </div>
                )}
                
                {selectedLog.stepDetails.length === 0 && selectedLog.httpTraces.length === 0 && (
                  <div className="text-center py-12 text-slate-600 italic border border-slate-800 border-dashed rounded-xl">
                    No traces available for this word yet.
                  </div>
                )}
              </div>
            ) : selectedHistory ? (
              <FormattedTraceViewer patternId={selectedHistory.id} word={selectedHistory.word} />
            ) : (
              <div className="text-center py-20 text-slate-600 italic border border-slate-800 border-dashed rounded-xl">
                Select a word from the queue or history to view its generation trace.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
