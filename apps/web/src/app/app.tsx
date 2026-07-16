import {
  DEFAULT_DEADLINE_MONTHS,
  DEFAULT_DISTANCE_PERIOD,
  DEFAULT_DISTANCE_PRESET_ID,
  DEFAULT_DISTANCE_UNIT,
  DEFAULT_GOAL_DISTANCE_M,
  DEFAULT_GOAL_TYPE,
  DEFAULT_VOLUME_DISTANCE,
  DEADLINE_MONTH_OPTIONS,
  distanceMFromGoalMetric,
  toMeters,
  distancePeriodFromMetric,
  DISTANCE_PERIODS,
  findPresetForDistanceM,
  formatGoalDeadlineLabel,
  formatGoalDistanceLabel,
  formatGoalTargetLabel,
  formatMmSs,
  getDistancePreset,
  GOAL_TYPES,
  goalTypeFromMetric,
  goalTypeLabel,
  monthsBetweenDeadlines,
  parseMmSs,
  presetToDistanceM,
  presetsForUnit,
  fromMeters,
  type DistancePeriod,
  type DistanceUnit,
  type GoalType,
} from '@oefen/shared/utils';
import { FormEvent, useEffect, useState } from 'react';

import { readAppCache, writeAppCache } from './app-cache';
import {
  getGoals,
  getUser,
  setGoal,
  updateUser,
  type Goal,
  type GoalRevision,
  type User,
} from './api';
import { AppShell } from './app-shell';
import type { AppTab } from './app-nav';
import { SettingsPage } from './settings-page';
import {
  affixClass,
  affixInputClass,
  affixLabelClass,
  buttonInlineClass,
  buttonPrimaryClass,
  cx,
  fieldClass,
  inputClass,
  labelClass,
  pageClass,
  pageErrorClass,
  pageHeaderClass,
  pageInnerWideClass,
  pageLeadClass,
  pageTitleClass,
  phoneControlsClass,
  phoneFieldClass,
  segmentClass,
  segmentFaceClass,
  segmentedFullClass,
  selectClass,
} from './ui';

function deadlineMonthsFromGoal(goal: {
  deadline: string | null;
  effectiveFrom?: string;
}): string {
  if (!goal.deadline) return String(DEFAULT_DEADLINE_MONTHS);
  const anchor = goal.effectiveFrom ? new Date(goal.effectiveFrom) : new Date();
  const months = monthsBetweenDeadlines(anchor, new Date(goal.deadline));
  return months != null ? String(months) : String(DEFAULT_DEADLINE_MONTHS);
}

type GoalFormState = {
  type: GoalType;
  period: DistancePeriod;
  targetTime: string;
  volumeDistance: string;
  distanceUnit: DistanceUnit;
  distancePresetId: string;
  deadlineMonths: string;
  note: string;
  revision: GoalRevision;
};

const DEFAULT_FORM: GoalFormState = {
  type: DEFAULT_GOAL_TYPE,
  period: DEFAULT_DISTANCE_PERIOD,
  targetTime: '25:00',
  volumeDistance: String(DEFAULT_VOLUME_DISTANCE),
  distanceUnit: DEFAULT_DISTANCE_UNIT,
  distancePresetId: DEFAULT_DISTANCE_PRESET_ID,
  deadlineMonths: String(DEFAULT_DEADLINE_MONTHS),
  note: '',
  revision: 'update',
};

function formStateFromGoal(
  goal: Goal | null,
  preferUnit: DistanceUnit = DEFAULT_DISTANCE_UNIT,
): GoalFormState {
  if (!goal) {
    return { ...DEFAULT_FORM, distanceUnit: preferUnit };
  }

  const type = goalTypeFromMetric(goal.targetMetric);
  const next: GoalFormState = {
    ...DEFAULT_FORM,
    type,
    period:
      distancePeriodFromMetric(goal.targetMetric) ?? DEFAULT_DISTANCE_PERIOD,
    distanceUnit: preferUnit,
    deadlineMonths: deadlineMonthsFromGoal(goal),
    note: goal.note ?? '',
    revision: 'update',
  };

  if (type === 'race_time') {
    next.targetTime = formatMmSs(goal.targetValue);
    const storedDistanceM =
      distanceMFromGoalMetric(goal.targetMetric) ?? DEFAULT_GOAL_DISTANCE_M;
    const match = findPresetForDistanceM(storedDistanceM);
    if (match) {
      next.distanceUnit = match.unit;
      next.distancePresetId = match.presetId;
    }
  } else {
    next.volumeDistance = String(
      fromMeters(preferUnit, goal.targetValue),
    );
  }

  return next;
}

