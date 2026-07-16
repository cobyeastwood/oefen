import { cx } from './ui';

export type AppTab = 'goal' | 'settings';

type AppNavProps = {
  active: AppTab;
  onChange: (tab: AppTab) => void;
};

export function AppNav({ active, onChange }: AppNavProps) {
  return (
    <nav className="flex items-center gap-5" aria-label="Main">
      {(
        [
          ['goal', 'Goal'],
          ['settings', 'Settings'],
        ] as const
      ).map(([tab, label]) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            className={cx(
              'cursor-pointer border-x-0 border-t-0 border-b bg-transparent p-0 pb-1 text-sm leading-none',
              'transition-colors duration-150',
              isActive
                ? 'border-foreground font-medium text-foreground'
                : 'border-transparent text-muted hover:text-foreground',
            )}
            onClick={() => onChange(tab)}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
