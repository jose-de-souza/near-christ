package com.nearchrist.backend.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(name = "states")
public class State {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long stateId;

    @Column(nullable = false)
    private String stateName;

    private String stateAbbreviation;

    @OneToMany(mappedBy = "state", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Diocese> dioceses;

    @OneToMany(mappedBy = "state", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Parish> parishes;

    @OneToMany(mappedBy = "state", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Adoration> adorations;

    @OneToMany(mappedBy = "state", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Crusade> crusades;
}
