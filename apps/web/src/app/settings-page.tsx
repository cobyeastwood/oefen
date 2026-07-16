import { FormEvent, useEffect, useState } from 'react';

import { updateUser, type User } from './api';
import {
  buttonClass,
  buttonInlineClass,
  buttonPrimaryClass,
  cx,
  fieldClass,
  inputClass,
  labelClass,
  pageClass,
  pageErrorClass,
  pageHeaderClass,
  pageInnerClass,
  pageLeadClass,
  pageTitleClass,
  phoneControlsClass,
  phoneFieldClass,
} from './ui';

type SettingsPageProps = {
  phoneE164: string | null;
  status: User['status'];
  known: boolean;
  onSaved: (phoneE164: string | null) => void;
  onStatusChange: (status: User['status']) => void;
};

export function SettingsPage({
  phoneE164,
  status,
  known,
  onSaved,
  onStatusChange,
}: SettingsPageProps) {
  const [draft, setDraft] = useState(phoneE164 ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const isActive = status === 'active';
  const phoneUnchanged =
    (draft.trim() || null) === (phoneE164?.trim() || null);
  const canSavePhone = known && !isSaving && !phoneUnchanged;

  useEffect(() => {
    setDraft(phoneE164 ?? '');
  }, [phoneE164]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSavePhone) return;
    setError(null);
    setIsSaving(true);
    try {
      const result = await updateUser({ phoneE164: draft.trim() || null });
      const next = result.user.phoneE164 ?? '';
      setDraft(next);
      onSaved(result.user.phoneE164);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save phone');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!known || isUpdatingStatus) return;
    const confirmed = window.confirm(
      'Deactivate your account? Garmin sync and summary texts will stop until you reactivate.',
    );
    if (!confirmed) return;

    setError(null);
    setIsUpdatingStatus(true);
    try {
      const result = await updateUser({ status: 'disabled' });
      onStatusChange(result.user.status);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to deactivate account',
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleReactivate() {
    if (!known || isUpdatingStatus) return;
    setError(null);
    setIsUpdatingStatus(true);
    try {
      const result = await updateUser({ status: 'active' });
      onStatusChange(result.user.status);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to reactivate account',
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <main className={pageClass}>
      <div className={pageInnerClass}>
        <header className={pageHeaderClass}>
          <h2 className={pageTitleClass}>Settings</h2>
          <p className={pageLeadClass}>
            Phone for summary texts after each sync.
          </p>
        </header>

        {error ? <p className={pageErrorClass}>{error}</p> : null}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} autoComplete="off">
          <div className={fieldClass}>
            <label className={labelClass} htmlFor="settings-phone">
              Phone number
            </label>
            <div className={phoneControlsClass}>
              <div className={phoneFieldClass}>
                <input
                  id="settings-phone"
                  className={cx(inputClass, 'ui-input-phone')}
                  type="text"
                  inputMode="tel"
                  name="oefen-settings-phone"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="+15551234567"
                  autoComplete="one-time-code"
                  autoCorrect="off"
                  autoCapitalize="off"
                  data-1p-ignore
                  data-lpignore="true"
                  data-bwignore="true"
                  data-form-type="other"
                  spellCheck={false}
                />
              </div>
              <button
                type="submit"
                className={cx(buttonPrimaryClass, buttonInlineClass)}
                disabled={!canSavePhone}
              >
                {isSaving ? '…' : 'Save'}
              </button>
            </div>
          </div>
        </form>

        <section
          className="flex flex-col items-start gap-3.5 border-t border-border pt-5"
          aria-labelledby="account-heading"
        >
          <div className="flex flex-col gap-1.5">
            <h3
              id="account-heading"
              className="m-0 text-sm font-medium leading-snug tracking-tight"
            >
              Account
            </h3>
            <p className="m-0 text-[0.8125rem] leading-snug text-muted">
              {isActive
                ? 'Deactivating stops Garmin sync and summary texts.'
                : 'Your account is deactivated. Sync and summary texts are off.'}
            </p>
          </div>
          {isActive ? (
            <button
              type="button"
              className={buttonClass}
              disabled={!known || isUpdatingStatus}
              onClick={() => void handleDeactivate()}
            >
              {isUpdatingStatus ? '…' : 'Deactivate'}
            </button>
          ) : (
            <button
              type="button"
              className={buttonPrimaryClass}
              disabled={!known || isUpdatingStatus}
              onClick={() => void handleReactivate()}
            >
              {isUpdatingStatus ? '…' : 'Reactivate'}
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
