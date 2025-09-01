package com.cp9.domain.user.event;

import com.cp9.domain.user.model.UserId;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 사용자 생성 도메인 이벤트
 * 사용자가 새로 생성되었을 때 발생하는 이벤트
 */
@Getter
public class UserCreatedEvent {
    
    private final UserId userId;
    private final String username;
    private final String email;
    private final String displayName;
    private final LocalDateTime occurredAt;
    
    public UserCreatedEvent(UserId userId, String username, String email, String displayName) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.occurredAt = LocalDateTime.now();
    }
    
    /**
     * 이벤트 정보를 문자열로 반환
     */
    public String getEventInfo() {
        return String.format("사용자 생성됨: %s (%s)", username, email);
    }
    
    @Override
    public String toString() {
        return "UserCreatedEvent{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", displayName='" + displayName + '\'' +
                ", occurredAt=" + occurredAt +
                '}';
    }
}