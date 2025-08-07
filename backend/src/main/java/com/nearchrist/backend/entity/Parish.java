package com.nearchrist.backend.entity;

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
    private Diocese diocese;

    @ManyToOne
    @JoinColumn(name = "state_id")
    private State state;

    @OneToMany(mappedBy = "parish", cascade = CascadeType.ALL)
    @JsonManagedReference("parish-adorations")
    private List<Adoration> adorations;

    @OneToMany(mappedBy = "parish", cascade = CascadeType.ALL)
    @JsonManagedReference("parish-crusades")
    private List<Crusade> crusades;
}
