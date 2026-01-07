import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  onSelectPattern: (pattern: any) => void;
  onViewChange: (view: 'patterns' | 'prompts') => void;
}

export function Layout({ children, onSelectPattern, onViewChange }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar onSelect={onSelectPattern} onViewChange={onViewChange} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
