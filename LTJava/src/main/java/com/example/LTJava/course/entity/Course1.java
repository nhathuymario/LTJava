package com.example.LTJava.course.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "courses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Course1 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;      // VD: CS101

    @Column(nullable = false)
    private String name;      // VD: Intro to Programming

    private Integer credits;  // VD: 3
    private String department; // VD: CS

    @Column(nullable = false)
    private Long lecturerId;

    @Column(nullable = false)
    private String lecturerUsername;

}
