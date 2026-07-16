/** Shared Tailwind class strings for recurring UI primitives. */

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export const pageClass =
  'flex min-h-0 min-w-0 flex-1 justify-center overflow-x-hidden overflow-y-auto overscroll-y-contain px-5 py-7 touch-pan-y md:px-8 md:py-8';

export const pageInnerClass =
  'flex w-full min-w-0 max-w-[26rem] flex-col gap-6';

export const pageInnerWideClass =
  'flex w-full min-w-0 max-w-[26rem] flex-col gap-6 md:max-w-[52rem] lg:max-w-[56rem]';

export const pageHeaderClass = 'flex flex-col justify-center gap-1.5';

export const pageTitleClass =
  'm-0 text-2xl font-medium leading-tight tracking-tight';

export const pageLeadClass = 'm-0 text-[0.9375rem] leading-snug text-muted';

export const pageErrorClass =
  'm-0 rounded-lg border border-border bg-surface px-3.5 py-3 text-[0.8125rem] text-foreground';

export const labelClass =
  'block min-h-4 text-xs leading-4 tracking-wide text-muted';

export const fieldClass = 'flex w-full min-w-0 flex-col gap-2';

export const inputClass = cx(
  'ui-input box-border h-control w-full min-w-0 rounded-lg border border-border bg-background',
  'px-3.5 text-[0.9375rem] leading-tight text-foreground',
  'focus:border-ring focus:outline-none focus:shadow-[0_0_0_3px_rgb(0_0_0_/0.04)]',
  'disabled:cursor-not-allowed disabled:text-muted disabled:opacity-55',
);

export const selectClass = cx(inputClass, 'ui-select');

export const buttonClass = cx(
  'box-border inline-flex h-control cursor-pointer items-center justify-center',
  'rounded-lg border border-border bg-background px-5 text-sm leading-none text-foreground',
  'transition-[background,border-color,opacity] duration-150',
  'hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50',
);

export const buttonPrimaryClass = cx(
  'box-border inline-flex h-control cursor-pointer items-center justify-center',
  'rounded-lg border border-foreground bg-foreground px-5 text-sm leading-none text-background',
  'transition-[background,border-color,opacity] duration-150',
  'hover:opacity-88 disabled:cursor-not-allowed disabled:opacity-50',
);

export const buttonInlineClass = 'w-[4.5rem] shrink-0';

/** Isolates phone inputs from autofill/extension icons that steal flex space. */
export const phoneFieldClass =
  'ui-phone-field relative h-control min-h-control min-w-0 flex-1 overflow-hidden';

export const phoneControlsClass =
  'ui-phone-controls flex h-control min-h-control w-full min-w-0 items-center gap-3';

export const segmentedClass = cx(
  'box-border inline-flex h-control items-stretch rounded-lg border border-border',
  'bg-surface p-[0.1875rem]',
);

export const segmentedFullClass = cx(segmentedClass, 'flex w-full');

export const segmentClass =
  'relative flex min-w-0 flex-1 cursor-pointer items-stretch';

export const segmentFaceClass = cx(
  'inline-flex h-full w-full items-center justify-center rounded-md px-2',
  'text-center text-[0.8125rem] leading-tight text-muted transition-[background,color] duration-150',
  'peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-[0_0_0_1px_var(--color-border)]',
  'peer-disabled:cursor-not-allowed',
);

export const affixClass = cx(
  'flex h-control min-w-0 items-stretch overflow-hidden rounded-lg',
  'border border-border bg-background',
  'focus-within:border-ring focus-within:shadow-[0_0_0_3px_rgb(0_0_0_/0.04)]',
);

export const affixInputClass = cx(
  inputClass,
  'h-full flex-1 rounded-none border-0 shadow-none focus:border-0 focus:shadow-none focus:outline-none',
);

export const affixLabelClass = cx(
  'inline-flex shrink-0 items-center whitespace-nowrap border-l border-border',
  'bg-surface px-3 text-xs leading-none text-muted',
);
