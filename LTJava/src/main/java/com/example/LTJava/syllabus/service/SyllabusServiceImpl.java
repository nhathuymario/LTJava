package com.example.LTJava.syllabus.service;

import java.util.List;
import java.util.ArrayList;
import java.util.Set;

import com.example.LTJava.syllabus.dto.CreateSyllabusRequest;
import com.example.LTJava.syllabus.entity.*;
import com.example.LTJava.syllabus.exception.ResourceNotFoundException;
import com.example.LTJava.syllabus.repository.*;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.repository.UserRepository;
import com.example.LTJava.syllabus.repository.SyllabusHistoryRepository;

import com.example.LTJava.syllabus.dto.SetCourseRelationsRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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

        // ✅ không tăng version ở đây
        syllabus.setTitle(request.getTitle());
        syllabus.setDescription(request.getDescription());
        syllabus.setAcademicYear(request.getAcademicYear());
        syllabus.setSemester(request.getSemester());

        // (không đổi courseId ở update; nếu muốn cho đổi course thì validate thêm)
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
        return syllabusRepository.save(syllabus);
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
        syllabus.setVersion(syllabus.getVersion() + 1);
        syllabus.setEditNote(null);
        return syllabusRepository.save(syllabus);
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

    @Override
    public Syllabus approveByHod(Long syllabusId, Long hodId) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại"));

        if (syllabus.getStatus() != SyllabusStatus.SUBMITTED) {
            throw new RuntimeException("Chỉ syllabus SUBMITTED mới được HoD duyệt");
        }

        // ✅ HoD duyệt -> HOD_APPROVED
        syllabus.setStatus(SyllabusStatus.HOD_APPROVED);
        return syllabusRepository.save(syllabus);
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
        return syllabusRepository.save(syllabus);
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
        return syllabusRepository.save(syllabus);
    }

    // =========================
    // AA
    // =========================

    @Override
    public void setCourseRelations(SetCourseRelationsRequest req) {
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course syllabus không tồn tại: " + req.getCourseId()));

        // ✅ clear old
        course.getPrerequisites().clear();
        course.getParallelCourses().clear();
        course.getSupplementaryCourses().clear();

        // ✅ add new
        addMany(course.getPrerequisites(), req.getPrerequisiteIds(), req.getCourseId());
        addMany(course.getParallelCourses(), req.getParallelIds(), req.getCourseId());
        addMany(course.getSupplementaryCourses(), req.getSupplementaryIds(), req.getCourseId());

        courseRepository.save(course);
    }

    private void addMany(Set<Course> target, List<Long> ids, Long selfId) {
        if (ids == null) return;

        for (Long id : ids) {
            if (id == null) continue;
            if (id.equals(selfId)) continue; // ✅ tránh tự tham chiếu

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
        return syllabusRepository.save(syllabus);
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
        return syllabusRepository.save(syllabus);
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
//        return syllabusRepository.save(syllabus);
        Syllabus saved = syllabusRepository.save(syllabus);
        saveHistory(saved);

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
        return syllabusRepository.save(syllabus);
    }

    // =========================
    // PUBLISH
    // =========================

    @Override
    public Syllabus publish(Long syllabusId, Long principalId) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found"));

        saveHistory(syllabus);

        if (syllabus.getStatus() != SyllabusStatus.PRINCIPAL_APPROVED) {
            throw new RuntimeException("Chỉ syllabus PRINCIPAL_APPROVED mới được publish");
        }

        syllabus.setStatus(SyllabusStatus.PUBLISHED);

        // AI notification content
        String notiContent = aiService.createNotificationMessage(
                syllabus.getCourse().getName(),
                syllabus.getAiSummary()
        );

        List<Subscription> subs = subRepo.findByCourse_Id(syllabus.getCourse().getId());
        for (Subscription sub : subs) {
            notiRepo.save(new Notification(sub.getUser(), notiContent));
        }

        // AI summary/keywords (optional)
        if (syllabus.getDescription() != null && syllabus.getDescription().length() > 10) {
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

        Syllabus saved = syllabusRepository.save(syllabus);
        saveHistory(saved);

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
        // check student đã subscribe course chưa
        if (!subRepo.existsByUser_IdAndCourse_Id(userId, courseId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn chưa đăng ký môn này");
        }

        // lấy syllabus public theo course
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

        if (!current.getTitle().equals(old.getTitle())) {
            changes.add("Tiêu đề thay đổi: '" + old.getTitle() + "' -> '" + current.getTitle() + "'");
        }
        if (!current.getDescription().equals(old.getDescription())) {
            changes.add("Mô tả đã được chỉnh sửa.");
        }
        if (!current.getAcademicYear().equals(old.getAcademicYear())) {
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
        return notiRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
