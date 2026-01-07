import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  onSelectPattern: (pattern: any) => void;
}

export function Layout({ children, onSelectPattern }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar onSelect={onSelectPattern} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
