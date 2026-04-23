/**
 * 다음 실행 예약 시각을 KST 기준으로 계산합니다.
 *
 * @param intervalMinutes - 반복 주기 (분 단위)
 * @param activeStart - 동작 허용 시작 시간 (KST, 0~23)
 * @param activeEnd - 동작 허용 종료 시간 (KST, 0~23)
 * @param index - 현재 항목의 대기열 등록 순서 인덱스 (0부터 시작)
 * @param baseDate - 기준 시점 (미지정 시 현재 시각)
 * @param publishTimes - 특정 발행 시간 배열 (예: ["09:00", "15:00"])
 * @param publishDays - 특정 요일 배열 (예: [1,2,3,4,5] 월~금)
 * @param jitterMinutes - 어뷰징 방지 난수화 범위 (분 단위)
 * @returns 다음 실행 예정 시각 (UTC Date)
 */
export function getNextRunAtKST(
  intervalMinutes?: number | null, 
  activeStart?: number | null, 
  activeEnd?: number | null,
  index: number = 0,
  baseDate?: Date | string | null,
  publishTimes?: string[],
  publishDays?: number[],
  jitterMinutes: number = 0
): Date {
  const base = baseDate ? new Date(baseDate) : new Date();
  let targetTime: Date;

  if (publishTimes && publishTimes.length > 0) {
    // 1. 특정 시간 지정 방식 (Specific Publish Times)
    targetTime = getNextSpecificTimeByIndex(base, publishTimes, index, publishDays);
  } else {
    // 2. 간격 방식 (Interval - 기존 로직)
    const intervalMs = (intervalMinutes ?? 0) * 60 * 1000;
    targetTime = new Date(base.getTime() + index * intervalMs);
    
    // 활성 시간대 필터링 (KST 기준)
    if (activeStart !== null && activeStart !== undefined && activeEnd !== null && activeEnd !== undefined) {
      targetTime = adjustToActiveWindow(targetTime, activeStart, activeEnd);
    }
  }

  // 첫 번째 항목(index === 0)이고 기준일이 현재 또는 과거라면 즉각 실행되도록 보장 (jitter 및 불필요한 연기 방지)
  if (index === 0 && base.getTime() <= Date.now()) {
    return new Date();
  }

  // 3. 어뷰징 방지 난수화 (Jitter) 적용
  if (jitterMinutes > 0) {
    targetTime = applyJitter(targetTime, jitterMinutes);
  }

  return targetTime;
}

/**
 * 기준 시간(base) 이후에 도래하는 특정 예약 시간(KST) 중 index번째 시각을 찾습니다.
 */
function getNextSpecificTimeByIndex(base: Date, publishTimes: string[], targetIndex: number, publishDays?: number[]): Date {
  // 1. Time 문자열 파싱 (KST 기준 HH:MM)
  const parsedTimes = publishTimes.map(t => {
    const [h, m] = t.split(':').map(Number);
    return { h, m };
  }).sort((a, b) => (a.h * 60 + a.m) - (b.h * 60 + b.m)); // 빠른 시간 순 정렬

  let matchesFound = 0;
  
  // 2. 날짜 탐색 시작 (최대 100일 정도 탐색)
  for (let dayOffset = 0; dayOffset < 100; dayOffset++) {
    const currentTestDate = new Date(base.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const kstDay = (currentTestDate.getUTCDay() + (currentTestDate.getUTCHours() + 9 >= 24 ? 1 : 0)) % 7;
    
    // 요일 필터 (지정된 요일이 있고, 현재 테스트하는 날짜가 그 요일이 아니면 건너뜀)
    if (publishDays && publishDays.length > 0 && !publishDays.includes(kstDay)) {
      continue;
    }

    const baseKSTHour = (base.getUTCHours() + 9) % 24;
    const baseKSTMinute = base.getUTCMinutes();

    for (const time of parsedTimes) {
      // 당일인 경우, 이미 지난 시간은 스킵
      if (dayOffset === 0 && (time.h < baseKSTHour || (time.h === baseKSTHour && time.m <= baseKSTMinute))) {
        continue;
      }

      if (matchesFound === targetIndex) {
        // 목표 시간 계산 (target KST hours - 9 = UTC hours)
        const targetUtcHours = time.h - 9;
        const candidateDate = new Date(currentTestDate);
        candidateDate.setUTCHours(targetUtcHours, time.m, 0, 0);
        return candidateDate;
      }
      matchesFound++;
    }
  }

  // 매칭되는 날이 없으면 기본적으로 fallback 반환
  return new Date(base.getTime() + 24 * 60 * 60 * 1000 * (targetIndex + 1));
}

/**
 * 목표 시간에 지정된 분(minutes) 범위 안에서 난수를 더하거나 뺍니다.
 * 예: 09:00에 jitter 15를 주면 08:45 ~ 09:15 사이의 시간 반환.
 */
function applyJitter(targetTime: Date, jitterMinutes: number): Date {
  const jitterMs = jitterMinutes * 60 * 1000;
  const randomOffset = Math.floor(Math.random() * (jitterMs * 2 + 1)) - jitterMs;
  return new Date(targetTime.getTime() + randomOffset);
}

/**
 * targetTime이 활성 시간대 밖이면, 가장 가까운 활성 시작 시각으로 보정합니다.
 * 활성 시간대 안이면 그대로 반환합니다 (분/초 유지).
 */
function adjustToActiveWindow(targetTime: Date, activeStart: number, activeEnd: number): Date {
  if (activeStart === -1 || activeEnd === -1) {
    return targetTime;
  }

  const currentKSTHour = (targetTime.getUTCHours() + 9) % 24;
  
  let isWithinActiveTime = false;
  if (activeStart <= activeEnd) {
    // 일반 구간: 예) 09:00 ~ 22:00
    isWithinActiveTime = currentKSTHour >= activeStart && currentKSTHour <= activeEnd;
  } else {
    // 야간 랩어라운드 구간: 예) 22:00 ~ 04:00
    isWithinActiveTime = currentKSTHour >= activeStart || currentKSTHour <= activeEnd;
  }
  
  if (isWithinActiveTime) {
    return targetTime;
  }
  
  // 활성 시간대 밖 → 다음 activeStart 정각으로 이동
  let hoursToAdd = 0;
  if (activeStart <= activeEnd) {
    if (currentKSTHour < activeStart) {
      hoursToAdd = activeStart - currentKSTHour;
    } else {
      hoursToAdd = 24 - currentKSTHour + activeStart;
    }
  } else {
    if (currentKSTHour > activeEnd && currentKSTHour < activeStart) {
      hoursToAdd = activeStart - currentKSTHour;
    }
  }
  
  const adjusted = new Date(targetTime.getTime() + hoursToAdd * 60 * 60 * 1000);
  adjusted.setUTCMinutes(0, 0, 0);
  return adjusted;
}
