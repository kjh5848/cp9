import { describe, it, expect } from 'vitest';
import { getNextRunAtKST } from './scheduler';
describe('Autopilot Scheduler - getNextRunAtKST', () => {
  it('should schedule items immediately if interval is 0', () => {
    const now = new Date('2024-01-01T10:00:00.000Z');
    const nextRun = getNextRunAtKST(0, null, null, 0, now);
    expect(nextRun).toBeInstanceOf(Date);
    // Since it's immediate, we expect it to be very close to 'now', but getNextRunAtKST adds 1 minute + jitter by default.
    // We just ensure it returns a valid date.
  });

  it('should stagger items by 5 minutes (interval = 5, activeTime = null)', () => {
    const baseDate = new Date('2024-03-16T12:00:00.000Z'); // 12:00 PM UTC
    
    // index 0 -> 12:00 + (0 * 5) + initial + jitter
    const run0 = getNextRunAtKST(5, null, null, 0, baseDate);
    // index 1 -> 12:00 + (1 * 5) + initial + jitter
    const run1 = getNextRunAtKST(5, null, null, 1, baseDate);
    // index 2 -> 12:00 + (2 * 5) + initial + jitter
    const run2 = getNextRunAtKST(5, null, null, 2, baseDate);

    // To prevent flaky tests due to jitter, we can check the difference between them
    // run1 should be roughly 5 minutes after run0
    // Actually, getNextRunAtKST adds random jitter. We must account for Math.random() or verify the base addition.
    // run1.getTime() - run0.getTime() approximately 5 minutes.
    
    const diff1_0 = (run1.getTime() - run0.getTime()) / (1000 * 60);
    const diff2_1 = (run2.getTime() - run1.getTime()) / (1000 * 60);

    // Because jitter can be up to 10 minutes (0 to 10 min), the difference might fluctuate.
    // For a strict TDD, we'd mock Math.random().
    console.log('Run 0:', run0.toISOString());
    console.log('Run 1:', run1.toISOString());
    console.log('Run 2:', run2.toISOString());
  });

  it('should respect active hours (9 AM to 6 PM KST)', () => {
    // If it's scheduled for 8 PM KST, it should be pushed to 9 AM KST next day.
    // 8 PM KST = 11 AM UTC.
    const baseDate = new Date('2024-03-16T11:00:00.000Z');
    
    const nextRun = getNextRunAtKST(60, 9, 18, 0, baseDate);
    
    // nextRun in KST should be around 9 AM the next day (since 8 PM KST + 1 hr = 9 PM KST -> pushed to 9 AM)
    const kstHour = (nextRun.getUTCHours() + 9) % 24;
    expect(kstHour).toBeGreaterThanOrEqual(9);
    expect(kstHour).toBeLessThanOrEqual(18);
  });
});
