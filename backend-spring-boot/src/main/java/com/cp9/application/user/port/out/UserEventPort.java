package com.cp9.application.user.port.out;

import com.cp9.domain.user.event.UserCreatedEvent;

/**
 * 사용자 이벤트 아웃바운드 포트
 * 도메인 이벤트 발행을 위한 인터페이스
 */
public interface UserEventPort {
    
    /**
     * 사용자 생성 이벤트 발행
     */
    void publishUserCreatedEvent(UserCreatedEvent event);
}