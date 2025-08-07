package com.nearchrist.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Entity
@Data
@Table(name = "crusades")
public class Crusade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long crusadeId;

    @ManyToOne
    @JoinColumn(name = "state_id")
    @JsonBackReference
    private State state;

    @ManyToOne
    @JoinColumn(name = "diocese_id")
    @JsonBackReference("diocese-crusades")
    private Diocese diocese;

    @ManyToOne
    @JoinColumn(name = "parish_id")
    @JsonBackReference("parish-crusades")
    private Parish parish;

    private LocalTime confessionStartTime;

    private LocalTime confessionEndTime;

    private LocalTime massStartTime;

    private LocalTime massEndTime;

    private LocalTime crusadeStartTime;

    private LocalTime crusadeEndTime;

    private String contactName;

    private String contactPhone;

    private String contactEmail;

    private String comments;
}
