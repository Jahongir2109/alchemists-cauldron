export const MS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;

export const secondsToMs = (seconds: number): number => seconds * MS_IN_SECOND;

// "MM:SS". Partial seconds are rounded up, so 00:00 appears only when the time is over.
export const formatTime = (timeLeftMs: number): string => {
  const totalSeconds: number = Math.max(0, Math.ceil(timeLeftMs / MS_IN_SECOND));
  const minutes: number = Math.floor(totalSeconds / SECONDS_IN_MINUTE);
  const seconds: number = totalSeconds % SECONDS_IN_MINUTE;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const addTimeBonus = (timeLeftMs: number, bonusMs: number, maxMs: number): number =>
  Math.min(timeLeftMs + bonusMs, maxMs);

// Countdown based on timestamps, not on counted ticks: the remaining time
// stays correct even when the browser throttles a background tab.
export class CountdownTimer {
  private endTime: number | null = null;

  private remaining = 0;

  public start(timeLeftMs: number, now: number = Date.now()): void {
    this.remaining = timeLeftMs;
    this.endTime = now + timeLeftMs;
  }

  public stop(now: number = Date.now()): number {
    this.remaining = this.getTimeLeft(now);
    this.endTime = null;

    return this.remaining;
  }

  public isRunning(): boolean {
    return this.endTime !== null;
  }

  public getTimeLeft(now: number = Date.now()): number {
    if (this.endTime === null) {
      return this.remaining;
    }

    return Math.max(0, this.endTime - now);
  }
}
