package com.example.repository;

import com.example.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    @Query(nativeQuery = true, value = """
        SELECT *
        FROM users u
        WHERE u.status != 'DELETED'
        AND (
            :role = 'ALL'
            OR u.role = CAST(:role AS user_role)
        )
        """)
    List<Map<String, Object>> findUsersByRole(@Param("role") String role);

    // ✅ NEW METHOD (FOR LOGIN & SIGNUP)
    Optional<User> findByEmail(String email);

}
