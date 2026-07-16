import type { ReactNode } from 'react';

import { AppNav, type AppTab } from './app-nav';

type AppShellProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  children: ReactNode;
};

export function AppShell({ activeTab, onTabChange, children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 flex items-baseline justify-between gap-6 border-b border-border bg-background px-5 pt-4 pb-3 md:px-8">
        <h1 className="m-0 text-[0.9375rem] font-medium tracking-tight">
          oefen
        </h1>
        <AppNav active={activeTab} onChange={onTabChange} />
      </header>
      {children}
    </div>
  );
}
