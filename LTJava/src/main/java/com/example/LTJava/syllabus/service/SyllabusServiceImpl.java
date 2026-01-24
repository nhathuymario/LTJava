package com.example.LTJava.syllabus.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import com.example.LTJava.syllabus.dto.CreateSyllabusRequest;
import com.example.LTJava.syllabus.dto.HodCourseGroupResponse;
import com.example.LTJava.syllabus.dto.SetCourseRelationsRequest;
import com.example.LTJava.syllabus.entity.Course;
import com.example.LTJava.syllabus.entity.Notification;
import com.example.LTJava.syllabus.entity.Subscription;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusHistory;
import com.example.LTJava.syllabus.entity.SyllabusStatus;
import com.example.LTJava.syllabus.exception.ResourceNotFoundException;
import com.example.LTJava.syllabus.repository.CourseRepository;
import com.example.LTJava.syllabus.repository.NotificationRepository;
import com.example.LTJava.syllabus.repository.SubscriptionRepository;
import com.example.LTJava.syllabus.repository.SyllabusHistoryRepository;
import com.example.LTJava.syllabus.repository.SyllabusRepository;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SyllabusServiceImpl implements SyllabusService {

    private final SyllabusRepository syllabusRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Autowired private SubscriptionRepository subRepo;
    @Autowired private NotificationRepository notiRepo;
    @Autowired private AIService aiService;
    @Autowired private SyllabusHistoryRepository historyRepository;

    public SyllabusServiceImpl(SyllabusRepository syllabusRepository,
                               CourseRepository courseRepository,
                               UserRepository userRepository) {
        this.syllabusRepository = syllabusRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // LECTURER
    // =========================

    @Override
    public Syllabus createSyllabus(CreateSyllabusRequest request, Long lecturerId) {

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Course không tồn tại với id=" + request.getCourseId()));

        User lecturer = userRepository.findById(lecturerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Lecturer không tồn tại với id=" + lecturerId));

        Syllabus syllabus = new Syllabus();
        syllabus.setCourse(course);
        syllabus.setTitle(request.getTitle());
        syllabus.setDescription(request.getDescription());
        syllabus.setAcademicYear(request.getAcademicYear());
        syllabus.setSemester(request.getSemester());
        syllabus.setStatus(SyllabusStatus.DRAFT);
        syllabus.setVersion(1);
        syllabus.setCreatedBy(lecturer);

        return syllabusRepository.save(syllabus);
    }

    @Override
    public Syllabus updateSyllabus(Long syllabusId, CreateSyllabusRequest request, Long lecturerId) {
        Syllabus syllabus = syllabusRepository.findByIdAndCreatedBy_Id(syllabusId, lecturerId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại hoặc không thuộc quyền của bạn"));

        // ✅ chỉ cho sửa khi DRAFT
        if (syllabus.getStatus() != SyllabusStatus.DRAFT) {
            throw new RuntimeException("Chỉ syllabus ở trạng thái DRAFT mới được chỉnh sửa");
        }

        syllabus.setTitle(request.getTitle());
        syllabus.setDescription(request.getDescription());
        syllabus.setAcademicYear(request.getAcademicYear());
        syllabus.setSemester(request.getSemester());

        return syllabusRepository.save(syllabus);
    }

    @Override
    public void deleteSyllabus(Long syllabusId, Long lecturerId) {
        Syllabus syllabus = syllabusRepository.findByIdAndCreatedBy_Id(syllabusId, lecturerId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại hoặc không thuộc quyền của bạn"));

        // ✅ chỉ cho xóa khi DRAFT
        if (syllabus.getStatus() != SyllabusStatus.DRAFT) {
            throw new RuntimeException("Chỉ syllabus ở trạng thái DRAFT mới được xóa");
        }

        // ✅ nếu có syllabus_history FK -> syllabus thì cần xóa history trước (nếu không cascade)
        historyRepository.deleteBySyllabusId(syllabusId);

        syllabusRepository.delete(syllabus);
    }

    @Override
    public Syllabus submitSyllabus(Long syllabusId, Long lecturerId) {
        Syllabus syllabus = syllabusRepository.findByIdAndCreatedBy_Id(syllabusId, lecturerId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại hoặc không thuộc quyền của bạn"));

        if (syllabus.getStatus() != SyllabusStatus.DRAFT) {
            throw new RuntimeException("Chỉ syllabus ở trạng thái DRAFT mới được submit");
        }

        saveHistory(syllabus);
        syllabus.setStatus(SyllabusStatus.SUBMITTED);
        Syllabus saved = syllabusRepository.save(syllabus);

        // Notify HOD
        String msgToHod = aiService.createRoleNotificationMessage(
                "HOD",
                "Có syllabus mới cần duyệt (SUBMITTED)",
                saved.getCourse().getName(),
                saved.getTitle(),
                saved.getVersion(),
                null,
                saved.getId()
        );
        notifyRole("HOD", msgToHod);

        return saved;
    }

    @Override
    public Syllabus resubmitSyllabus(Long syllabusId, Long lecturerId) {
        Syllabus syllabus = syllabusRepository.findByIdAndCreatedBy_Id(syllabusId, lecturerId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại hoặc không thuộc quyền của bạn"));

        if (syllabus.getStatus() != SyllabusStatus.REQUESTEDIT
                && syllabus.getStatus() != SyllabusStatus.REJECTED) {
            throw new RuntimeException("Chỉ syllabus REQUESTEDIT hoặc REJECTED mới được resubmit");
        }

        syllabus.setStatus(SyllabusStatus.SUBMITTED);
        syllabus.setEditNote(null);

        Syllabus saved = syllabusRepository.save(syllabus);

        // Notify HOD (resubmitted)
        String msgToHod = aiService.createRoleNotificationMessage(
                "HOD",
                "Lecturer đã resubmit syllabus, cần duyệt lại",
                saved.getCourse().getName(),
                saved.getTitle(),
                saved.getVersion(),
                null,
                saved.getId()
        );
        notifyRole("HOD", msgToHod);

        return saved;
    }

    @Override
    public Syllabus moveToDraftForEdit(Long syllabusId, Long lecturerId) {
        Syllabus syllabus = syllabusRepository.findByIdAndCreatedBy_Id(syllabusId, lecturerId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại hoặc không thuộc quyền của bạn"));

        if (syllabus.getStatus() != SyllabusStatus.REQUESTEDIT) {
            throw new RuntimeException("Chỉ syllabus REQUESTEDIT mới được chuyển về DRAFT để chỉnh sửa");
        }

        syllabus.setStatus(SyllabusStatus.DRAFT);
        return syllabusRepository.save(syllabus);
    }

    @Override
    public Syllabus createNewVersion(Long syllabusId, Long lecturerId) {
        Syllabus syllabus = syllabusRepository.findByIdAndCreatedBy_Id(syllabusId, lecturerId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại hoặc không thuộc quyền của bạn"));

        if (syllabus.getStatus() != SyllabusStatus.PUBLISHED) {
            throw new RuntimeException("Chỉ syllabus ở trạng thái PUBLISHED mới được tạo version mới");
        }

        saveHistory(syllabus);

        syllabus.setVersion(syllabus.getVersion() + 1);
        syllabus.setStatus(SyllabusStatus.DRAFT);

        syllabus.setEditNote(null);
        syllabus.setAiSummary(null);
        syllabus.setKeywords(null);

        return syllabusRepository.save(syllabus);
    }

    @Override
    public List<Syllabus> getMySyllabus(Long lecturerId) {
        return syllabusRepository.findByCreatedBy_Id(lecturerId);
    }

    // =========================
    // QUERY
    // =========================

    @Override
    public List<Syllabus> getAll() {
        return syllabusRepository.findAll();
    }

    @Override
    public Syllabus getById(Long id) {
        return syllabusRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại"));
    }

    @Override
    public List<Syllabus> getByCourseId(Long courseId) {
        return syllabusRepository.findByCourseId(courseId);
    }

    @Override
    public List<Syllabus> getByStatus(SyllabusStatus status) {
        return syllabusRepository.findByStatus(status);
    }

    @Override
    public List<Syllabus> getSyllabusByStatus(SyllabusStatus status) {
        return syllabusRepository.findByStatus(status);
    }

    // =========================
    // HOD
    // =========================

    @Transactional(readOnly = true)
    public List<HodCourseGroupResponse> listCoursesHavingSyllabusStatus(SyllabusStatus status) {
        return syllabusRepository.groupCoursesBySyllabusStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Syllabus> getByCourseAndStatus(Long courseId, SyllabusStatus status) {
        return syllabusRepository.findByCourse_IdAndStatus(courseId, status);
    }

    @Override
    public Syllabus approveByHod(Long syllabusId, Long hodId) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại"));

        if (syllabus.getStatus() != SyllabusStatus.SUBMITTED) {
            throw new RuntimeException("Chỉ syllabus SUBMITTED mới được HoD duyệt");
        }

        syllabus.setStatus(SyllabusStatus.HOD_APPROVED);
        Syllabus saved = syllabusRepository.save(syllabus);

        // Notify AA
        String msgToAa = aiService.createRoleNotificationMessage(
                "AA",
                "Syllabus đã được HOD duyệt, cần AA thẩm định",
                saved.getCourse().getName(),
                saved.getTitle(),
                saved.getVersion(),
                null,
                saved.getId()
        );
        notifyRole("AA", msgToAa);

        // Notify Lecturer
        String msgToLecturer = aiService.createRoleNotificationMessage(
                "LECTURER",
                "Syllabus của bạn đã được HOD duyệt và chuyển sang AA",
                saved.getCourse().getName(),
                saved.getTitle(),
                saved.getVersion(),
                null,
                saved.getId()
        );
        notifyLecturerOwner(saved, msgToLecturer);

        return saved;
    }

    @Override
    public Syllabus requestEditByHod(Long syllabusId, Long hodId, String editNote) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại"));

        if (syllabus.getStatus() != SyllabusStatus.SUBMITTED) {
            throw new RuntimeException("Chỉ syllabus SUBMITTED mới được yêu cầu chỉnh sửa");
        }

        if (editNote == null || editNote.trim().isEmpty()) {
            throw new RuntimeException("Nội dung yêu cầu chỉnh sửa không được để trống");
        }

        syllabus.setStatus(SyllabusStatus.REQUESTEDIT);
        syllabus.setEditNote(editNote);
        Syllabus saved = syllabusRepository.save(syllabus);

        String msgToLecturer = aiService.createRoleNotificationMessage(
                "LECTURER",
                "HOD yêu cầu chỉnh sửa syllabus (REQUESTEDIT)",
                saved.getCourse().getName(),
                saved.getTitle(),
                saved.getVersion(),
                editNote,
                saved.getId()
        );
        notifyLecturerOwner(saved, msgToLecturer);

        return saved;
    }

    @Override
    public Syllabus rejectByHod(Long syllabusId, Long hodId, String reason) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại"));

        if (syllabus.getStatus() != SyllabusStatus.SUBMITTED) {
            throw new RuntimeException("Chỉ syllabus SUBMITTED mới được HoD từ chối");
        }

        syllabus.setStatus(SyllabusStatus.REJECTED);
        syllabus.setEditNote(reason);
        Syllabus saved = syllabusRepository.save(syllabus);

        String msgToLecturer = aiService.createRoleNotificationMessage(
                "LECTURER",
                "Syllabus bị HOD từ chối (REJECTED)",
                saved.getCourse().getName(),
                saved.getTitle(),
                saved.getVersion(),
                reason,
                saved.getId()
        );
        notifyLecturerOwner(saved, msgToLecturer);

        return saved;
    }

    // =========================
    // AA
    // =========================

    @Override
    public void setCourseRelations(SetCourseRelationsRequest req) {
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course syllabus không tồn tại: " + req.getCourseId()));

        course.getPrerequisites().clear();
        course.getParallelCourses().clear();
        course.getSupplementaryCourses().clear();

        addMany(course.getPrerequisites(), req.getPrerequisiteIds(), req.getCourseId());
        addMany(course.getParallelCourses(), req.getParallelIds(), req.getCourseId());
        addMany(course.getSupplementaryCourses(), req.getSupplementaryIds(), req.getCourseId());

        courseRepository.save(course);
    }

    private void addMany(Set<Course> target, List<Long> ids, Long selfId) {
        if (ids == null) return;

        for (Long id : ids) {
            if (id == null) continue;
            if (id.equals(selfId)) continue;

            Course related = courseRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Related course không tồn tại: " + id));

            target.add(related);
        }
    }

    @Override
    public Syllabus approveByAa(Long syllabusId, Long aaId) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại"));

        if (syllabus.getStatus() != SyllabusStatus.HOD_APPROVED) {
            throw new RuntimeException("Chỉ syllabus HOD_APPROVED mới được AA duyệt");
        }

        syllabus.setStatus(SyllabusStatus.AA_APPROVED);
        Syllabus saved = syllabusRepository.save(syllabus);

        // Notify Principal
        String msgToPrincipal = aiService.createRoleNotificationMessage(
                "PRINCIPAL",
                "Syllabus đã qua AA, cần Principal duyệt",
                saved.getCourse().getName(),
                saved.getTitle(),
                saved.getVersion(),
                null,
                saved.getId()
        );
        notifyRole("PRINCIPAL", msgToPrincipal);

        // Notify Lecturer
        String msgToLecturer = aiService.createRoleNotificationMessage(
                "LECTURER",
                "Syllabus đã được AA duyệt và chuyển Principal",
                saved.getCourse().getName(),
                saved.getTitle(),
                saved.getVersion(),
                null,
                saved.getId()
        );
        notifyLecturerOwner(saved, msgToLecturer);

        return saved;
    }

    @Override
    public Syllabus rejectByAa(Long syllabusId, Long aaId, String reason) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại"));

        if (syllabus.getStatus() != SyllabusStatus.HOD_APPROVED
                && syllabus.getStatus() != SyllabusStatus.AA_APPROVED) {
            throw new RuntimeException("Chỉ syllabus HOD_APPROVED hoặc AA_APPROVED mới được AA từ chối");
        }

        syllabus.setStatus(SyllabusStatus.REJECTED);
        syllabus.setEditNote(reason);
        Syllabus saved = syllabusRepository.save(syllabus);

        String msgToLecturer = aiService.createRoleNotificationMessage(
                "LECTURER",
                "Syllabus bị AA từ chối (REJECTED)",
                saved.getCourse().getName(),
                saved.getTitle(),
                saved.getVersion(),
                reason,
                saved.getId()
        );
        notifyLecturerOwner(saved, msgToLecturer);

        return saved;
    }

    // =========================
    // PRINCIPAL
    // =========================

    @Override
    public Syllabus approveByPrincipal(Long syllabusId, Long principalId) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại"));

        if (syllabus.getStatus() != SyllabusStatus.AA_APPROVED) {
            throw new RuntimeException("Chỉ syllabus AA_APPROVED mới được Principal duyệt");
        }

        syllabus.setStatus(SyllabusStatus.PRINCIPAL_APPROVED);
        Syllabus saved = syllabusRepository.save(syllabus);
        saveHistory(saved);

        // Notify Lecturer
        String msgToLecturer = aiService.createRoleNotificationMessage(
                "LECTURER",
                "Syllabus đã được Principal duyệt (PRINCIPAL_APPROVED)",
                saved.getCourse().getName(),
                saved.getTitle(),
                saved.getVersion(),
                null,
                saved.getId()
        );
        notifyLecturerOwner(saved, msgToLecturer);

        return saved;
    }

    @Override
    public Syllabus rejectByPrincipal(Long syllabusId, Long principalId, String reason) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại"));

        if (syllabus.getStatus() != SyllabusStatus.AA_APPROVED
                && syllabus.getStatus() != SyllabusStatus.PRINCIPAL_APPROVED) {
            throw new RuntimeException("Chỉ syllabus AA_APPROVED hoặc PRINCIPAL_APPROVED mới được Principal reject");
        }

        syllabus.setStatus(SyllabusStatus.REJECTED);
        syllabus.setEditNote(reason);
        Syllabus saved = syllabusRepository.save(syllabus);

        // Notify Lecturer
        String msgToLecturer = aiService.createRoleNotificationMessage(
                "LECTURER",
                "Syllabus bị Principal từ chối (REJECTED)",
                saved.getCourse().getName(),
                saved.getTitle(),
                saved.getVersion(),
                reason,
                saved.getId()
        );
        notifyLecturerOwner(saved, msgToLecturer);

        return saved;
    }

    // =========================
    // PUBLISH
    // =========================

    @Override
    public Syllabus publish(Long syllabusId, Long principalId) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found"));

        if (syllabus.getStatus() != SyllabusStatus.PRINCIPAL_APPROVED) {
            throw new RuntimeException("Chỉ syllabus PRINCIPAL_APPROVED mới được publish");
        }

        syllabus.setStatus(SyllabusStatus.PUBLISHED);

        // 1) AI summary/keywords
        if (syllabus.getDescription() != null && syllabus.getDescription().trim().length() > 10) {
            try {
                String[] aiResult = aiService.processSyllabusContent(
                        syllabus.getTitle(),
                        syllabus.getDescription()
                );
                syllabus.setAiSummary(aiResult[0]);
                syllabus.setKeywords(aiResult[1]);
            } catch (Exception e) {
                System.out.println("AI Service Error: " + e.getMessage());
            }
        }

        // 2) Noti content for student subscribers
        String summaryForNoti = syllabus.getAiSummary();
        if (summaryForNoti == null || summaryForNoti.isBlank()) {
            summaryForNoti = "có cập nhật mới";
        }

        String notiContent = aiService.createNotificationMessage(
                syllabus.getCourse().getName(),
                summaryForNoti,
                syllabus.getVersion()
        );

        // 3) Send to subscribers
        List<Subscription> subs = subRepo.findByCourse_Id(syllabus.getCourse().getId());
        for (Subscription sub : subs) {
            notiRepo.save(new Notification(sub.getUser(), notiContent));
        }

        // 4) Save syllabus + history
        Syllabus saved = syllabusRepository.save(syllabus);
        saveHistory(saved);

        // 5) Staff notifications (optional but per your requirement)
        String msgToLecturer = aiService.createRoleNotificationMessage(
                "LECTURER",
                "Syllabus đã được publish",
                saved.getCourse().getName(),
                saved.getTitle(),
                saved.getVersion(),
                null,
                saved.getId()
        );
        notifyLecturerOwner(saved, msgToLecturer);

        String msgToHod = aiService.createRoleNotificationMessage(
                "HOD",
                "Syllabus đã được publish",
                saved.getCourse().getName(),
                saved.getTitle(),
                saved.getVersion(),
                null,
                saved.getId()
        );
        notifyRole("HOD", msgToHod);

        String msgToAa = aiService.createRoleNotificationMessage(
                "AA",
                "Syllabus đã được publish",
                saved.getCourse().getName(),
                saved.getTitle(),
                saved.getVersion(),
                null,
                saved.getId()
        );
        notifyRole("AA", msgToAa);

        return saved;
    }

    // =========================
    // STUDENT
    // =========================

    @Override
    public List<Syllabus> searchSyllabus(String keyword, String year, String semester) {
        return syllabusRepository.searchForStudent(keyword, year, semester);
    }

    @Override
    public Syllabus getSyllabusDetailPublic(Long id) {
        Syllabus syllabus = syllabusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found"));

        if (syllabus.getStatus() != SyllabusStatus.PUBLISHED) {
            throw new ResourceNotFoundException("Syllabus is not available publicly.");
        }
        return syllabus;
    }

    // =========================
    // STUDENT - MY COURSES
    // =========================

    @Override
    public List<Course> getMySubscribedCourses(Long userId) {
        List<Subscription> subs = subRepo.findByUser_Id(userId);

        List<Course> courses = new ArrayList<>();
        for (Subscription s : subs) {
            courses.add(s.getCourse());
        }
        return courses;
    }

    @Override
    public List<Syllabus> getPublishedByCourseForStudent(Long userId, Long courseId) {
        if (!subRepo.existsByUser_IdAndCourse_Id(userId, courseId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn chưa đăng ký môn này");
        }

        return syllabusRepository.findByCourse_IdAndStatus(courseId, SyllabusStatus.PUBLISHED);
    }

    // =========================
    // HISTORY
    // =========================

    @Override
    public List<SyllabusHistory> getHistory(Long syllabusId) {
        return historyRepository.findBySyllabusIdOrderByUpdatedAtDesc(syllabusId);
    }

    @Override
    public List<String> compareVersions(Long syllabusId, Long historyId) {
        Syllabus current = syllabusRepository.findById(syllabusId).orElseThrow();
        SyllabusHistory old = historyRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản lịch sử"));

        List<String> changes = new ArrayList<>();

        if (current.getTitle() != null && old.getTitle() != null && !current.getTitle().equals(old.getTitle())) {
            changes.add("Tiêu đề thay đổi: '" + old.getTitle() + "' -> '" + current.getTitle() + "'");
        }
        if (current.getDescription() != null && old.getDescription() != null && !current.getDescription().equals(old.getDescription())) {
            changes.add("Mô tả đã được chỉnh sửa.");
        }
        if (current.getAcademicYear() != null && old.getAcademicYear() != null && !current.getAcademicYear().equals(old.getAcademicYear())) {
            changes.add("Năm học thay đổi: " + old.getAcademicYear() + " -> " + current.getAcademicYear());
        }

        if (changes.isEmpty()) {
            changes.add("Không có thay đổi nào đáng kể.");
        }
        return changes;
    }

    private void saveHistory(Syllabus syllabus) {
        SyllabusHistory history = new SyllabusHistory(syllabus);
        historyRepository.save(history);
    }

    // =========================
    // SUBSCRIBE / NOTIFICATION
    // =========================

    @Override
    public void subscribeCourse(Long userId, Long courseId) {
        if (subRepo.existsByUser_IdAndCourse_Id(userId, courseId)) {
            throw new RuntimeException("Bạn đã đăng ký môn này rồi!");
        }

        User user = userRepository.findById(userId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();

        subRepo.save(new Subscription(user, course));
    }

    @Override
    public List<Notification> getMyNotifications(Long userId) {
        return notiRepo.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    private void notifyUsers(List<User> users, String message) {
        if (users == null || users.isEmpty()) return;
        for (User u : users) {
            notiRepo.save(new Notification(u, message));
        }
    }

    private void notifyRole(String roleName, String message) {
        List<User> receivers = userRepository.findByRoles_Name(roleName);
        notifyUsers(receivers, message);
    }

    private void notifyLecturerOwner(Syllabus syllabus, String message) {
        if (syllabus.getCreatedBy() != null) {
            notiRepo.save(new Notification(syllabus.getCreatedBy(), message));
        }
    }

    @Override
    public long countUnread(Long userId) {
        return notiRepo.countByUser_IdAndReadFalse(userId);
    }

    @CacheEvict(cacheNames = "unreadCount", key = "#userId")
    public void markNotificationRead(Long userId, Long notificationId) {
        Notification n = notiRepo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification không tồn tại"));

        if (!n.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền");
        }

        if (!n.isRead()) {
            n.setRead(true);
            notiRepo.save(n);
        }
    }

    @CacheEvict(cacheNames = "unreadCount", key = "#userId")
    public void readAllNotifications(Long userId) {
        List<Notification> list = notiRepo.findByUser_IdOrderByCreatedAtDesc(userId);
        boolean changed = false;

        for (Notification n : list) {
            if (!n.isRead()) {
                n.setRead(true);
                changed = true;
            }
        }
        if (changed) notiRepo.saveAll(list);
    }
}
