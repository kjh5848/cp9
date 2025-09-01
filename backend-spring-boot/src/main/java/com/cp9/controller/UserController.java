package com.cp9.controller;

import com.cp9.dto.UserDto;
import com.cp9.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * 사용자 컨트롤러 (Controller Layer)
 * HTTP 요청을 받아 서비스 계층에 위임하고 응답을 반환하는 프레젠테이션 계층
 * REST API 엔드포인트를 제공
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 새 사용자 생성
     * POST /api/users
     */
    @PostMapping
    public ResponseEntity<UserDto.Response> createUser(@Valid @RequestBody UserDto.CreateRequest request) {
        UserDto.Response response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 사용자 ID로 조회
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDto.Response> getUserById(@PathVariable Long id) {
        UserDto.Response response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 이메일로 사용자 조회
     * GET /api/users/email/{email}
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDto.Response> getUserByEmail(@PathVariable String email) {
        UserDto.Response response = userService.getUserByEmail(email);
        return ResponseEntity.ok(response);
    }

    /**
     * 모든 사용자 조회 (페이징 지원)
     * GET /api/users?page=0&size=10&sort=createdAt,desc
     */
    @GetMapping
    public ResponseEntity<Page<UserDto.Summary>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserDto.Summary> response = userService.getAllUsers(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * 활성 사용자만 조회 (페이징 지원)
     * GET /api/users/active?page=0&size=10
     */
    @GetMapping("/active")
    public ResponseEntity<Page<UserDto.Summary>> getActiveUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
            
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserDto.Summary> response = userService.getActiveUsers(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * 이름으로 사용자 검색
     * GET /api/users/search?name=김철수
     */
    @GetMapping("/search")
    public ResponseEntity<List<UserDto.Summary>> searchUsers(@RequestParam String name) {
        List<UserDto.Summary> response = userService.searchUsersByName(name);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자 정보 업데이트
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserDto.Response> updateUser(
            @PathVariable Long id, 
            @Valid @RequestBody UserDto.UpdateRequest request) {
        UserDto.Response response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자 활성화
     * PATCH /api/users/{id}/activate
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<UserDto.Response> activateUser(@PathVariable Long id) {
        UserDto.Response response = userService.activateUser(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자 비활성화
     * PATCH /api/users/{id}/deactivate
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<UserDto.Response> deactivateUser(@PathVariable Long id) {
        UserDto.Response response = userService.deactivateUser(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자 삭제 (소프트 삭제)
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "사용자가 성공적으로 삭제되었습니다."));
    }

    /**
     * 사용자 완전 삭제 (물리적 삭제)
     * DELETE /api/users/{id}/permanent
     */
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Map<String, String>> permanentDeleteUser(@PathVariable Long id) {
        userService.permanentDeleteUser(id);
        return ResponseEntity.ok(Map.of("message", "사용자가 완전히 삭제되었습니다."));
    }

    /**
     * 활성 사용자 수 조회
     * GET /api/users/count/active
     */
    @GetMapping("/count/active")
    public ResponseEntity<Map<String, Long>> getActiveUserCount() {
        long count = userService.getActiveUserCount();
        return ResponseEntity.ok(Map.of("activeUserCount", count));
    }

    /**
     * 이메일 중복 확인
     * GET /api/users/check-email?email=test@example.com
     */
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmailExists(@RequestParam String email) {
        boolean exists = userService.isEmailExists(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    /**
     * 서버 상태 확인용 헬스체크 엔드포인트
     * GET /api/users/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "UserService",
            "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }
}