package com.nearchrist.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(name = "dioceses")
public class Diocese {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dioceseId;

    @Column(nullable = false)
    private String dioceseName;

    private String dioceseStreetNo;

    private String dioceseStreetName;

    private String dioceseSuburb;

    private String diocesePostcode;

    private String diocesePhone;

    private String dioceseEmail;

    private String dioceseWebsite;

    @ManyToOne
    @JoinColumn(name = "state_id")
    @JsonBackReference
    private State state;

    @OneToMany(mappedBy = "diocese", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Parish> parishes;

    @OneToMany(mappedBy = "diocese", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Adoration> adorations;

    @OneToMany(mappedBy = "diocese", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Crusade> crusades;
}
