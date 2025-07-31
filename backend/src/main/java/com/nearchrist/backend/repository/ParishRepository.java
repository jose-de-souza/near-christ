package com.nearchrist.backend.repository;

import com.nearchrist.backend.entity.Parish;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParishRepository extends JpaRepository<Parish, Long> {
}