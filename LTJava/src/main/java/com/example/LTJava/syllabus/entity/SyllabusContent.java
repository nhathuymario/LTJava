package com.example.LTJava.syllabus.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "syllabus_contents")
public class SyllabusContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "syllabus_id", nullable = false, unique = true)
    private Syllabus syllabus;

    // JSON string từ FE (bảng nội dung theo tuần)
    @Column(columnDefinition = "TEXT")
    private String courseOutlineTable;

    // Mô tả phương pháp giảng dạy
    @Column(columnDefinition = "TEXT")
    private String teachingMethods;

    // JSON string: [{ "code": "CO1", "desc": "..." }]
    @Column(columnDefinition = "TEXT")
    private String courseOutcomes;

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

    public String getCourseOutlineTable() {
        return courseOutlineTable;
    }

    public void setCourseOutlineTable(String courseOutlineTable) {
        this.courseOutlineTable = courseOutlineTable;
    }

    public String getTeachingMethods() {
        return teachingMethods;
    }

    public void setTeachingMethods(String teachingMethods) {
        this.teachingMethods = teachingMethods;
    }

    public String getCourseOutcomes() {
        return courseOutcomes;
    }

    public void setCourseOutcomes(String courseOutcomes) {
        this.courseOutcomes = courseOutcomes;
    }
}
