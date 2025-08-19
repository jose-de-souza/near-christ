package com.nearchrist.backend.repository;

import com.nearchrist.backend.entity.Adoration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdorationRepository extends JpaRepository<Adoration, Long> {
    @Query("SELECT a FROM Adoration a WHERE " +
            "(:state_id IS NULL OR a.state.stateId = :state_id) AND " +
            "(:diocese_id IS NULL OR a.diocese.dioceseId = :diocese_id) AND " +
            "(:parish_id IS NULL OR a.parish.parishId = :parish_id)")
    List<Adoration> findByFilters(
            @Param("state_id") Long stateId,
            @Param("diocese_id") Long dioceseId,
            @Param("parish_id") Long parishId);
}