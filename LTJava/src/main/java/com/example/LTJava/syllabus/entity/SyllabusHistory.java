package com.example.LTJava.syllabus.entity;

import com.example.LTJava.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "syllabus_history")
public class SyllabusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết với Syllabus gốc
    @ManyToOne
    @JoinColumn(name = "syllabus_id", nullable = false)
    private Syllabus syllabus;

    // Các trường dữ liệu cần lưu lịch sử
    private String title;

    @Column(length = 4000)
    private String description;

    private String academicYear;
    private String semester;

    @Enumerated(EnumType.STRING)
    private SyllabusStatus status;

    private Integer version; // Phiên bản tại thời điểm đó (v1, v2...)

    @ManyToOne
    @JoinColumn(name = "updated_by")
    private User updatedBy; // Ai là người sửa phiên bản này

    private LocalDateTime updatedAt;

    // Constructor, Getter, Setter
    public SyllabusHistory() {}

    // Constructor copy từ Syllabus sang History nhanh
    public SyllabusHistory(Syllabus s) {
        this.syllabus = s;
        this.title = s.getTitle();
        this.description = s.getDescription();
        this.academicYear = s.getAcademicYear();
        this.semester = s.getSemester();
        this.status = s.getStatus();
        this.version = s.getVersion();
        this.updatedBy = s.getCreatedBy(); // Hoặc người update cuối cùng
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Syllabus getSyllabus() { return syllabus; }
    public void setSyllabus(Syllabus syllabus) { this.syllabus = syllabus; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Integer getVersion() { return version; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public String getAcademicYear() {return academicYear;}
    public void setAcademicYear(String academicYear) {this.academicYear = academicYear;}
    public String getSemester() {return semester;}
    public void setSemester(String semester) {this.semester = semester;}
}