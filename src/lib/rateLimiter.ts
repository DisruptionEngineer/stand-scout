const COOLDOWNS: Record<string, number> = {
  report: 2 * 60 * 60 * 1000,     // 2 hours between reports per stand
  review: 24 * 60 * 60 * 1000,    // 24 hours between reviews per stand
  add_stand: 60 * 60 * 1000,      // 1 hour between stand submissions
};

function storageKey(action: string, entityId: string): string {
  return `ss_rl_${action}_${entityId}`;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingMs: number;
  remainingLabel: string;
}

export function checkRateLimit(
  action: string,
  entityId: string,
): RateLimitResult {
  const cooldown = COOLDOWNS[action] ?? 60_000;
  const key = storageKey(action, entityId);

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { allowed: true, remainingMs: 0, remainingLabel: '' };

    const lastAt = Number(raw);
    const elapsed = Date.now() - lastAt;
    const remaining = cooldown - elapsed;

    if (remaining <= 0) {
      return { allowed: true, remainingMs: 0, remainingLabel: '' };
    }

    const hrs = Math.floor(remaining / 3_600_000);
    const mins = Math.floor((remaining % 3_600_000) / 60_000);
    const label = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

    return { allowed: false, remainingMs: remaining, remainingLabel: label };
  } catch {
    return { allowed: true, remainingMs: 0, remainingLabel: '' };
  }
}

export function recordAction(action: string, entityId: string): void {
  try {
    localStorage.setItem(storageKey(action, entityId), String(Date.now()));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}
