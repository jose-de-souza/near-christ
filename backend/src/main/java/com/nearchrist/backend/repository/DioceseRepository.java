package com.nearchrist.backend.repository;

import com.nearchrist.backend.entity.Diocese;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DioceseRepository extends JpaRepository<Diocese, Long> {
}