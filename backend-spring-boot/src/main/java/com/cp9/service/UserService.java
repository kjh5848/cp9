package com.cp9.service;

import com.cp9.dto.UserDto;
import com.cp9.entity.User;
import com.cp9.exception.ResourceNotFoundException;
import com.cp9.exception.BusinessException;
import com.cp9.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 사용자 서비스 클래스 (Service Layer)
 * 비즈니스 로직을 처리하고 트랜잭션을 관리
 * Controller와 Repository 사이에서 비즈니스 규칙을 담당
 */
@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 새 사용자 생성
     * @param request 사용자 생성 요청 DTO
     * @return 생성된 사용자 응답 DTO
     */
    @Transactional
    public UserDto.Response createUser(UserDto.CreateRequest request) {
        // 비즈니스 규칙: 이메일 중복 검사
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("이미 존재하는 이메일입니다: " + request.getEmail());
        }

        // Entity 생성 및 저장 (Builder 패턴 사용)
        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .username(request.getEmail()) // 이메일을 기본 사용자명으로 사용
                .password("temp-password") // 임시 비밀번호 (실제로는 회원가입 시 암호화된 비밀번호 설정 필요)
                .active(true)
                .enabled(false) // 이메일 인증 후 활성화
                .build();
        User savedUser = userRepository.save(user);

        return convertToResponse(savedUser);
    }

    /**
     * 사용자 ID로 조회
     * @param id 사용자 ID
     * @return 사용자 응답 DTO
     */
    public UserDto.Response getUserById(Long id) {
        User user = findUserById(id);
        return convertToResponse(user);
    }

    /**
     * 이메일로 사용자 조회
     * @param email 사용자 이메일
     * @return 사용자 응답 DTO
     */
    public UserDto.Response getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + email));
        return convertToResponse(user);
    }

    /**
     * 모든 사용자 조회 (페이징)
     * @param pageable 페이징 정보
     * @return 페이징된 사용자 목록
     */
    public Page<UserDto.Summary> getAllUsers(Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable);
        List<UserDto.Summary> summaries = userPage.getContent().stream()
                .map(this::convertToSummary)
                .collect(Collectors.toList());
        return new PageImpl<>(summaries, pageable, userPage.getTotalElements());
    }

    /**
     * 활성 사용자만 조회 (페이징)
     * @param pageable 페이징 정보
     * @return 페이징된 활성 사용자 목록
     */
    public Page<UserDto.Summary> getActiveUsers(Pageable pageable) {
        Page<User> userPage = userRepository.findByActive(true, pageable);
        List<UserDto.Summary> summaries = userPage.getContent().stream()
                .map(this::convertToSummary)
                .collect(Collectors.toList());
        return new PageImpl<>(summaries, pageable, userPage.getTotalElements());
    }

    /**
     * 이름으로 사용자 검색
     * @param name 검색할 이름
     * @return 검색된 사용자 목록
     */
    public List<UserDto.Summary> searchUsersByName(String name) {
        List<User> users = userRepository.findByNameContainingIgnoreCaseAndActive(name, true);
        return users.stream()
                .map(this::convertToSummary)
                .collect(Collectors.toList());
    }

    /**
     * 사용자 정보 업데이트
     * @param id 사용자 ID
     * @param request 업데이트 요청 DTO
     * @return 업데이트된 사용자 응답 DTO
     */
    @Transactional
    public UserDto.Response updateUser(Long id, UserDto.UpdateRequest request) {
        User user = findUserById(id);

        // 이메일 변경 시 중복 검사
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BusinessException("이미 존재하는 이메일입니다: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        // 이름 변경
        if (request.getName() != null) {
            user.setName(request.getName());
        }

        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }

    /**
     * 사용자 활성화
     * @param id 사용자 ID
     * @return 활성화된 사용자 응답 DTO
     */
    @Transactional
    public UserDto.Response activateUser(Long id) {
        User user = findUserById(id);
        user.activate();
        User savedUser = userRepository.save(user);
        return convertToResponse(savedUser);
    }

    /**
     * 사용자 비활성화
     * @param id 사용자 ID
     * @return 비활성화된 사용자 응답 DTO
     */
    @Transactional
    public UserDto.Response deactivateUser(Long id) {
        User user = findUserById(id);
        user.deactivate();
        User savedUser = userRepository.save(user);
        return convertToResponse(savedUser);
    }

    /**
     * 사용자 삭제 (실제로는 비활성화)
     * @param id 사용자 ID
     */
    @Transactional
    public void deleteUser(Long id) {
        User user = findUserById(id);
        user.deactivate(); // 소프트 삭제 (비활성화)
        userRepository.save(user);
    }

    /**
     * 사용자 완전 삭제 (물리적 삭제)
     * @param id 사용자 ID
     */
    @Transactional
    public void permanentDeleteUser(Long id) {
        User user = findUserById(id);
        userRepository.delete(user);
    }

    /**
     * 활성 사용자 수 조회
     * @return 활성 사용자 총 개수
     */
    public long getActiveUserCount() {
        return userRepository.countActiveUsers();
    }

    /**
     * 이메일 중복 확인
     * @param email 확인할 이메일
     * @return 중복 여부 (true: 중복됨, false: 사용 가능)
     */
    public boolean isEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    // === Private Helper Methods ===

    /**
     * ID로 사용자 엔티티 조회 (내부 메서드)
     */
    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다. ID: " + id));
    }

    /**
     * Entity를 Response DTO로 변환
     */
    private UserDto.Response convertToResponse(User user) {
        return new UserDto.Response(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    /**
     * Entity를 Summary DTO로 변환
     */
    private UserDto.Summary convertToSummary(User user) {
        return new UserDto.Summary(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getActive()
        );
    }
}