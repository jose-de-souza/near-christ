package com.nearchrist.backend.repository;

import com.nearchrist.backend.entity.Adoration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdorationRepository extends JpaRepository<Adoration, Long> {
    @Query("SELECT a FROM Adoration a WHERE " +
            "(:stateId IS NULL OR a.state.stateId = :stateId) AND " +
            "(:dioceseId IS NULL OR a.diocese.dioceseId = :dioceseId) AND " +
            "(:parishId IS NULL OR a.parish.parishId = :parishId)")
    List<Adoration> findByFilters(
            @Param("stateId") Long stateId,
            @Param("dioceseId") Long dioceseId,
            @Param("parishId") Long parishId);
}