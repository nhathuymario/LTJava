package com.example.LTJava.outcome.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "plo",
        uniqueConstraints = {
                @UniqueConstraint(name="uk_plo_scope_code", columnNames = {"scope_key", "code"})
        })
public class Plo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="scope_key", nullable = false, length = 50)
    private String scopeKey; // ví dụ: "KTPM_2025", "CNTT", "CTDT_SE_2026"

    @Column(nullable = false, length = 20)
    private String code; // PLO1, PLO2...

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Boolean active = true;

    // getter/setter

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getScopeKey() {
        return scopeKey;
    }

    public void setScopeKey(String scopeKey) {
        this.scopeKey = scopeKey;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
