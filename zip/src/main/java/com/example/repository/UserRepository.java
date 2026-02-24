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
            WHERE CAST(u.status AS varchar) != 'DELETED'
            AND (
                :role = 'ALL'
                OR CAST(u.role AS varchar) = :role
            )
            """)
    List<Map<String, Object>> findUsersByRole(@Param("role") String role);

    // ✅ NEW METHOD (FOR LOGIN & SIGNUP)
    Optional<User> findByEmail(String email);

}
