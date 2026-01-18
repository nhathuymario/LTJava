package com.example.LTJava.syllabus.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;           // CS101, IT231...

    @Column(nullable = false, length = 255)
    private String name;           // Introduction to Programming

    @Column(name = "academic_year", length = 20)
    private String academicYear; // vd: "2025-2026"

    @Column(name = "semester", length = 20)
    private String semester;     // vd: "1" | "2" | "Summer"

    private Integer credits;       // số tín chỉ

    private String department;     // tên khoa, tạm đơn giản

    public Course() {}

    // --- PHẦN THÊM MỚI QUAN HỆ MÔN HỌC ---

    // 1. Môn Tiên quyết (Prerequisites)
    @ManyToMany
    @JoinTable(
            name = "course_prerequisites", // Tên bảng trong SQL
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "prerequisite_id")
    )
    @JsonIgnoreProperties("prerequisites") // Tránh đệ quy nếu môn kia cũng trỏ ngược lại
    private Set<Course> prerequisites;

    // 2. Môn Song hành (Parallel)
    @ManyToMany
    @JoinTable(
            name = "course_parallel",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "parallel_id")
    )
    @JsonIgnoreProperties("parallelCourses")
    private Set<Course> parallelCourses;

    // 3. Môn Bổ trợ (Supplementary)
    @ManyToMany
    @JoinTable(
            name = "course_supplementary",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "supplementary_id")
    )
    @JsonIgnoreProperties("supplementaryCourses")
    private Set<Course> supplementaryCourses;

    // getters & setters
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Set<Course> getPrerequisites() {
        return prerequisites;
    }

    public void setPrerequisites(Set<Course> prerequisites) {
        this.prerequisites = prerequisites;
    }

    public Set<Course> getParallelCourses() {
        return parallelCourses;
    }

    public void setParallelCourses(Set<Course> parallelCourses) {
        this.parallelCourses = parallelCourses;
    }

    public Set<Course> getSupplementaryCourses() {
        return supplementaryCourses;
    }

    public void setSupplementaryCourses(Set<Course> supplementaryCourses) {
        this.supplementaryCourses = supplementaryCourses;
    }
}
