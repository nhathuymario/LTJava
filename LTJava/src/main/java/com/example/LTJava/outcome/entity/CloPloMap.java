package com.example.LTJava.outcome.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "clo_plo_map",
        uniqueConstraints = {
                @UniqueConstraint(name="uk_map_clo_plo", columnNames = {"clo_id", "plo_id"})
        })
public class CloPloMap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "clo_id", nullable = false)
    private Clo clo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "plo_id", nullable = false)
    private Plo plo;

    // level: I (1), R (2), M (3) - Introduced, Reinforced, Mastered
    @Enumerated(EnumType.ORDINAL)
    @Column(nullable = true)
    private MappingLevel level;

    // getter/setter

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Clo getClo() {
        return clo;
    }

    public void setClo(Clo clo) {
        this.clo = clo;
    }

    public Plo getPlo() {
        return plo;
    }

    public void setPlo(Plo plo) {
        this.plo = plo;
    }

    public Integer getLevel() {
        return level == null ? null : level.value;
    }

    public void setLevel(Integer levelValue) {
        if (levelValue == null) {
            this.level = null;
        } else {
            try {
                this.level = MappingLevel.fromValue(levelValue);
            } catch (IllegalArgumentException ex) {
                // Gracefully ignore invalid values to avoid server errors
                this.level = null;
            }
        }
    }

    public void setLevel(MappingLevel level) {
        this.level = level;
    }

    public MappingLevel getMappingLevel() {
        return level;
    }
}
