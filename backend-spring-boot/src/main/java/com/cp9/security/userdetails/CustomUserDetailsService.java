package com.cp9.security.userdetails;

import com.cp9.entity.User;
import com.cp9.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Security UserDetailsService 구현체
 * 사용자 인증 시 사용자 정보를 로드하는 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    /**
     * Spring Security 표준 인터페이스 구현
     * 사용자명 또는 이메일로 사용자 조회
     * 
     * @param usernameOrEmail 사용자명 또는 이메일
     * @return UserDetails 구현체
     * @throws UsernameNotFoundException 사용자를 찾을 수 없을 때
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        log.debug("Loading user by username or email: {}", usernameOrEmail);
        
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
            .orElseThrow(() -> {
                log.warn("User not found with username or email: {}", usernameOrEmail);
                return new UsernameNotFoundException("User not found: " + usernameOrEmail);
            });
        
        if (user.getRoles().isEmpty()) {
            log.warn("User {} has no roles assigned", usernameOrEmail);
            throw new UsernameNotFoundException("User has no roles assigned: " + usernameOrEmail);
        }
        
        // 마지막 로그인 시간 업데이트 (별도 트랜잭션에서 처리)
        try {
            updateLastLoginAsync(user.getId());
        } catch (Exception e) {
            log.warn("Failed to update last login time for user: {}", usernameOrEmail, e);
            // 로그인 자체는 실패하지 않도록 예외를 무시
        }
        
        CustomUserDetails userDetails = CustomUserDetails.create(user);
        
        log.debug("Successfully loaded user: {} with {} authorities", 
                usernameOrEmail, userDetails.getAuthorities().size());
        
        return userDetails;
    }
    
    /**
     * 사용자 ID로 사용자 조회 (JWT 토큰 검증용)
     * 
     * @param userId 사용자 ID
     * @return UserDetails 구현체
     * @throws UsernameNotFoundException 사용자를 찾을 수 없을 때
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long userId) throws UsernameNotFoundException {
        log.debug("Loading user by ID: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> {
                log.warn("User not found with ID: {}", userId);
                return new UsernameNotFoundException("User not found with id: " + userId);
            });
        
        if (!user.getEnabled()) {
            log.warn("User {} is disabled", userId);
            throw new UsernameNotFoundException("User is disabled: " + userId);
        }
        
        if (!user.getAccountNonLocked()) {
            log.warn("User {} account is locked", userId);
            throw new UsernameNotFoundException("User account is locked: " + userId);
        }
        
        CustomUserDetails userDetails = CustomUserDetails.create(user);
        
        log.debug("Successfully loaded user by ID: {} with {} authorities", 
                userId, userDetails.getAuthorities().size());
        
        return userDetails;
    }
    
    /**
     * 사용자명으로 사용자 조회
     * 
     * @param username 사용자명
     * @return UserDetails 구현체
     * @throws UsernameNotFoundException 사용자를 찾을 수 없을 때
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsernameOnly(String username) throws UsernameNotFoundException {
        log.debug("Loading user by username only: {}", username);
        
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> {
                log.warn("User not found with username: {}", username);
                return new UsernameNotFoundException("User not found: " + username);
            });
        
        return CustomUserDetails.create(user);
    }
    
    /**
     * 이메일로 사용자 조회
     * 
     * @param email 이메일
     * @return UserDetails 구현체
     * @throws UsernameNotFoundException 사용자를 찾을 수 없을 때
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserByEmail(String email) throws UsernameNotFoundException {
        log.debug("Loading user by email: {}", email);
        
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> {
                log.warn("User not found with email: {}", email);
                return new UsernameNotFoundException("User not found: " + email);
            });
        
        return CustomUserDetails.create(user);
    }
    
    /**
     * OAuth2 사용자 로드 (비밀번호 인증 불필요)
     * 
     * @param userId 사용자 ID
     * @return OAuth2용 UserDetails
     * @throws UsernameNotFoundException 사용자를 찾을 수 없을 때
     */
    @Transactional(readOnly = true)
    public UserDetails loadOAuth2UserById(Long userId) throws UsernameNotFoundException {
        log.debug("Loading OAuth2 user by ID: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> {
                log.warn("OAuth2 user not found with ID: {}", userId);
                return new UsernameNotFoundException("OAuth2 user not found with id: " + userId);
            });
        
        if (!user.isOAuth2User()) {
            log.warn("User {} is not an OAuth2 user", userId);
            throw new UsernameNotFoundException("Not an OAuth2 user: " + userId);
        }
        
        CustomUserDetails userDetails = CustomUserDetails.createForOAuth2(user);
        
        log.debug("Successfully loaded OAuth2 user by ID: {} with {} authorities", 
                userId, userDetails.getAuthorities().size());
        
        return userDetails;
    }
    
    /**
     * 사용자의 권한 정보만 다시 로드 (권한 변경 시 사용)
     * 
     * @param userId 사용자 ID
     * @return 새로 로드된 UserDetails
     * @throws UsernameNotFoundException 사용자를 찾을 수 없을 때
     */
    @Transactional(readOnly = true)
    public UserDetails reloadUserAuthorities(Long userId) throws UsernameNotFoundException {
        log.debug("Reloading authorities for user: {}", userId);
        
        // 권한 정보를 포함하여 사용자 재조회
        User user = userRepository.findById(userId)
            .orElseThrow(() -> {
                log.warn("User not found for authority reload: {}", userId);
                return new UsernameNotFoundException("User not found for authority reload: " + userId);
            });
        
        CustomUserDetails userDetails = CustomUserDetails.create(user);
        
        log.debug("Successfully reloaded authorities for user: {} with {} authorities", 
                userId, userDetails.getAuthorities().size());
        
        return userDetails;
    }
    
    /**
     * 사용자 존재 여부 확인
     * 
     * @param usernameOrEmail 사용자명 또는 이메일
     * @return 존재 여부
     */
    @Transactional(readOnly = true)
    public boolean userExists(String usernameOrEmail) {
        return userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
            .isPresent();
    }
    
    /**
     * 사용자 활성 상태 확인
     * 
     * @param usernameOrEmail 사용자명 또는 이메일
     * @return 활성 상태
     */
    @Transactional(readOnly = true)
    public boolean isUserEnabled(String usernameOrEmail) {
        return userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
            .map(User::getEnabled)
            .orElse(false);
    }
    
    /**
     * 비동기로 마지막 로그인 시간 업데이트
     * 실제 구현에서는 @Async 어노테이션과 별도 서비스를 사용할 수 있음
     * 
     * @param userId 사용자 ID
     */
    private void updateLastLoginAsync(Long userId) {
        // 별도 트랜잭션에서 처리하거나 이벤트 발행으로 처리
        // 현재는 단순 로깅만 수행
        log.debug("Should update last login time for user: {}", userId);
    }
}