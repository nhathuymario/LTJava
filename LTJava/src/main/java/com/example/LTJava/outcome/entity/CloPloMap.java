package com.example.LTJava.outcome.entity;

import jakarta.persistence.*;

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

    // optional: 1-3 hoặc null
    private Integer level;

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
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }
}
