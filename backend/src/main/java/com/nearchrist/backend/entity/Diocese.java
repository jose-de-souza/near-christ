package com.nearchrist.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    @OneToMany(mappedBy = "diocese", cascade = CascadeType.ALL)
    @JsonManagedReference("diocese-parishes")
    @JsonIgnoreProperties("diocese")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private List<Parish> parishes;
    @OneToMany(mappedBy = "diocese", cascade = CascadeType.ALL)
    @JsonManagedReference("diocese-adorations")
    private List<Adoration> adorations;
    @OneToMany(mappedBy = "diocese", cascade = CascadeType.ALL)
    @JsonManagedReference("diocese-crusades")
    private List<Crusade> crusades;
}
