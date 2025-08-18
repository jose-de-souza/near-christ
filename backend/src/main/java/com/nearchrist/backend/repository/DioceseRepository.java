package com.nearchrist.backend.repository;

import com.nearchrist.backend.entity.Diocese;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DioceseRepository extends JpaRepository<Diocese, Long> {

    @Query("SELECT DISTINCT d FROM Diocese d LEFT JOIN FETCH d.parishes p LEFT JOIN FETCH p.state")
    List<Diocese> findAllWithParishes();

    @Query("SELECT DISTINCT d FROM Diocese d LEFT JOIN FETCH d.parishes p LEFT JOIN FETCH p.state WHERE d.dioceseId = :id")
    Optional<Diocese> findByIdWithParishes(@Param("id") Long id);
}