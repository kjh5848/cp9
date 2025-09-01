package com.cp9.infrastructure.web.user;

import com.cp9.application.user.dto.*;
import com.cp9.application.user.port.in.CreateUserUseCase;
import com.cp9.application.user.port.in.GetUserUseCase;
import com.cp9.application.user.port.in.UpdateUserUseCase;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 사용자 REST 컨트롤러
 * 사용자 관련 HTTP 요청을 처리하는 웹 어댑터
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    private final CreateUserUseCase createUserUseCase;
    private final GetUserUseCase getUserUseCase;
    private final UpdateUserUseCase updateUserUseCase;
    
    public UserController(CreateUserUseCase createUserUseCase, 
                         GetUserUseCase getUserUseCase,
                         UpdateUserUseCase updateUserUseCase) {
        this.createUserUseCase = createUserUseCase;
        this.getUserUseCase = getUserUseCase;
        this.updateUserUseCase = updateUserUseCase;
    }
    
    /**
     * 새 사용자 생성
     */
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserCommand command) {
        UserResponse response = createUserUseCase.createUser(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * 사용자 ID로 조회
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String userId) {
        return getUserUseCase.getUserById(userId)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 사용자명으로 조회
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username) {
        return getUserUseCase.getUserByUsername(username)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 이메일로 조회
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        return getUserUseCase.getUserByEmail(email)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 모든 사용자 조회
     */
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = getUserUseCase.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    /**
     * 활성 사용자 조회
     */
    @GetMapping("/active")
    public ResponseEntity<List<UserResponse>> getActiveUsers() {
        List<UserResponse> users = getUserUseCase.getActiveUsers();
        return ResponseEntity.ok(users);
    }
    
    /**
     * 사용자 프로필 업데이트
     */
    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable String userId,
                                                  @Valid @RequestBody UpdateUserCommand command) {
        // userId 경로 변수를 명령에 설정
        UpdateUserCommand updatedCommand = new UpdateUserCommand(userId, command.getDisplayName());
        UserResponse response = updateUserUseCase.updateUser(updatedCommand);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 사용자 이메일 변경
     */
    @PutMapping("/{userId}/email")
    public ResponseEntity<UserResponse> changeEmail(@PathVariable String userId,
                                                   @Valid @RequestBody ChangeEmailCommand command) {
        // userId 경로 변수를 명령에 설정
        ChangeEmailCommand updatedCommand = new ChangeEmailCommand(userId, command.getEmail());
        UserResponse response = updateUserUseCase.changeEmail(updatedCommand);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 사용자 활성화
     */
    @PutMapping("/{userId}/activate")
    public ResponseEntity<UserResponse> activateUser(@PathVariable String userId) {
        UserResponse response = updateUserUseCase.activateUser(userId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 사용자 비활성화
     */
    @PutMapping("/{userId}/deactivate")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable String userId) {
        UserResponse response = updateUserUseCase.deactivateUser(userId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 사용자 정지
     */
    @PutMapping("/{userId}/suspend")
    public ResponseEntity<UserResponse> suspendUser(@PathVariable String userId) {
        UserResponse response = updateUserUseCase.suspendUser(userId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 사용자 삭제 (소프트 삭제)
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        updateUserUseCase.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * 로그인 시간 기록
     */
    @PostMapping("/{userId}/login")
    public ResponseEntity<UserResponse> recordLogin(@PathVariable String userId) {
        UserResponse response = updateUserUseCase.recordLogin(userId);
        return ResponseEntity.ok(response);
    }
}