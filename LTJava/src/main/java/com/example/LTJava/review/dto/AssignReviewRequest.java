package com.example.LTJava.review.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AssignReviewRequest {
    private Long syllabusId;
    private List<String> reviewerUsernames; // username = cccd
    private LocalDateTime dueAt;

    public Long getSyllabusId() { return syllabusId; }
    public void setSyllabusId(Long syllabusId) { this.syllabusId = syllabusId; }

    public List<String> getReviewerUsernames() { return reviewerUsernames; }
    public void setReviewerUsernames(List<String> reviewerUsernames) { this.reviewerUsernames = reviewerUsernames; }

    public LocalDateTime getDueAt() { return dueAt; }
    public void setDueAt(LocalDateTime dueAt) { this.dueAt = dueAt; }
}
