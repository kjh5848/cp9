/**
 * 다음 실행 예약 시각을 KST 기준으로 계산합니다.
 *
 * @param intervalMinutes - 반복 주기 (분 단위). DB의 intervalHours 필더를 활용하되 분 단위로 저장/처리.
 * @param activeStart - 동작 허용 시작 시간 (KST, 0~23)
 * @param activeEnd - 동작 허용 종료 시간 (KST, 0~23)
 * @param offsetMinutes - 추가 오프셋(대량 등록 시 인덱스별 간격, 분 단위)
 * @param baseDate - 기준 시점 (미지정 시 현재 시각)
 * @returns 다음 실행 예정 시각 (UTC Date)
 */
export function getNextRunAtKST(
  intervalMinutes?: number | null, 
  activeStart?: number | null, 
  activeEnd?: number | null,
  offsetMinutes: number = 0,
  baseDate?: Date | string | null
): Date {
  const base = baseDate ? new Date(baseDate) : new Date();
  
  // 기준 시간에 intervalMinutes(주기)와 offsetMinutes(대량 등록 오프셋)를 합산 (분 단위 -> 밀리초 변환)
  const totalOffsetMs = (offsetMinutes + (intervalMinutes ?? 0)) * 60 * 1000;
  let targetTime = new Date(base.getTime() + totalOffsetMs);
  
  // 활성 시간대 필터링 (KST 기준)
  if (activeStart !== null && activeStart !== undefined && activeEnd !== null && activeEnd !== undefined) {
    targetTime = adjustToActiveWindow(targetTime, activeStart, activeEnd);
  }
  
  return targetTime;
}

/**
 * targetTime이 활성 시간대 밖이면, 가장 가까운 활성 시작 시각으로 보정합니다.
 * 활성 시간대 안이면 그대로 반환합니다 (분/초 유지).
 */
function adjustToActiveWindow(targetTime: Date, activeStart: number, activeEnd: number): Date {
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
    return targetTime; // 분/초 그대로 유지
  }
  
  // 활성 시간대 밖 → 다음 activeStart 정각으로 이동
  let hoursToAdd = 0;
  if (activeStart <= activeEnd) {
    // 일반 구간
    if (currentKSTHour < activeStart) {
      hoursToAdd = activeStart - currentKSTHour;
    } else {
      // currentKSTHour > activeEnd
      hoursToAdd = 24 - currentKSTHour + activeStart;
    }
  } else {
    // 야간 구간: 비활성 = (activeEnd, activeStart) 사이
    if (currentKSTHour > activeEnd && currentKSTHour < activeStart) {
      hoursToAdd = activeStart - currentKSTHour;
    }
  }
  
  const adjusted = new Date(targetTime.getTime() + hoursToAdd * 60 * 60 * 1000);
  // 활성 시작 정각으로 맞춤 (예: 09:00:00)
  adjusted.setUTCMinutes(0, 0, 0);
  return adjusted;
}