const initialCache = typeof window !== 'undefined' ? readAppCache() : null;
const initialForm = formStateFromGoal(initialCache?.goals[0] ?? null);

export function App() {
  const [tab, setTab] = useState<AppTab>(initialCache?.tab ?? 'goal');
  const [goals, setGoals] = useState<Goal[]>(initialCache?.goals ?? []);
  const [phoneE164, setPhoneE164] = useState<string | null>(
    initialCache?.phoneE164 ?? null,
  );
  const [status, setStatus] = useState<User['status']>('active');
  const [known, setKnown] = useState(Boolean(initialCache));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [type, setType] = useState<GoalType>(initialForm.type);
  const [period, setPeriod] = useState<DistancePeriod>(initialForm.period);
  const [targetTime, setTargetTime] = useState(initialForm.targetTime);
  const [volumeDistance, setVolumeDistance] = useState(
    initialForm.volumeDistance,
  );
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>(
    initialForm.distanceUnit,
  );
  const [distancePresetId, setDistancePresetId] = useState(
    initialForm.distancePresetId,
  );
  const [deadlineMonths, setDeadlineMonths] = useState(
    initialForm.deadlineMonths,
  );
  const [note, setNote] = useState(initialForm.note);
  const [revision, setRevision] = useState<GoalRevision>(initialForm.revision);
  const [phone, setPhone] = useState(initialCache?.phoneE164 ?? '');
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  const activeGoal = goals[0] ?? null;
  const activeDeadline = activeGoal
    ? formatGoalDeadlineLabel(activeGoal.deadline)
    : null;
  const activeNote = activeGoal?.note?.trim() || null;
  const hasPhone = Boolean(phoneE164);
  const showPhoneSetup = known && !hasPhone;
  const isDistanceGoal = type === 'distance';

  function persistCache(next: {
    tab?: AppTab;
    goals?: Goal[];
    phoneE164?: string | null;
  }) {
    writeAppCache({
      tab: next.tab ?? tab,
      goals: next.goals ?? goals,
      phoneE164: next.phoneE164 !== undefined ? next.phoneE164 : phoneE164,
    });
  }

  function handleTabChange(nextTab: AppTab) {
    setTab(nextTab);
    persistCache({ tab: nextTab });
  }

  function applyFormState(next: GoalFormState) {
    setType(next.type);
    setPeriod(next.period);
    setTargetTime(next.targetTime);
    setVolumeDistance(next.volumeDistance);
    setDistanceUnit(next.distanceUnit);
    setDistancePresetId(next.distancePresetId);
    setDeadlineMonths(next.deadlineMonths);
    setNote(next.note);
    setRevision(next.revision);
  }

  function applySnapshot(
    nextGoals: Goal[],
    nextPhone: string | null,
    nextStatus: User['status'],
  ) {
    const nextGoal = nextGoals[0] ?? null;
    const prevGoal = goals[0] ?? null;
    setGoals(nextGoals);
    setPhoneE164(nextPhone);
    setPhone(nextPhone ?? '');
    setStatus(nextStatus);

    const goalChanged =
      prevGoal?.id !== nextGoal?.id ||
      prevGoal?.targetMetric !== nextGoal?.targetMetric ||
      prevGoal?.targetValue !== nextGoal?.targetValue ||
      prevGoal?.deadline !== nextGoal?.deadline ||
      prevGoal?.note !== nextGoal?.note;

    if (goalChanged) {
      applyFormState(formStateFromGoal(nextGoal, distanceUnit));
    }

    persistCache({ goals: nextGoals, phoneE164: nextPhone });
    setKnown(true);
  }

  async function refreshAll() {
    const [goalRes, userRes] = await Promise.all([getGoals(), getUser()]);
    applySnapshot(
      goalRes.goals.slice(0, 1),
      userRes.user.phoneE164,
      userRes.user.status,
    );
  }

  useEffect(() => {
    refreshAll().catch((err) => {
      setError(err.message);
      setKnown(true);
    });
  }, []);

  const selectedPreset = getDistancePreset(distancePresetId);
  const raceDistanceM = selectedPreset
    ? presetToDistanceM(selectedPreset)
    : DEFAULT_GOAL_DISTANCE_M;
  const distanceLabel = formatGoalDistanceLabel(raceDistanceM);
  const unitPresets = presetsForUnit(distanceUnit);
  const periodLabel =
    DISTANCE_PERIODS.find((item) => item.id === period)?.shortLabel ?? period;
  const submitLabel = !activeGoal
    ? 'Save goal'
    : revision === 'replace'
      ? 'Replace goal'
      : 'Update goal';

  function handleDistanceUnitChange(unit: DistanceUnit) {
    if (isDistanceGoal) {
      const currentMeters = toMeters(
        distanceUnit,
        Number(volumeDistance) || 0,
      );
      setVolumeDistance(String(fromMeters(unit, currentMeters)));
    }
    setDistanceUnit(unit);
    const firstPreset = presetsForUnit(unit)[0];
    if (firstPreset) {
      setDistancePresetId(firstPreset.id);
    }
  }

  async function handleGoalSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    let targetValue: number;
    let distanceM: number | undefined;

    if (type === 'race_time') {
      const parsed = parseMmSs(targetTime);
      if (parsed == null) {
        setError('Target time must be mm:ss');
        return;
      }
      targetValue = parsed;
      distanceM = raceDistanceM;
    } else {
      const amount = Number(volumeDistance);
      if (!Number.isFinite(amount) || amount <= 0) {
        setError(`Enter a distance greater than 0 ${distanceUnit}`);
        return;
      }
      targetValue = toMeters(distanceUnit, amount);
    }

    if (activeGoal && !revision) {
      setError('Choose whether to update or replace your current goal');
      return;
    }

    setIsSaving(true);
    try {
      await setGoal({
        type,
        period: type === 'distance' ? period : undefined,
        distanceM,
        targetValue,
        deadlineMonths: Number(deadlineMonths),
        note: note || null,
        revision: activeGoal ? revision : undefined,
      });
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal');
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePhoneSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSavingPhone(true);
    try {
      const result = await updateUser({ phoneE164: phone.trim() || null });
      setPhoneE164(result.user.phoneE164);
      setPhone(result.user.phoneE164 ?? '');
      persistCache({ phoneE164: result.user.phoneE164 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save phone');
    } finally {
      setIsSavingPhone(false);
    }
  }

  return (
    <AppShell activeTab={tab} onTabChange={handleTabChange}>
      <main className={pageClass} hidden={tab !== 'goal'}>
        <div className={pageInnerWideClass}>
          <div className="flex flex-col gap-5 md:grid md:grid-cols-[minmax(12rem,0.85fr)_minmax(0,1.15fr)] md:items-stretch md:gap-6">
            <header className={pageHeaderClass}>
              <h2 className={pageTitleClass}>Goal</h2>
              <p className={pageLeadClass}>Race time or distance target.</p>
            </header>

            <section
              className="min-w-0 rounded-xl border border-border bg-surface px-5 py-[1.125rem]"
              aria-live="polite"
            >
              <p className="m-0 text-[0.6875rem] font-medium tracking-[0.06em] text-muted uppercase">
                Current goal
              </p>
              {activeGoal ? (
                <>
                  <h3 className="mt-1.5 mb-0 text-xl font-medium leading-snug tracking-tight [overflow-wrap:anywhere]">
                    {goalTypeLabel(goalTypeFromMetric(activeGoal.targetMetric))}
                  </h3>
                  <dl className="mt-3.5 mb-0 flex min-w-0 flex-col gap-2 p-0">
                    <div className="grid min-w-0 grid-cols-[4.75rem_minmax(0,1fr)] items-start gap-3">
                      <dt className="m-0 text-xs leading-snug text-muted">
                        Target
                      </dt>
                      <dd className="m-0 min-w-0 break-words text-sm leading-snug">
                        {formatGoalTargetLabel(activeGoal, distanceUnit)}
                      </dd>
                    </div>
                    {activeDeadline ? (
                      <div className="grid min-w-0 grid-cols-[4.75rem_minmax(0,1fr)] items-start gap-3">
                        <dt className="m-0 text-xs leading-snug text-muted">
                          Deadline
                        </dt>
                        <dd className="m-0 min-w-0 break-words text-sm leading-snug">
                          {activeDeadline}
                        </dd>
                      </div>
                    ) : null}
                    {activeNote ? (
                      <div className="grid min-w-0 grid-cols-[4.75rem_minmax(0,1fr)] items-start gap-3">
                        <dt className="m-0 text-xs leading-snug text-muted">
                          Note
                        </dt>
                        <dd className="m-0 min-w-0 break-words text-sm leading-snug text-muted">
                          {activeNote}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </>
              ) : (
                <>
                  <h3 className="mt-1.5 mb-0 text-xl font-medium leading-snug tracking-tight">
                    None set
                  </h3>
                  <p className="mt-2 mb-0 text-sm leading-snug text-muted">
                    Choose a type and target below.
                  </p>
                </>
              )}
            </section>
          </div>

          {error ? <p className={pageErrorClass}>{error}</p> : null}

          {known && status !== 'active' ? (
            <p className={pageErrorClass}>
              Account deactivated — Garmin sync and summary texts are off.
              Reactivate in Settings.
            </p>
          ) : null}

          <form
            className="flex flex-col gap-5 md:grid md:grid-cols-12 md:items-start md:gap-x-4 md:gap-y-5"
            onSubmit={handleGoalSubmit}
          >
            <div className={cx(fieldClass, 'md:col-span-6')}>
              <span className={labelClass}>Type</span>
              <div className={segmentedFullClass}>
                {GOAL_TYPES.map((item) => (
                  <label key={item.id} className={segmentClass}>
                    <input
                      className="peer absolute opacity-0 pointer-events-none"
                      type="radio"
                      name="goal-type"
                      value={item.id}
                      checked={type === item.id}
                      onChange={() => setType(item.id)}
                    />
                    <span className={segmentFaceClass}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={cx(fieldClass, 'md:col-span-3')}>
              <span className={labelClass}>Unit</span>
              <div className={segmentedFullClass}>
                <label className={segmentClass}>
                  <input
                    className="peer absolute opacity-0 pointer-events-none"
                    type="radio"
                    name="distance-unit"
                    value="km"
                    checked={distanceUnit === 'km'}
                    onChange={() => handleDistanceUnitChange('km')}
                  />
                  <span className={segmentFaceClass}>km</span>
                </label>
                <label className={segmentClass}>
                  <input
                    className="peer absolute opacity-0 pointer-events-none"
                    type="radio"
                    name="distance-unit"
                    value="mi"
                    checked={distanceUnit === 'mi'}
                    onChange={() => handleDistanceUnitChange('mi')}
                  />
                  <span className={segmentFaceClass}>mi</span>
                </label>
              </div>
            </div>

            <div
              className={cx(
                fieldClass,
                'md:col-span-3',
                !activeGoal && 'pointer-events-none opacity-45',
              )}
            >
              <span className={labelClass}>Save as</span>
              <div className={segmentedFullClass}>
                <label className={segmentClass}>
                  <input
                    className="peer absolute opacity-0 pointer-events-none"
                    type="radio"
                    name="revision"
                    value="update"
                    checked={revision === 'update'}
                    onChange={() => setRevision('update')}
                    disabled={!activeGoal}
                    required={Boolean(activeGoal)}
                  />
                  <span className={segmentFaceClass}>Update</span>
                </label>
                <label className={segmentClass}>
                  <input
                    className="peer absolute opacity-0 pointer-events-none"
                    type="radio"
                    name="revision"
                    value="replace"
                    checked={revision === 'replace'}
                    onChange={() => setRevision('replace')}
                    disabled={!activeGoal}
                  />
                  <span className={segmentFaceClass}>Replace</span>
                </label>
              </div>
            </div>

            {type === 'race_time' ? (
              <>
                <div className={cx(fieldClass, 'md:col-span-6')}>
                  <label className={labelClass} htmlFor="distance-value">
                    Distance
                  </label>
                  <select
                    id="distance-value"
                    className={selectClass}
                    value={distancePresetId}
                    onChange={(e) => setDistancePresetId(e.target.value)}
                    required
                  >
                    {unitPresets.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={cx(fieldClass, 'md:col-span-6')}>
                  <label className={labelClass} htmlFor="target-time">
                    Target time
                  </label>
                  <input
                    id="target-time"
                    className={inputClass}
                    value={targetTime}
                    onChange={(e) => setTargetTime(e.target.value)}
                    placeholder={`mm:ss · ${distanceLabel}`}
                    inputMode="numeric"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className={cx(fieldClass, 'md:col-span-4')}>
                  <label className={labelClass} htmlFor="distance-period">
                    Timeframe
                  </label>
                  <select
                    id="distance-period"
                    className={selectClass}
                    value={period}
                    onChange={(e) =>
                      setPeriod(e.target.value as DistancePeriod)
                    }
                    required
                  >
                    {DISTANCE_PERIODS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={cx(fieldClass, 'md:col-span-8')}>
                  <label className={labelClass} htmlFor="distance-value">
                    Target distance
                  </label>
                  <div className={affixClass}>
                    <input
                      id="distance-value"
                      className={affixInputClass}
                      type="number"
                      min="1"
                      step="0.1"
                      value={volumeDistance}
                      onChange={(e) => setVolumeDistance(e.target.value)}
                      placeholder={String(DEFAULT_VOLUME_DISTANCE)}
                      inputMode="decimal"
                      required
                    />
                    <span className={affixLabelClass}>
                      {distanceUnit}/{periodLabel}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className={cx(fieldClass, 'md:col-span-4')}>
              <label className={labelClass} htmlFor="deadline-months">
                Deadline
              </label>
              <select
                id="deadline-months"
                className={selectClass}
                value={deadlineMonths}
                onChange={(e) => setDeadlineMonths(e.target.value)}
              >
                {DEADLINE_MONTH_OPTIONS.map((option) => (
                  <option key={option.months} value={option.months}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={cx(fieldClass, 'md:col-span-8')}>
              <label className={labelClass} htmlFor="note">
                Note
              </label>
              <input
                id="note"
                className={inputClass}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="col-span-full mt-0.5 flex min-h-control md:justify-end">
              <button
                type="submit"
                className={cx(buttonPrimaryClass, 'w-full md:w-auto')}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : submitLabel}
              </button>
            </div>
          </form>

          {showPhoneSetup ? (
            <section className="flex min-h-[5.75rem] flex-col gap-3.5 border-t border-border pt-5">
              <p className="m-0 text-[0.8125rem] leading-snug text-muted">
                Add a phone number to get summary texts after sync.
              </p>
              <form
                className="flex flex-col gap-3"
                onSubmit={handlePhoneSubmit}
              >
                <div className={phoneControlsClass}>
                  <div className={phoneFieldClass}>
                    <input
                      id="phone"
                      className={cx(inputClass, 'ui-input-phone')}
                      type="text"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+15551234567"
                      autoComplete="one-time-code"
                      data-1p-ignore
                      data-lpignore="true"
                      data-bwignore="true"
                      data-form-type="other"
                      required
                      aria-label="Phone number"
                    />
                  </div>
                  <button
                    type="submit"
                    className={cx(buttonPrimaryClass, buttonInlineClass)}
                    disabled={isSavingPhone}
                  >
                    {isSavingPhone ? '…' : 'Save'}
                  </button>
                </div>
              </form>
            </section>
          ) : null}
        </div>
      </main>

      <div
        className={cx(
          'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
          tab !== 'settings' && 'hidden',
        )}
      >
        <SettingsPage
          phoneE164={phoneE164}
          status={status}
          known={known}
          onSaved={(nextPhone) => {
            setPhoneE164(nextPhone);
            setPhone(nextPhone ?? '');
            persistCache({ phoneE164: nextPhone });
          }}
          onStatusChange={setStatus}
        />
      </div>
    </AppShell>
  );
}

export default App;
