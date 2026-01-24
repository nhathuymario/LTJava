package com.example.LTJava.outcome.entity;

import com.example.LTJava.syllabus.entity.Syllabus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter // Tự sinh Getter
@Setter // Tự sinh Setter
@NoArgsConstructor // Constructor không đối số
@AllArgsConstructor // Constructor đầy đủ đối số
@Entity
@Table(name = "clo")
public class CLO {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code; // CLO1...

    @Column(nullable = false, length = 2000)
    private String description;

    @ManyToOne(optional = false)
    @JoinColumn(name = "syllabus_id")
    private Syllabus syllabus;

    // getters/setters
}
