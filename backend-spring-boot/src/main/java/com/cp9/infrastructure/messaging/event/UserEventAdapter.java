package com.cp9.infrastructure.messaging.event;

import com.cp9.application.user.port.out.UserEventPort;
import com.cp9.domain.user.event.UserCreatedEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * 사용자 이벤트 어댑터
 * 도메인 이벤트를 Spring 이벤트로 발행하는 아웃바운드 어댑터
 */
@Component
public class UserEventAdapter implements UserEventPort {
    
    private final ApplicationEventPublisher eventPublisher;
    
    public UserEventAdapter(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }
    
    @Override
    public void publishUserCreatedEvent(UserCreatedEvent event) {
        eventPublisher.publishEvent(event);
    }
}