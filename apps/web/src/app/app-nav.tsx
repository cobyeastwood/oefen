import './app-nav.css';

export type AppTab = 'goal' | 'settings';

type AppNavProps = {
  active: AppTab;
  onChange: (tab: AppTab) => void;
};

export function AppNav({ active, onChange }: AppNavProps) {
  return (
    <nav className="nav" aria-label="Main">
      <button
        type="button"
        className={`nav__tab${active === 'goal' ? ' nav__tab--active' : ''}`}
        onClick={() => onChange('goal')}
      >
        Goal
      </button>
      <button
        type="button"
        className={`nav__tab${active === 'settings' ? ' nav__tab--active' : ''}`}
        onClick={() => onChange('settings')}
      >
        Settings
      </button>
    </nav>
  );
}
