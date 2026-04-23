export type IntervalUnit = 'minute' | 'hour' | 'day' | 'week' | 'month';

export const INTERVAL_MULTIPLIERS: Record<IntervalUnit, number> = {
  minute: 1,
  hour: 60,
  day: 1440, // 60 * 24
  week: 10080, // 1440 * 7
  month: 43200 // 1440 * 30 (근사치: 30일)
};

export const INTERVAL_LABELS: Record<IntervalUnit, string> = {
  minute: '분',
  hour: '시간',
  day: '일',
  week: '주',
  month: '개월'
};

/**
 * 분(minutes) 단위의 총량을 가장 적합한 숫자와 단위의 쌍(짝)으로 변환합니다.
 * 큰 단위부터 나누어 떨어지는지 확인하여, 되도록 가장 큰 단위로 표현합니다.
 * (예: 1440분 -> { value: 1, unit: 'day' })
 */
export function parseMinutesToUnitAndValue(minutes: number): { value: number; unit: IntervalUnit } {
  if (!minutes || minutes <= 0) return { value: 0, unit: 'hour' }; // 기본 fallback은 'hour'로 합니다.

  if (minutes % INTERVAL_MULTIPLIERS.month === 0) {
    return { value: minutes / INTERVAL_MULTIPLIERS.month, unit: 'month' };
  }
  if (minutes % INTERVAL_MULTIPLIERS.week === 0) {
    return { value: minutes / INTERVAL_MULTIPLIERS.week, unit: 'week' };
  }
  if (minutes % INTERVAL_MULTIPLIERS.day === 0) {
    return { value: minutes / INTERVAL_MULTIPLIERS.day, unit: 'day' };
  }
  if (minutes % INTERVAL_MULTIPLIERS.hour === 0) {
    return { value: minutes / INTERVAL_MULTIPLIERS.hour, unit: 'hour' };
  }
  
  return { value: minutes, unit: 'minute' };
}

/**
 * 숫자(value)와 단위(unit)를 묶어서 총 분(minutes) 값으로 계산합니다.
 */
export function calcMinutesFromUnit(value: number, unit: IntervalUnit): number {
  if (!value || isNaN(value)) return 0;
  return value * (INTERVAL_MULTIPLIERS[unit] || 1);
}

/**
 * 분(minutes) 단위 값을 화면 표시용의 인간 친화적 문자열("N주", "N시간" 등)로 포매팅합니다.
 */
export function formatInterval(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '단발성';
  const { value, unit } = parseMinutesToUnitAndValue(minutes);
  return `${value}${INTERVAL_LABELS[unit]}`;
}
