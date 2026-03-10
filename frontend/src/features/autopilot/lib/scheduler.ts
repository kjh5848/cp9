export function getNextRunAtKST(
  intervalHours?: number | null, 
  activeStart?: number | null, 
  activeEnd?: number | null,
  offsetHours: number = 0
): Date {
  const now = new Date();
  
  // 기준 시간: 현재 시간 + (인덱스 * 주기 시간)
  let targetTime = new Date(now.getTime() + offsetHours * 60 * 60 * 1000);
  
  if (activeStart !== null && activeStart !== undefined && activeEnd !== null && activeEnd !== undefined) {
    const currentKSTHour = (targetTime.getUTCHours() + 9) % 24;
    
    let isWithinActiveTime = false;
    if (activeStart <= activeEnd) {
      isWithinActiveTime = currentKSTHour >= activeStart && currentKSTHour <= activeEnd;
    } else {
      isWithinActiveTime = currentKSTHour >= activeStart || currentKSTHour <= activeEnd;
    }
    
    if (!isWithinActiveTime) {
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
      
      targetTime = new Date(targetTime.getTime() + hoursToAdd * 60 * 60 * 1000);
      
      // 예약 시각을 해당 시간의 정각으로 맞춤 (예: 09:00:00)
      targetTime.setUTCMinutes(0, 0, 0); 
    }
  }
  
  return targetTime;
}
