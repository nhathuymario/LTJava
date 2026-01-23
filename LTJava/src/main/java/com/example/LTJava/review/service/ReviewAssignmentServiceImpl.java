package com.example.LTJava.review.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.LTJava.syllabus.entity.Notification;
import com.example.LTJava.syllabus.repository.NotificationRepository;
import com.example.LTJava.syllabus.service.AIService;
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
    private final NotificationRepository notificationRepository;
    private final AIService aiService;


    public ReviewAssignmentServiceImpl(
            ReviewAssignmentRepository repo,
            SyllabusRepository syllabusRepository,
            UserRepository userRepository,
            NotificationRepository notificationRepository,
            AIService aiService
    ) {
        this.repo = repo;
        this.syllabusRepository = syllabusRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.aiService = aiService;
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

        if (syllabus.getStatus() != SyllabusStatus.DRAFT) {
            throw new RuntimeException("Chỉ assign review khi syllabus ở trạng thái DRAFT");
        }

        User hod = userRepository.findById(hodId)
                .orElseThrow(() -> new RuntimeException("HOD không tồn tại"));

        List<ReviewAssignment> created = new ArrayList<>();

        for (String raw : reviewerUsernames) {
            if (raw == null) continue;
            String username = raw.trim();
            if (username.isEmpty()) continue;

            User reviewer = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException(
                            "Reviewer không tồn tại (username/cccd): " + username
                    ));

            // 1) Nếu đã có assignment cho (syllabus, reviewer) thì xử lý theo status
            var existingOpt = repo.findBySyllabus_IdAndReviewer_Id(syllabusId, reviewer.getId());

            if (existingOpt.isPresent()) {
                ReviewAssignment existing = existingOpt.get();

                // chặn nếu đang active
                if (existing.getStatus() == ReviewStatus.ASSIGNED || existing.getStatus() == ReviewStatus.IN_REVIEW) {
                    continue;
                }

                // DONE/CANCELLED -> "re-open" để review lại
                existing.setAssignedBy(hod);
                existing.setDueAt(dueAt);
                existing.setStatus(ReviewStatus.ASSIGNED);
                existing.setStartedAt(null);
                existing.setCompletedAt(null);

                ReviewAssignment saved = repo.save(existing);
                created.add(saved);

                String msgToReviewer = aiService.createRoleNotificationMessage(
                        "REVIEWER",
                        "Bạn được phân công review syllabus (lần tiếp theo)",
                        syllabus.getCourse().getName(),
                        syllabus.getTitle(),
                        syllabus.getVersion(),
                        "Deadline: " + dueAt,
                        syllabus.getId()
                );

                Notification n = new Notification();
                n.setUser(reviewer);
                n.setMessage(msgToReviewer);
                n.setRead(false);
                n.setCreatedAt(LocalDateTime.now());
                notificationRepository.save(n);

                continue;
            }

            // 2) Chưa có record -> tạo mới
            ReviewAssignment a = new ReviewAssignment();
            a.setSyllabus(syllabus);
            a.setReviewer(reviewer);
            a.setAssignedBy(hod);
            a.setDueAt(dueAt);
            a.setStatus(ReviewStatus.ASSIGNED);

            ReviewAssignment saved = repo.save(a);
            created.add(saved);

            String msgToReviewer = aiService.createRoleNotificationMessage(
                    "REVIEWER",
                    "Bạn được phân công review syllabus",
                    syllabus.getCourse().getName(),
                    syllabus.getTitle(),
                    syllabus.getVersion(),
                    "Deadline: " + dueAt,
                    syllabus.getId()
            );

            Notification n = new Notification();
            n.setUser(reviewer);
            n.setMessage(msgToReviewer);
            n.setRead(false);
            n.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(n);
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

    @Override
    @Transactional(readOnly = true)
    public List<ReviewAssignment> listAllForHod(
            Long courseId,
            Long syllabusId,
            ReviewStatus status,
            String reviewer,
            LocalDateTime fromDue,
            LocalDateTime toDue
    ) {
        return repo.searchForHod(courseId, syllabusId, status, reviewer, fromDue, toDue);
    }
}
