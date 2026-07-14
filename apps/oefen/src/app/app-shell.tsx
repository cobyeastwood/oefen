import type { ReactNode } from 'react';

import { AppNav, type AppTab } from './app-nav';
import './app-shell.css';

type AppShellProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  children: ReactNode;
};

export function AppShell({ activeTab, onTabChange, children }: AppShellProps) {
  return (
    <div className="shell">
      <header className="shell__header">
        <h1 className="shell__brand">oefen</h1>
        <AppNav active={activeTab} onChange={onTabChange} />
      </header>
      <div className="shell__content">{children}</div>
    </div>
  );
}
