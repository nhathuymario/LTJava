package com.example.LTJava.outcome.entity;

import com.example.LTJava.syllabus.entity.Syllabus;
import jakarta.persistence.*;

@Entity
@Table(name = "clo",
        uniqueConstraints = {
                @UniqueConstraint(name="uk_clo_syllabus_code", columnNames = {"syllabus_id", "code"})
        })
public class Clo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "syllabus_id", nullable = false)
    private Syllabus syllabus;

    @Column(nullable = false, length = 20)
    private String code; // CLO1, CLO2...

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(length = 20)
    private String domain; // optional: K/S/A hoặc Bloom

    private Integer weight; // optional

    @Column(nullable = false)
    private Boolean active = true;

    // getter/setter

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Syllabus getSyllabus() {
        return syllabus;
    }

    public void setSyllabus(Syllabus syllabus) {
        this.syllabus = syllabus;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
