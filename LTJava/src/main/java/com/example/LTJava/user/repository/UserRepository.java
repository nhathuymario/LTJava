package com.example.LTJava.user.repository;

import com.example.LTJava.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByCccd(String cccd);
    Optional<User> findByUsername(String username);

    // ✅ thêm cái này để load kèm roles (tránh LazyInitializationException)
    @Query("""
        select u from User u
        left join fetch u.roles
        where u.username = :username
    """)
    Optional<User> findByUsernameFetchRoles(@Param("username") String username);

    boolean existsByUsername(String username);
    boolean existsByCccd(String cccd);
}
