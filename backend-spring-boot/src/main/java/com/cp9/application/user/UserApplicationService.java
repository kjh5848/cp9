package com.cp9.application.user;

import com.cp9.application.user.dto.*;
import com.cp9.application.user.port.in.CreateUserUseCase;
import com.cp9.application.user.port.in.GetUserUseCase;
import com.cp9.application.user.port.in.UpdateUserUseCase;
import com.cp9.application.user.port.out.UserEventPort;
import com.cp9.domain.shared.vo.Email;
import com.cp9.domain.user.event.UserCreatedEvent;
import com.cp9.domain.user.model.User;
import com.cp9.domain.user.model.UserId;
import com.cp9.domain.user.model.UserRepository;
import com.cp9.domain.user.model.UserStatus;
import com.cp9.domain.user.service.UserDomainService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 사용자 애플리케이션 서비스
 * 사용자 관련 유스케이스를 구현하고 오케스트레이션을 담당
 */
@Service
@Transactional
public class UserApplicationService implements CreateUserUseCase, GetUserUseCase, UpdateUserUseCase {
    
    private final UserRepository userRepository;
    private final UserDomainService userDomainService;
    private final UserEventPort userEventPort;
    
    public UserApplicationService(UserRepository userRepository, 
                                UserDomainService userDomainService,
                                UserEventPort userEventPort) {
        this.userRepository = userRepository;
        this.userDomainService = userDomainService;
        this.userEventPort = userEventPort;
    }
    
    @Override
    public UserResponse createUser(CreateUserCommand command) {
        Email email = new Email(command.getEmail());
        
        // 도메인 서비스를 통한 비즈니스 규칙 검증
        userDomainService.validateUserCreation(command.getUsername(), email);
        
        // 사용자 생성
        User user = new User(command.getUsername(), email, command.getDisplayName());
        User savedUser = userRepository.save(user);
        
        // 도메인 이벤트 발행
        UserCreatedEvent event = new UserCreatedEvent(
            savedUser.getId(), 
            savedUser.getUsername(), 
            savedUser.getEmail().getValue(), 
            savedUser.getDisplayName()
        );
        userEventPort.publishUserCreatedEvent(event);
        
        return new UserResponse(savedUser);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<UserResponse> getUserById(String userId) {
        return userRepository.findById(UserId.of(userId))
                .map(UserResponse::new);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<UserResponse> getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(UserResponse::new);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<UserResponse> getUserByEmail(String email) {
        return userRepository.findByEmail(new Email(email))
                .map(UserResponse::new);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getActiveUsers() {
        return userRepository.findActiveUsers().stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByQuery(UserQuery query) {
        if (query.getStatus() != null) {
            return userRepository.findByStatus(query.getStatus()).stream()
                    .map(UserResponse::new)
                    .collect(Collectors.toList());
        }
        return getAllUsers();
    }
    
    @Override
    public UserResponse updateUser(UpdateUserCommand command) {
        User user = findUserByIdOrThrow(command.getUserId());
        user.updateProfile(command.getDisplayName());
        User updatedUser = userRepository.save(user);
        return new UserResponse(updatedUser);
    }
    
    @Override
    public UserResponse changeEmail(ChangeEmailCommand command) {
        User user = findUserByIdOrThrow(command.getUserId());
        Email newEmail = new Email(command.getEmail());
        
        // 도메인 서비스를 통한 이메일 변경 검증
        userDomainService.validateEmailChange(user, newEmail);
        
        user.changeEmail(newEmail);
        User updatedUser = userRepository.save(user);
        return new UserResponse(updatedUser);
    }
    
    @Override
    public UserResponse activateUser(String userId) {
        User user = findUserByIdOrThrow(userId);
        user.activate();
        User updatedUser = userRepository.save(user);
        return new UserResponse(updatedUser);
    }
    
    @Override
    public UserResponse deactivateUser(String userId) {
        User user = findUserByIdOrThrow(userId);
        user.deactivate();
        User updatedUser = userRepository.save(user);
        return new UserResponse(updatedUser);
    }
    
    @Override
    public UserResponse suspendUser(String userId) {
        User user = findUserByIdOrThrow(userId);
        user.suspend();
        User updatedUser = userRepository.save(user);
        return new UserResponse(updatedUser);
    }
    
    @Override
    public void deleteUser(String userId) {
        User user = findUserByIdOrThrow(userId);
        userDomainService.validateUserDeletion(user);
        user.delete();
        userRepository.save(user);
    }
    
    @Override
    public UserResponse recordLogin(String userId) {
        User user = findUserByIdOrThrow(userId);
        user.recordLogin();
        User updatedUser = userRepository.save(user);
        return new UserResponse(updatedUser);
    }
    
    private User findUserByIdOrThrow(String userId) {
        return userRepository.findById(UserId.of(userId))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
    }
}