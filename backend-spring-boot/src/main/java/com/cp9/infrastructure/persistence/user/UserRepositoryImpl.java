package com.cp9.infrastructure.persistence.user;

import com.cp9.domain.shared.vo.Email;
import com.cp9.domain.user.model.User;
import com.cp9.domain.user.model.UserId;
import com.cp9.domain.user.model.UserRepository;
import com.cp9.domain.user.model.UserStatus;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 사용자 레포지토리 구현체
 * 도메인 레포지토리 인터페이스를 JPA로 구현
 */
@Repository
public class UserRepositoryImpl implements UserRepository {
    
    private final UserJpaRepository jpaRepository;
    
    public UserRepositoryImpl(UserJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }
    
    @Override
    public User save(User user) {
        UserJpaEntity existingEntity = jpaRepository.findById(user.getId().getValue())
                .orElse(null);
        
        if (existingEntity != null) {
            existingEntity.updateFrom(user);
            return jpaRepository.save(existingEntity).toDomain();
        } else {
            UserJpaEntity newEntity = UserJpaEntity.from(user);
            return jpaRepository.save(newEntity).toDomain();
        }
    }
    
    @Override
    public Optional<User> findById(UserId userId) {
        return jpaRepository.findById(userId.getValue())
                .map(UserJpaEntity::toDomain);
    }
    
    @Override
    public Optional<User> findByUsername(String username) {
        return jpaRepository.findByUsername(username)
                .map(UserJpaEntity::toDomain);
    }
    
    @Override
    public Optional<User> findByEmail(Email email) {
        return jpaRepository.findByEmail(email.getValue())
                .map(UserJpaEntity::toDomain);
    }
    
    @Override
    public List<User> findAll() {
        return jpaRepository.findAll().stream()
                .map(UserJpaEntity::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<User> findByStatus(UserStatus status) {
        return jpaRepository.findByStatus(status).stream()
                .map(UserJpaEntity::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<User> findActiveUsers() {
        return jpaRepository.findActiveUsers().stream()
                .map(UserJpaEntity::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    public void delete(UserId userId) {
        jpaRepository.deleteById(userId.getValue());
    }
    
    @Override
    public boolean existsById(UserId userId) {
        return jpaRepository.existsById(userId.getValue());
    }
    
    @Override
    public boolean existsByUsername(String username) {
        return jpaRepository.existsByUsername(username);
    }
    
    @Override
    public boolean existsByEmail(Email email) {
        return jpaRepository.existsByEmail(email.getValue());
    }
    
    @Override
    public long count() {
        return jpaRepository.count();
    }
    
    @Override
    public long countByStatus(UserStatus status) {
        return jpaRepository.countByStatus(status);
    }
}