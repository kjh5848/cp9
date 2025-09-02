package com.cp9.security.userdetails;

import com.cp9.entity.Role;
import com.cp9.entity.User;
import com.cp9.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
@DisplayName("커스텀 UserDetailsService 테스트")
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("사용자명으로 사용자 로딩 성공 테스트")
    void loadUserByUsername_Success() {
        // Given
        String username = "testuser";
        User user = createTestUser(username, "test@example.com");
        given(userRepository.findByUsernameOrEmail(username, username)).willReturn(Optional.of(user));

        // When
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

        // Then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(username);
        assertThat(userDetails.getPassword()).isEqualTo("encodedPassword");
        assertThat(userDetails.isEnabled()).isTrue();
        assertThat(userDetails.isAccountNonExpired()).isTrue();
        assertThat(userDetails.isAccountNonLocked()).isTrue();
        assertThat(userDetails.isCredentialsNonExpired()).isTrue();
        assertThat(userDetails.getAuthorities()).hasSize(1);
    }

    @Test
    @DisplayName("이메일로 사용자 로딩 성공 테스트")
    void loadUserByUsername_WithEmail_Success() {
        // Given
        String email = "test@example.com";
        User user = createTestUser("testuser", email);
        given(userRepository.findByUsernameOrEmail(email, email)).willReturn(Optional.of(user));

        // When
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

        // Then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("testuser");
        assertThat(userDetails instanceof CustomUserDetails).isTrue();
        
        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
        assertThat(customUserDetails.getEmail()).isEqualTo(email);
        assertThat(customUserDetails.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("존재하지 않는 사용자명으로 로딩 실패 테스트")
    void loadUserByUsername_UserNotFound_ThrowsException() {
        // Given
        String username = "nonexistentuser";
        given(userRepository.findByUsernameOrEmail(username, username)).willReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername(username))
            .isInstanceOf(UsernameNotFoundException.class)
            .hasMessageContaining("User not found with username or email: " + username);
    }

    @Test
    @DisplayName("사용자 ID로 사용자 로딩 성공 테스트")
    void loadUserById_Success() {
        // Given
        Long userId = 1L;
        User user = createTestUser("testuser", "test@example.com");
        given(userRepository.findById(userId)).willReturn(Optional.of(user));

        // When
        UserDetails userDetails = customUserDetailsService.loadUserById(userId);

        // Then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails instanceof CustomUserDetails).isTrue();
        
        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
        assertThat(customUserDetails.getId()).isEqualTo(userId);
        assertThat(customUserDetails.getUsername()).isEqualTo("testuser");
    }

    @Test
    @DisplayName("존재하지 않는 사용자 ID로 로딩 실패 테스트")
    void loadUserById_UserNotFound_ThrowsException() {
        // Given
        Long userId = 999L;
        given(userRepository.findById(userId)).willReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> customUserDetailsService.loadUserById(userId))
            .isInstanceOf(UsernameNotFoundException.class)
            .hasMessageContaining("User not found with id: " + userId);
    }

    @Test
    @DisplayName("비활성화된 사용자 로딩 테스트")
    void loadUserByUsername_DisabledUser_ReturnsDisabledUserDetails() {
        // Given
        String username = "disableduser";
        User user = createTestUser(username, "disabled@example.com");
        user.setEnabled(false); // 사용자 비활성화
        given(userRepository.findByUsernameOrEmail(username, username)).willReturn(Optional.of(user));

        // When
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

        // Then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.isEnabled()).isFalse();
        assertThat(userDetails.getUsername()).isEqualTo(username);
    }

    @Test
    @DisplayName("계정 만료된 사용자 로딩 테스트")
    void loadUserByUsername_ExpiredAccount_ReturnsExpiredUserDetails() {
        // Given
        String username = "expireduser";
        User user = createTestUser(username, "expired@example.com");
        user.setAccountNonExpired(false); // 계정 만료
        given(userRepository.findByUsernameOrEmail(username, username)).willReturn(Optional.of(user));

        // When
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

        // Then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.isAccountNonExpired()).isFalse();
        assertThat(userDetails.getUsername()).isEqualTo(username);
    }

    @Test
    @DisplayName("계정 잠긴 사용자 로딩 테스트")
    void loadUserByUsername_LockedAccount_ReturnsLockedUserDetails() {
        // Given
        String username = "lockeduser";
        User user = createTestUser(username, "locked@example.com");
        user.setAccountNonLocked(false); // 계정 잠금
        given(userRepository.findByUsernameOrEmail(username, username)).willReturn(Optional.of(user));

        // When
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

        // Then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.isAccountNonLocked()).isFalse();
        assertThat(userDetails.getUsername()).isEqualTo(username);
    }

    @Test
    @DisplayName("비밀번호 만료된 사용자 로딩 테스트")
    void loadUserByUsername_ExpiredCredentials_ReturnsExpiredCredentialsUserDetails() {
        // Given
        String username = "credentialsexpireduser";
        User user = createTestUser(username, "credexpired@example.com");
        user.setCredentialsNonExpired(false); // 비밀번호 만료
        given(userRepository.findByUsernameOrEmail(username, username)).willReturn(Optional.of(user));

        // When
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

        // Then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.isCredentialsNonExpired()).isFalse();
        assertThat(userDetails.getUsername()).isEqualTo(username);
    }

    @Test
    @DisplayName("여러 역할을 가진 사용자 로딩 테스트")
    void loadUserByUsername_MultipleRoles_ReturnsCorrectAuthorities() {
        // Given
        String username = "adminuser";
        User user = createTestUser(username, "admin@example.com");
        
        Role userRole = Role.builder().name("ROLE_USER").enabled(true).build();
        Role adminRole = Role.builder().name("ROLE_ADMIN").enabled(true).build();
        user.setRoles(Set.of(userRole, adminRole));
        
        given(userRepository.findByUsernameOrEmail(username, username)).willReturn(Optional.of(user));

        // When
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

        // Then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getAuthorities()).hasSize(2);
        assertThat(userDetails.getAuthorities())
            .extracting("authority")
            .containsExactlyInAnyOrder("ROLE_USER", "ROLE_ADMIN");
    }

    private User createTestUser(String username, String email) {
        Role userRole = Role.builder()
            .id(1L)
            .name("ROLE_USER")
            .enabled(true)
            .build();

        return User.builder()
            .id(1L)
            .username(username)
            .email(email)
            .password("encodedPassword")
            .name("Test User")
            .enabled(true)
            .active(true)
            .accountNonExpired(true)
            .accountNonLocked(true)
            .credentialsNonExpired(true)
            .roles(Set.of(userRole))
            .build();
    }
}