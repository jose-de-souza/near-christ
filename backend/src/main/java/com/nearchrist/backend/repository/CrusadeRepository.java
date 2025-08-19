package com.nearchrist.backend.repository;

import com.nearchrist.backend.entity.Crusade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CrusadeRepository extends JpaRepository<Crusade, Long> {
    @Query("SELECT c FROM Crusade c WHERE " +
            "(:state_id IS NULL OR c.state.stateId = :state_id) AND " +
            "(:diocese_id IS NULL OR c.diocese.dioceseId = :diocese_id) AND " +
            "(:parish_id IS NULL OR c.parish.parishId = :parish_id)")
    List<Crusade> findByFilters(
            @Param("state_id") Long stateId,
            @Param("diocese_id") Long dioceseId,
            @Param("parish_id") Long parishId);
}