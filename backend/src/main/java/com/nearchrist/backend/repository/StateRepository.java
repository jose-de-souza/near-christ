package com.nearchrist.backend.repository;

import com.nearchrist.backend.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StateRepository extends JpaRepository<State, Long> {
}