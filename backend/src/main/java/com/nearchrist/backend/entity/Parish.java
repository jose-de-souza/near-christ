package com.nearchrist.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(name = "parishes")
public class Parish {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long parishId;

    @Column(nullable = false)
    private String parishName;

    private String parishStNumber;

    private String parishStName;

    private String parishSuburb;

    private String parishPostcode;

    private String parishPhone;

    private String parishEmail;

    private String parishWebsite;

    @ManyToOne
    @JoinColumn(name = "diocese_id")
    @JsonBackReference
    private Diocese diocese;

    @ManyToOne
    @JoinColumn(name = "state_id")
    @JsonBackReference
    private State state;

    @OneToMany(mappedBy = "parish", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Adoration> adorations;

    @OneToMany(mappedBy = "parish", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Crusade> crusades;
}
