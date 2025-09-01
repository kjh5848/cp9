package com.cp9.domain.user.service;

import com.cp9.domain.shared.vo.Email;
import com.cp9.domain.user.model.User;
import com.cp9.domain.user.model.UserRepository;
import org.springframework.stereotype.Service;

/**
 * 사용자 도메인 서비스
 * 단일 엔티티로 처리하기 어려운 복잡한 비즈니스 로직을 담당
 */
@Service
public class UserDomainService {
    
    private final UserRepository userRepository;
    
    public UserDomainService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * 사용자명 중복 검사
     */
    public void validateUniqueUsername(String username) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("이미 사용 중인 사용자명입니다: " + username);
        }
    }
    
    /**
     * 이메일 중복 검사
     */
    public void validateUniqueEmail(Email email) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다: " + email);
        }
    }
    
    /**
     * 새 사용자 생성 가능 여부 검증
     */
    public void validateUserCreation(String username, Email email) {
        validateUniqueUsername(username);
        validateUniqueEmail(email);
    }
    
    /**
     * 사용자 이메일 변경 가능 여부 검증
     */
    public void validateEmailChange(User user, Email newEmail) {
        if (user.getEmail().equals(newEmail)) {
            throw new IllegalArgumentException("현재 이메일과 동일합니다.");
        }
        
        if (userRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다: " + newEmail);
        }
    }
    
    /**
     * 사용자 삭제 가능 여부 검증
     */
    public void validateUserDeletion(User user) {
        if (!user.isAccessible()) {
            throw new IllegalStateException("삭제할 수 없는 상태의 사용자입니다: " + user.getStatus());
        }
    }
    
    /**
     * 사용자가 시스템에서 유일한지 확인
     */
    public boolean isUserUnique(String username, Email email) {
        return !userRepository.existsByUsername(username) && 
               !userRepository.existsByEmail(email);
    }
}