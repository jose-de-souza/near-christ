package com.nearchrist.backend.repository;

import com.nearchrist.backend.entity.Crusade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CrusadeRepository extends JpaRepository<Crusade, Long> {
    @Query("SELECT c FROM Crusade c WHERE " +
            "(:stateId IS NULL OR c.state.stateId = :stateId) AND " +
            "(:dioceseId IS NULL OR c.diocese.dioceseId = :dioceseId) AND " +
            "(:parishId IS NULL OR c.parish.parishId = :parishId)")
    List<Crusade> findByFilters(
            @Param("stateId") Long stateId,
            @Param("dioceseId") Long dioceseId,
            @Param("parishId") Long parishId);
}