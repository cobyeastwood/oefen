import { useEffect, type ReactNode } from 'react';

import { AppNav, type AppTab } from './app-nav';

type AppShellProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  children: ReactNode;
};

/** Mobile keyboards scroll the document; pin layout so the header stays put. */
function usePinDocumentScroll() {
  useEffect(() => {
    const pin = () => {
      if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    pin();
    window.addEventListener('scroll', pin, { passive: true });
    document.addEventListener('focusin', pin);
    document.addEventListener('focusout', pin);

    const vv = window.visualViewport;
    vv?.addEventListener('scroll', pin);
    vv?.addEventListener('resize', pin);

    return () => {
      window.removeEventListener('scroll', pin);
      document.removeEventListener('focusin', pin);
      document.removeEventListener('focusout', pin);
      vv?.removeEventListener('scroll', pin);
      vv?.removeEventListener('resize', pin);
    };
  }, []);
}

export function AppShell({ activeTab, onTabChange, children }: AppShellProps) {
  usePinDocumentScroll();

  return (
    <div className="fixed inset-0 flex w-full max-w-full min-h-0 flex-col overflow-hidden bg-background">
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
