package com.cp9.application.user.dto;

import com.cp9.domain.user.model.UserStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 조회 쿼리
 * 사용자 검색 및 필터링을 위한 쿼리 조건
 */
@Getter
@NoArgsConstructor
public class UserQuery {
    
    private String userId;
    private String username;
    private String email;
    private UserStatus status;
    private String displayName;
    
    public UserQuery(String userId) {
        this.userId = userId;
    }
    
    public UserQuery(String username, String email) {
        this.username = username;
        this.email = email;
    }
    
    public static UserQuery byId(String userId) {
        return new UserQuery(userId);
    }
    
    public static UserQuery byUsername(String username) {
        UserQuery query = new UserQuery();
        query.username = username;
        return query;
    }
    
    public static UserQuery byEmail(String email) {
        UserQuery query = new UserQuery();
        query.email = email;
        return query;
    }
    
    public static UserQuery byStatus(UserStatus status) {
        UserQuery query = new UserQuery();
        query.status = status;
        return query;
    }
    
    public static UserQuery activeUsers() {
        return byStatus(UserStatus.ACTIVE);
    }
}