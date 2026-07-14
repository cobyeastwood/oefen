import { FormEvent, useEffect, useState } from 'react';

import { updateUser } from './api';
import './app.css';

type SettingsPageProps = {
  phoneE164: string | null;
  known: boolean;
  onSaved: (phoneE164: string | null) => void;
};

export function SettingsPage({ phoneE164, known, onSaved }: SettingsPageProps) {
  const [draft, setDraft] = useState(phoneE164 ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(phoneE164 ?? '');
  }, [phoneE164]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!known || isSaving) return;
    setError(null);
    setIsSaving(true);
    try {
      const result = await updateUser(draft.trim() || null);
      const next = result.user.phoneE164 ?? '';
      setDraft(next);
      onSaved(result.user.phoneE164);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save phone');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="page">
      <div className="page__inner">
        <header className="page__header">
          <h2 className="page__title">Settings</h2>
          <p className="page__lead">Phone for summary texts after each sync.</p>
        </header>

        {error ? <p className="page__error">{error}</p> : null}

        <form className="form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form__field">
            <label className="form__label" htmlFor="settings-phone">
              Phone number
            </label>
            <div className="form__controls">
              <input
                id="settings-phone"
                className="form__input form__input--phone"
                type="text"
                inputMode="tel"
                name="oefen-settings-phone"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="+15551234567"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
                spellCheck={false}
              />
              <button
                type="submit"
                className="form__btn form__btn--primary form__btn--inline"
                disabled={!known || isSaving}
              >
                {isSaving ? '…' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
