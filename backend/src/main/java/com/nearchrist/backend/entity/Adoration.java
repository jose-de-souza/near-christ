package com.nearchrist.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Entity
@Data
@Table(name = "adorations")
public class Adoration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long adorationId;

    @ManyToOne
    @JoinColumn(name = "state_id")
    @JsonBackReference("state-adorations")
    private State state;

    @ManyToOne
    @JoinColumn(name = "diocese_id")
    @JsonBackReference("diocese-adorations")
    private Diocese diocese;

    @ManyToOne
    @JoinColumn(name = "parish_id")
    @JsonBackReference("parish-adorations")
    private Parish parish;

    @Column(nullable = false)
    private String adorationType;

    private String adorationLocation;

    private String adorationLocationType;

    private String adorationDay;

    private LocalTime adorationStart;

    private LocalTime adorationEnd;
}
