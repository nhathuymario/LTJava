package com.example.LTJava.review.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.LTJava.review.entity.ReviewAssignment;
import com.example.LTJava.review.entity.ReviewStatus;
import com.example.LTJava.review.repository.ReviewAssignmentRepository;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusStatus;
import com.example.LTJava.syllabus.repository.SyllabusRepository;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.repository.UserRepository;

@Service
@Transactional
public class ReviewAssignmentServiceImpl implements ReviewAssignmentService {

    private final ReviewAssignmentRepository repo;
    private final SyllabusRepository syllabusRepository;
    private final UserRepository userRepository;

    public ReviewAssignmentServiceImpl(
            ReviewAssignmentRepository repo,
            SyllabusRepository syllabusRepository,
            UserRepository userRepository
    ) {
        this.repo = repo;
        this.syllabusRepository = syllabusRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<ReviewAssignment> assignByUsernames(
            Long hodId,
            Long syllabusId,
            List<String> reviewerUsernames,
            LocalDateTime dueAt
    ) {
        if (reviewerUsernames == null || reviewerUsernames.isEmpty()) {
            throw new RuntimeException("Thiếu reviewerUsernames");
        }
        if (dueAt == null || !dueAt.isAfter(LocalDateTime.now())) {
            throw new RuntimeException("dueAt phải lớn hơn hiện tại");
        }

        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại"));

        // bạn yêu cầu: HOD set cộng tác khi syllabus là DRAFT
        if (syllabus.getStatus() != SyllabusStatus.DRAFT) {
            throw new RuntimeException("Chỉ assign review khi syllabus ở trạng thái DRAFT");
        }

        User hod = userRepository.findById(hodId)
                .orElseThrow(() -> new RuntimeException("HOD không tồn tại"));

        List<ReviewAssignment> created = new ArrayList<>();

        for (String raw : reviewerUsernames) {
            if (raw == null) continue;
            String username = raw.trim(); // username = cccd
            if (username.isEmpty()) continue;

            User reviewer = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Reviewer không tồn tại (username/cccd): " + username));

            // chặn assign trùng
            if (repo.existsBySyllabus_IdAndReviewer_Id(syllabusId, reviewer.getId())) continue;

            ReviewAssignment a = new ReviewAssignment();
            a.setSyllabus(syllabus);
            a.setReviewer(reviewer);
            a.setAssignedBy(hod);
            a.setDueAt(dueAt);
            a.setStatus(ReviewStatus.ASSIGNED);

            created.add(repo.save(a));
        }

        return created;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewAssignment> listForSyllabus(Long syllabusId) {
        return repo.findBySyllabus_IdOrderByCreatedAtDesc(syllabusId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewAssignment> myAssignments(Long reviewerId, ReviewStatus statusOrNull) {
        if (statusOrNull == null) {
            return repo.findByReviewer_IdOrderByDueAtAsc(reviewerId);
        }
        return repo.findByReviewer_IdAndStatusOrderByDueAtAsc(reviewerId, statusOrNull);
    }

    @Override
    public ReviewAssignment start(Long reviewerId, Long assignmentId) {
        ReviewAssignment a = repo.findByIdAndReviewer_Id(assignmentId, reviewerId)
                .orElseThrow(() -> new RuntimeException("Assignment không tồn tại hoặc không thuộc bạn"));

        if (a.getStatus() == ReviewStatus.CANCELLED) throw new RuntimeException("Assignment đã bị huỷ");
        if (a.getStatus() == ReviewStatus.DONE) throw new RuntimeException("Assignment đã DONE");

        a.setStatus(ReviewStatus.IN_REVIEW);
        if (a.getStartedAt() == null) a.setStartedAt(LocalDateTime.now());
        return repo.save(a);
    }

    @Override
    public ReviewAssignment done(Long reviewerId, Long assignmentId) {
        ReviewAssignment a = repo.findByIdAndReviewer_Id(assignmentId, reviewerId)
                .orElseThrow(() -> new RuntimeException("Assignment không tồn tại hoặc không thuộc bạn"));

        if (a.getStatus() == ReviewStatus.CANCELLED) throw new RuntimeException("Assignment đã bị huỷ");
        if (a.getStatus() == ReviewStatus.DONE) return a;

        a.setStatus(ReviewStatus.DONE);
        a.setCompletedAt(LocalDateTime.now());
        if (a.getStartedAt() == null) a.setStartedAt(LocalDateTime.now());
        return repo.save(a);
    }

    @Override
    public void cancel(Long hodId, Long assignmentId) {
        ReviewAssignment a = repo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment không tồn tại"));

        // tối thiểu: cho HOD cancel (bạn có thể check HOD ownership sau)
        a.setStatus(ReviewStatus.CANCELLED);
        repo.save(a);
    }
}
