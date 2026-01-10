package com.example.LTJava.syllabus.entity;

import com.example.LTJava.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "syllabus")
public class Syllabus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mỗi syllabus thuộc 1 course
    @ManyToOne(optional = false)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(nullable = false, length = 255)
    private String title;              // tên giáo trình / đề cương

    @Column(length = 4000)
    private String description;        // mô tả ngắn

    @Column(length = 20)
    private String academicYear;       // 2025-2026

    @Column(length = 20)
    private String semester;           // HK1, HK2,...

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SyllabusStatus status = SyllabusStatus.DRAFT;

    private Integer version = 1;       // v1, v2,... (sau này tăng)

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;            // giảng viên tạo

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Syllabus() {
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // getters & setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public SyllabusStatus getStatus() {
        return status;
    }

    public void setStatus(SyllabusStatus status) {
        this.status = status;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    @Column(columnDefinition = "TEXT")
    private String keywords;

    // --- Getter & Setter cho Keywords ---
    public String getKeywords() { return keywords; }

    public void setKeywords(String keywords) { this.keywords = keywords; }

    // --- GETTER & SETTER CHO AI SUMMARY ---
    public String getAiSummary() {
        return aiSummary;
    }

    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }
}
