package com.cp9.infrastructure.messaging.event;

import com.cp9.domain.user.event.UserCreatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * 사용자 이벤트 핸들러
 * 사용자 관련 도메인 이벤트를 처리하는 이벤트 리스너
 */
@Component
@Slf4j
public class UserEventHandler {
    
    /**
     * 사용자 생성 이벤트 처리
     * 사용자가 생성되었을 때 실행되는 핸들러
     */
    @EventListener
    public void handleUserCreatedEvent(UserCreatedEvent event) {
        log.info("사용자 생성 이벤트 수신: {}", event.getEventInfo());
        
        // 여기에서 다양한 후속 작업을 수행할 수 있습니다:
        // 1. 환영 이메일 발송
        // 2. 외부 시스템 연동 (CRM, 분석 도구 등)
        // 3. 초기 설정 생성
        // 4. 통계 업데이트
        // 5. 알림 발송
        
        try {
            // 예시: 환영 메시지 로깅
            log.info("새 사용자 환영 처리 시작: {} ({})", 
                    event.getUsername(), event.getEmail());
            
            // 실제 구현에서는 다음과 같은 서비스들을 호출할 수 있습니다:
            // emailService.sendWelcomeEmail(event);
            // analyticsService.trackUserRegistration(event);
            // notificationService.sendAdminNotification(event);
            
            log.info("새 사용자 환영 처리 완료: {}", event.getUsername());
            
        } catch (Exception e) {
            log.error("사용자 생성 이벤트 처리 중 오류 발생: {}", event.getUsername(), e);
            // 이벤트 처리 실패에 대한 추가 처리 로직
            // 예: 재시도 큐에 추가, 관리자 알림 등
        }
    }
}