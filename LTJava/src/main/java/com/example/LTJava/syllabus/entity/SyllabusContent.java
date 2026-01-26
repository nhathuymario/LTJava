package com.example.LTJava.syllabus.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "syllabus_contents")
public class SyllabusContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "syllabus_id", nullable = false, unique = true)
    private Syllabus syllabus;

    // General Info (JSON)
    @Column(name = "general_info", columnDefinition = "LONGTEXT")
    private String generalInfo;

    // Mô tả tóm tắt học phần
    @Column(name = "description", columnDefinition = "LONGTEXT")
    private String description;

    // Course Objectives (JSON array)
    @Column(name = "course_objectives", columnDefinition = "LONGTEXT")
    private String courseObjectives;

    // Course Learning Outcomes (JSON array)
    @Column(name = "course_learning_outcomes", columnDefinition = "LONGTEXT")
    private String courseLearningOutcomes;

    // CLO-PLO Mappings (JSON array)
    @Column(name = "clo_mappings", columnDefinition = "LONGTEXT")
    private String cloMappings;

    // Student Duties
    @Column(name = "student_duties", columnDefinition = "LONGTEXT")
    private String studentDuties;

    // Assessment Methods (JSON array)
    @Column(name = "assessment_methods", columnDefinition = "LONGTEXT")
    private String assessmentMethods;

    // Teaching Plan (JSON array)
    @Column(name = "teaching_plan", columnDefinition = "LONGTEXT")
    private String teachingPlan;

    // Course Outline Table (JSON array - lưu chi tiết tuần/nội dung/cách dạy/đánh giá)
    @Column(name = "course_outline_table", columnDefinition = "LONGTEXT")
    private String courseOutlineTable;

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

    public String getGeneralInfo() {
        return generalInfo;
    }

    public void setGeneralInfo(String generalInfo) {
        this.generalInfo = generalInfo;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCourseObjectives() {
        return courseObjectives;
    }

    public void setCourseObjectives(String courseObjectives) {
        this.courseObjectives = courseObjectives;
    }

    public String getCourseLearningOutcomes() {
        return courseLearningOutcomes;
    }

    public void setCourseLearningOutcomes(String courseLearningOutcomes) {
        this.courseLearningOutcomes = courseLearningOutcomes;
    }

    public String getCloMappings() {
        return cloMappings;
    }

    public void setCloMappings(String cloMappings) {
        this.cloMappings = cloMappings;
    }

    public String getStudentDuties() {
        return studentDuties;
    }

    public void setStudentDuties(String studentDuties) {
        this.studentDuties = studentDuties;
    }

    public String getAssessmentMethods() {
        return assessmentMethods;
    }

    public void setAssessmentMethods(String assessmentMethods) {
        this.assessmentMethods = assessmentMethods;
    }

    public String getTeachingPlan() {
        return teachingPlan;
    }

    public void setTeachingPlan(String teachingPlan) {
        this.teachingPlan = teachingPlan;
    }
}
