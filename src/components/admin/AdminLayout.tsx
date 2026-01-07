import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Grid, 
  Play, 
  Mic2, 
  Image as ImageIcon, 
  Menu, 
  X 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Library', href: '/admin/library', icon: Grid },
  { name: 'Prompts', href: '/admin/prompts', icon: FileText },
  { name: 'Voice Lab', href: '/admin/voice', icon: Mic2 },
  { name: 'Brief Lab', href: '/admin/test-brief', icon: FileText },
  { name: 'Image Lab', href: '/admin/test-image', icon: ImageIcon },
  { name: 'Playground', href: '/admin/playground', icon: Play },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-serif font-bold text-white">
            Patterning<span className="text-teal-500">Ops</span>
          </h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar (Desktop: Fixed, Mobile: Overlay) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 p-6 flex flex-col transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:bg-slate-900/50 md:backdrop-blur-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-8 hidden md:block">
          <h1 className="text-xl font-serif font-bold text-white">
            Patterning<span className="text-teal-500">Ops</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Admin Console</p>
        </div>

        {/* Mobile Close Button */}
        <div className="md:hidden mb-6 flex justify-between items-center">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2 flex-grow">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link 
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                  active 
                    ? 'bg-teal-500/10 text-teal-400 font-medium' 
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-black font-bold text-xs">
              AD
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">Admin User</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile when menu is open */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
