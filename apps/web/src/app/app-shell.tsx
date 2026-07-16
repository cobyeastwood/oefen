import type { ReactNode } from 'react';

import { AppNav, type AppTab } from './app-nav';

type AppShellProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  children: ReactNode;
};

export function AppShell({ activeTab, onTabChange, children }: AppShellProps) {
  return (
    <div className="flex h-full w-full max-w-full min-h-0 flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-baseline justify-between gap-6 border-b border-border px-5 pt-4 pb-3 md:px-8">
        <h1 className="m-0 text-[0.9375rem] font-medium tracking-tight">
          oefen
        </h1>
        <AppNav active={activeTab} onChange={onTabChange} />
      </header>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
