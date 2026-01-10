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
  // Track progress for parallel execution
  verbalTrack?: {
    status: 'pending' | 'processing' | 'complete' | 'error';
    step?: string;
    message?: string;
  };
  visualTrack?: {
    status: 'pending' | 'processing' | 'complete' | 'error';
    step?: string;
    message?: string;
  };
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
        const { httpTrace, success } = group;
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
  const [activeTab, setActiveTab] = useState<'generator' | 'analytics'>('generator');
  const [inputWords, setInputWords] = useState('');
  const [trackSelection, setTrackSelection] = useState<'verbal' | 'visual' | 'both'>('both');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<HistoryEntry | null>(null);
  const [expandedHttpTraces, setExpandedHttpTraces] = useState<Set<number>>(new Set());
  const [collectTrace, setCollectTrace] = useState(true);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [expandedRuns, setExpandedRuns] = useState<Set<number>>(new Set());

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Load analytics when switching to analytics tab
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  // Auto-refresh selected log during processing
  useEffect(() => {
    if (!selectedLog || selectedLog.status !== 'processing') return;

    const interval = setInterval(() => {
      // Force re-render to show updated trace
      setSelectedLog(prev => prev ? { ...prev } : null);
    }, 500);

    return () => clearInterval(interval);
  }, [selectedLog?.status]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/analytics/pattern-runs/summary`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAnalyticsSummary(data.summary);
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

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
      savedEvents: [],
      // Initialize track states for parallel execution
      ...(trackSelection === 'both' ? {
        verbalTrack: { status: 'pending' as const, message: 'Waiting...' },
        visualTrack: { status: 'pending' as const, message: 'Waiting...' }
      } : {})
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
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/word/${word}/generate?collect_trace=${collectTrace}&track=${trackSelection}`;
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
                  
                  // Track verbal and visual steps separately for parallel execution
                  const verbalSteps = ['verbal_layer', 'verbal_voicing', 'verbal_essence'];
                  const visualSteps = ['visual_layer', 'visual_brief', 'image'];
                  
                  if (verbalSteps.includes(data.step)) {
                    log.verbalTrack = {
                      status: 'processing',
                      step: data.step,
                      message: data.message
                    };
                  } else if (visualSteps.includes(data.step)) {
                    log.visualTrack = {
                      status: 'processing',
                      step: data.step,
                      message: data.message
                    };
                  }
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
                  
                  // Mark track as complete
                  const verbalSteps = ['verbal_layer', 'verbal_voicing', 'verbal_essence'];
                  const visualSteps = ['visual_layer', 'visual_brief', 'image'];
                  
                  if (verbalSteps.includes(data.step) && log.verbalTrack) {
                    log.verbalTrack.status = 'complete';
                  } else if (visualSteps.includes(data.step) && log.visualTrack) {
                    log.visualTrack.status = 'complete';
                  }
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
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'generator'
                ? 'text-teal-400 border-b-2 border-teal-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Generator
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'text-teal-400 border-b-2 border-teal-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Generator Tab */}
      {activeTab === 'generator' && (
      <>
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-6">
        <textarea
          value={inputWords}
          onChange={(e) => setInputWords(e.target.value)}
          placeholder="Enter words to voice..."
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-white font-mono text-sm focus:border-teal-500 outline-none"
        />
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">Generation Track</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="track"
                  value="verbal"
                  checked={trackSelection === 'verbal'}
                  onChange={(e) => setTrackSelection(e.target.value as 'verbal')}
                  className="w-4 h-4 text-teal-600 bg-slate-950 border-slate-700 focus:ring-teal-500"
                />
                <span className="text-sm text-slate-300">Verbal Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="track"
                  value="visual"
                  checked={trackSelection === 'visual'}
                  onChange={(e) => setTrackSelection(e.target.value as 'visual')}
                  className="w-4 h-4 text-teal-600 bg-slate-950 border-slate-700 focus:ring-teal-500"
                />
                <span className="text-sm text-slate-300">Visual Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="track"
                  value="both"
                  checked={trackSelection === 'both'}
                  onChange={(e) => setTrackSelection(e.target.value as 'both')}
                  className="w-4 h-4 text-teal-600 bg-slate-950 border-slate-700 focus:ring-teal-500"
                />
                <span className="text-sm text-slate-300">Both (Parallel)</span>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
                
                {/* Show dual tracks if both are present */}
                {log.verbalTrack && log.visualTrack ? (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-purple-400 uppercase">Verbal:</span>
                      {log.verbalTrack.status === 'processing' && <Loader2 className="text-purple-400 animate-spin" size={10} />}
                      {log.verbalTrack.status === 'complete' && <CheckCircle className="text-green-400" size={10} />}
                      <span className="text-xs text-slate-400 truncate flex-1">{log.verbalTrack.message || log.verbalTrack.step}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-cyan-400 uppercase">Visual:</span>
                      {log.visualTrack.status === 'processing' && <Loader2 className="text-cyan-400 animate-spin" size={10} />}
                      {log.visualTrack.status === 'complete' && <CheckCircle className="text-green-400" size={10} />}
                      <span className="text-xs text-slate-400 truncate flex-1">{log.visualTrack.message || log.visualTrack.step}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 truncate">{log.message}</p>
                )}
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
      </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analyticsLoading ? (
            <div className="text-center py-12 text-slate-400">Loading analytics...</div>
          ) : analyticsSummary ? (
            <>
              {/* Pricing Reference */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Model Pricing Reference</h2>
                  <div className="flex gap-3 text-sm">
                    <a href="https://platform.claude.com/docs/en/about-claude/pricing" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline">
                      Claude Pricing →
                    </a>
                    <a href="https://ai.google.dev/gemini-api/docs/pricing" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline">
                      Gemini Pricing →
                    </a>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Model</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Input (per 1M tokens)</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Output (per 1M tokens)</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Per Image</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr className="hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-mono text-sm text-white">claude-sonnet-4-5-20250929</td>
                        <td className="px-4 py-3 text-sm text-slate-400">Text</td>
                        <td className="px-4 py-3 text-sm text-green-400">$3.00</td>
                        <td className="px-4 py-3 text-sm text-green-400">$15.00</td>
                        <td className="px-4 py-3 text-sm text-slate-600">—</td>
                      </tr>
                      <tr className="hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-mono text-sm text-white">gemini-3-pro-image-preview</td>
                        <td className="px-4 py-3 text-sm text-slate-400">Image</td>
                        <td className="px-4 py-3 text-sm text-yellow-400">$2.00</td>
                        <td className="px-4 py-3 text-sm text-yellow-400">$120.00 (images)</td>
                        <td className="px-4 py-3 text-sm text-yellow-400">~$0.134-0.24/image</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
                  <div className="text-sm text-slate-400 mb-2">Parallel Runs</div>
                  <div className="text-3xl font-bold text-teal-400">{analyticsSummary.parallel_runs.count}</div>
                  <div className="text-sm text-slate-500 mt-2">
                    Avg Speedup: <span className="text-teal-400 font-semibold">{analyticsSummary.parallel_runs.avg_speedup.toFixed(2)}x</span>
                  </div>
                  <div className="text-sm text-slate-500">
                    Avg Duration: {(analyticsSummary.parallel_runs.avg_duration_ms / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-slate-500">
                    Avg Cost: ${analyticsSummary.parallel_runs.avg_cost.toFixed(4)}
                  </div>
                </div>
                
                <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
                  <div className="text-sm text-slate-400 mb-2">Verbal Only Runs</div>
                  <div className="text-3xl font-bold text-purple-400">{analyticsSummary.verbal_only_runs.count}</div>
                  <div className="text-sm text-slate-500 mt-2">
                    Avg Duration: {(analyticsSummary.verbal_only_runs.avg_duration_ms / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-slate-500">
                    Avg Cost: ${analyticsSummary.verbal_only_runs.avg_cost.toFixed(4)}
                  </div>
                </div>
                
                <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
                  <div className="text-sm text-slate-400 mb-2">Visual Only Runs</div>
                  <div className="text-3xl font-bold text-cyan-400">{analyticsSummary.visual_only_runs.count}</div>
                  <div className="text-sm text-slate-500 mt-2">
                    Avg Duration: {(analyticsSummary.visual_only_runs.avg_duration_ms / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-slate-500">
                    Avg Cost: ${analyticsSummary.visual_only_runs.avg_cost.toFixed(4)}
                  </div>
                </div>
              </div>

              {/* Recent Parallel Runs */}
              {analyticsSummary.parallel_runs.runs.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-white">Recent Parallel Runs</h2>
                  <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Word</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Verbal</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Visual</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Parallel</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Speedup</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {analyticsSummary.parallel_runs.runs.map((run: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-800/50">
                            <td className="px-4 py-3 font-semibold text-white">{run.word}</td>
                            <td className="px-4 py-3 text-purple-400">{(run.verbal_track_ms / 1000).toFixed(1)}s</td>
                            <td className="px-4 py-3 text-cyan-400">{(run.visual_track_ms / 1000).toFixed(1)}s</td>
                            <td className="px-4 py-3 text-teal-400">{(run.actual_parallel_ms / 1000).toFixed(1)}s</td>
                            <td className="px-4 py-3 text-green-400 font-semibold">{run.speedup.toFixed(2)}x</td>
                            <td className="px-4 py-3 text-white">${run.total_cost.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* All Recent Runs with Per-Step Breakdown */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-white">All Recent Runs</h2>
                <div className="space-y-3">
                  {[...analyticsSummary.parallel_runs.runs, ...analyticsSummary.verbal_only_runs.runs, ...analyticsSummary.visual_only_runs.runs]
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 10)
                    .map((run: any, idx: number) => {
                      const steps = run.steps || [];
                      const isExpanded = expandedRuns.has(idx);
                      
                      const toggleExpanded = () => {
                        setExpandedRuns(prev => {
                          const next = new Set(prev);
                          if (next.has(idx)) {
                            next.delete(idx);
                          } else {
                            next.add(idx);
                          }
                          return next;
                        });
                      };
                      
                      return (
                        <div key={idx} className="bg-slate-900 rounded-lg border border-slate-800">
                          <div 
                            className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                            onClick={toggleExpanded}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                                <span className="font-bold text-white">{run.word}</span>
                                <span className="text-sm text-slate-400">{new Date(run.created_at).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-6">
                                <span className="text-sm text-slate-400">Duration: <span className="text-teal-400 font-semibold">{(run.duration_ms / 1000).toFixed(1)}s</span></span>
                                <span className="text-sm text-slate-400">Cost: <span className="text-green-400 font-semibold">${run.total_cost.toFixed(4)}</span></span>
                                <span className="text-sm text-slate-400">Tokens: <span className="text-white">{run.total_tokens || 0}</span></span>
                              </div>
                            </div>
                          </div>
                          
                          {isExpanded && steps.length > 0 && (
                            <div className="border-t border-slate-800 p-4">
                              <h3 className="text-sm font-semibold text-slate-300 mb-3">Per-Step Breakdown</h3>
                              <div className="bg-slate-950 rounded border border-slate-800 overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-slate-800">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">Step</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">Model</th>
                                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-300">Input Tokens</th>
                                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-300">Output Tokens</th>
                                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-300">Cost</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800">
                                    {steps.map((step: any, stepIdx: number) => (
                                      <tr key={stepIdx} className="hover:bg-slate-800/30">
                                        <td className="px-3 py-2 text-white font-mono">{step.step}</td>
                                        <td className="px-3 py-2 text-slate-400 font-mono text-xs">{step.model}</td>
                                        <td className="px-3 py-2 text-right text-slate-300">{step.tokens?.input || 0}</td>
                                        <td className="px-3 py-2 text-right text-slate-300">{step.tokens?.output || 0}</td>
                                        <td className="px-3 py-2 text-right text-green-400 font-semibold">${(step.cost?.total || 0).toFixed(4)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="bg-slate-800">
                                    <tr>
                                      <td colSpan={2} className="px-3 py-2 text-left text-xs font-semibold text-slate-300">Total</td>
                                      <td className="px-3 py-2 text-right text-white font-semibold">{run.total_input_tokens || 0}</td>
                                      <td className="px-3 py-2 text-right text-white font-semibold">{run.total_output_tokens || 0}</td>
                                      <td className="px-3 py-2 text-right text-green-400 font-bold">${run.total_cost.toFixed(4)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">No analytics data available yet</div>
          )}
        </div>
      )}
    </div>
  );
}
