import { describe, expect, it } from 'vitest';

import { addTimeBonus, CountdownTimer, formatTime } from './timer';

describe('formatTime', () => {
  it('formats milliseconds as MM:SS', () => {
    expect(formatTime(150_000)).toBe('02:30');
    expect(formatTime(9000)).toBe('00:09');
    expect(formatTime(0)).toBe('00:00');
  });

  it('rounds partial seconds up and never shows negative time', () => {
    expect(formatTime(100)).toBe('00:01');
    expect(formatTime(-500)).toBe('00:00');
  });
});

describe('addTimeBonus', () => {
  it('adds the bonus but never goes above the start time', () => {
    expect(addTimeBonus(100_000, 10_000, 150_000)).toBe(110_000);
    expect(addTimeBonus(145_000, 10_000, 150_000)).toBe(150_000);
  });
});

describe('CountdownTimer', () => {
  it('calculates the time from timestamps', () => {
    const timer = new CountdownTimer();

    timer.start(150_000, 1000);

    expect(timer.getTimeLeft(31_000)).toBe(120_000);
    expect(timer.getTimeLeft(1_000_000)).toBe(0);
  });

  it('keeps the remaining time while stopped', () => {
    const timer = new CountdownTimer();

    timer.start(10_000, 0);

    expect(timer.stop(4000)).toBe(6000);
    expect(timer.getTimeLeft(99_000)).toBe(6000);
    expect(timer.isRunning()).toBe(false);
  });
});
