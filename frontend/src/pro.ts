/** Azam Pro 3-day free trial helpers. The server owns `pro_trial_started`; this only derives display state. */
export const TRIAL_DAYS = 3;
const DAY = 24 * 60 * 60 * 1000;

export type TrialInfo = { used: boolean; active: boolean; expired: boolean; daysLeft: number };

export function trialInfo(settings: any, now = Date.now()): TrialInfo {
  const started = settings?.pro_trial_started ? new Date(settings.pro_trial_started).getTime() : NaN;
  if (!Number.isFinite(started)) return { used: false, active: false, expired: false, daysLeft: TRIAL_DAYS };
  const left = started + TRIAL_DAYS * DAY - now;
  const expired = left <= 0;
  return { used: true, active: !expired && !!settings?.pro_preview, expired, daysLeft: Math.max(0, Math.ceil(left / DAY)) };
}

/** Patch to send through updateSettings when the user starts the trial (the server stamps the start date). */
export const startTrialPatch = () => ({ pro_preview: true });
