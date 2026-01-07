export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">System overview and quick actions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="text-slate-400 text-sm mb-2">Total Patterns</div>
          <div className="text-3xl font-bold text-white">—</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="text-slate-400 text-sm mb-2">Active Prompts</div>
          <div className="text-3xl font-bold text-white">—</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="text-slate-400 text-sm mb-2">Complete Patterns</div>
          <div className="text-3xl font-bold text-white">—</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="text-slate-400 text-sm mb-2">System Status</div>
          <div className="text-lg font-bold text-teal-400">Operational</div>
        </div>
      </div>

      <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/admin/library" 
            className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
          >
            <div className="font-medium text-white">View Library</div>
            <div className="text-sm text-slate-400 mt-1">Browse all patterns</div>
          </a>
          <a 
            href="/admin/prompts" 
            className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
          >
            <div className="font-medium text-white">Edit Prompts</div>
            <div className="text-sm text-slate-400 mt-1">Manage prompt versions</div>
          </a>
          <a 
            href="/admin/voice" 
            className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
          >
            <div className="font-medium text-white">Voice Lab</div>
            <div className="text-sm text-slate-400 mt-1">Test pattern generation</div>
          </a>
        </div>
      </div>
    </div>
  );
}
