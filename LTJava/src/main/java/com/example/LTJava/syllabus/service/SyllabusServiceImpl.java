package com.example.LTJava.syllabus.service;

import java.util.List;
import java.util.ArrayList;

import com.example.LTJava.syllabus.entity.*;
import com.example.LTJava.syllabus.exception.ResourceNotFoundException;
import com.example.LTJava.syllabus.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.example.LTJava.syllabus.dto.CreateSyllabusRequest;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.repository.UserRepository;


@Service
public class SyllabusServiceImpl implements SyllabusService {

    private final SyllabusRepository syllabusRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    @Autowired private SubscriptionRepository subRepo;
    @Autowired private NotificationRepository notiRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private AIService aiService;

    public SyllabusServiceImpl(SyllabusRepository syllabusRepository,
                               CourseRepository courseRepository,
                               UserRepository userRepository) {
        this.syllabusRepository = syllabusRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

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
        syllabus.setStatus(SyllabusStatus.DRAFT);  // luôn bắt đầu là DRAFT
        syllabus.setVersion(1);
        syllabus.setCreatedBy(lecturer);

        return syllabusRepository.save(syllabus);
    }

    @Override
    public Syllabus submitSyllabus(Long syllabusId, Long lecturerId) {
        Syllabus syllabus = syllabusRepository.findByIdAndCreatedBy_Id(syllabusId, lecturerId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại hoặc không thuộc quyền của bạn"));

        if (syllabus.getStatus() != SyllabusStatus.DRAFT) {
            throw new RuntimeException("Chỉ syllabus ở trạng thái DRAFT mới được submit");
        }
        // 1. Lưu lại bản nháp hiện tại vào lịch sử
        saveHistory(syllabus);

        // 2. Cập nhật trạng thái mới
        // syllabus.setVersion(syllabus.getVersion() + 1); // Nếu muốn tăng version khi nộp
        syllabus.setStatus(SyllabusStatus.SUBMITTED);
        return syllabusRepository.save(syllabus);
    }

    @Override
    public Syllabus resubmitSyllabus(Long syllabusId, Long lecturerId) {
        Syllabus syllabus = syllabusRepository.findByIdAndCreatedBy_Id(syllabusId, lecturerId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại hoặc không thuộc quyền của bạn"));

        // ✅ Cho phép gửi lại khi bị yêu cầu sửa hoặc bị từ chối
        if (syllabus.getStatus() != SyllabusStatus.REQUESTEDIT
                && syllabus.getStatus() != SyllabusStatus.REJECTED) {
            throw new RuntimeException("Chỉ syllabus ở trạng thái REQUESTEDIT hoặc REJECTED mới được resubmit");
        }

        syllabus.setStatus(SyllabusStatus.SUBMITTED);
        syllabus.setVersion(syllabus.getVersion() + 1); // optional
        syllabus.setEditNote(null);
        return syllabusRepository.save(syllabus);
    }


    @Override
    public Syllabus approveSyllabus(Long syllabusId, Long hodId) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại"));

        if (syllabus.getStatus() != SyllabusStatus.SUBMITTED) {
            throw new RuntimeException("Chỉ syllabus SUBMITTED mới được HoD duyệt");
        }

        syllabus.setStatus(SyllabusStatus.HOD_APPROVED);
        return syllabusRepository.save(syllabus);
    }


    @Override
    public Syllabus rejectByHod(Long syllabusId, Long hodId, String reason) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại"));

        if (syllabus.getStatus() != SyllabusStatus.SUBMITTED) {
            throw new RuntimeException("Chỉ syllabus SUBMITTED mới được từ chối");
        }

        syllabus.setStatus(SyllabusStatus.REJECTED);
        syllabus.setEditNote(reason); // dùng editNote làm lý do
        return syllabusRepository.save(syllabus);
    }


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

    // 🔥 METHOD BẮT BUỘC – KHÔNG THIẾU – KHÔNG SAI TYPE
//    @Override
//    public List<Syllabus> getByStatus(SyllabusStatus status) {
//        return syllabusRepository.findByStatus(status);
//    }

    @Override
    public List<Syllabus> getByStatus(SyllabusStatus status) {
        return syllabusRepository.findByStatus(status);
    }



    // get syllabus theo trạng thái
    @Override
    public List<Syllabus> getSyllabusByStatus(SyllabusStatus status) {
        return syllabusRepository.findByStatus(status);
    }

    // duyệt syllabus 
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

//
//    @Override
//    public Syllabus publish(Long syllabusId) {
//        // nếu không cần aaId, có thể truyền null hoặc 0L
//        return publish(syllabusId, null);
//    }

    @Override
    public Syllabus publish(Long syllabusId, Long aaId) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found"));

        saveHistory(syllabus);

        if (syllabus.getStatus() != SyllabusStatus.AA_APPROVED) {
            throw new RuntimeException("Chỉ syllabus AA_APPROVED mới được publish");
        }

        syllabus.setStatus(SyllabusStatus.PUBLISHED);
        syllabus.setVersion(syllabus.getVersion() + 1);

        // Gọi AI tạo nội dung thông báo
        String notiContent = aiService.createNotificationMessage(
                syllabus.getCourse().getName(),
                syllabus.getAiSummary()
        );

        List<com.example.LTJava.syllabus.entity.Subscription> subs =
                subRepo.findByCourseId(syllabus.getCourse().getId());
        for (com.example.LTJava.syllabus.entity.Subscription sub : subs) {
            notiRepo.save(new com.example.LTJava.syllabus.entity.Notification(sub.getUser(), notiContent));
        }

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

        return syllabusRepository.save(syllabus);
    }


//    @Override
//    public Syllabus publish(Long syllabusId, Long aaId) {
//        Syllabus syllabus = syllabusRepository.findById(syllabusId)
//                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại"));
//        saveHistory(syllabus);
//        if (syllabus.getStatus() != SyllabusStatus.AA_APPROVED) {
//            throw new RuntimeException("Chỉ syllabus AA_APPROVED mới được publish");
//        }
//
//
//        syllabus.setStatus(SyllabusStatus.PUBLISHED);
//        return syllabusRepository.save(syllabus);
//    }

    // --- THÊM HÀM LẤY LỊCH SỬ ---
    public List<SyllabusHistory> getHistory(Long syllabusId) {
        return historyRepository.findBySyllabusIdOrderByUpdatedAtDesc(syllabusId);
    }


    // DTO để trả về kết quả so sánh
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
        if (!current.getAcademicYear().equals(old.getAcademicYear())) { // Ví dụ
            changes.add("Năm học thay đổi: " + old.getAcademicYear() + " -> " + current.getAcademicYear());
        }

        if (changes.isEmpty()) {
            changes.add("Không có thay đổi nào đáng kể.");
        }
        return changes;
    }


    // yêu cầu chính sửa
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
    public Syllabus requestEditSyllabus(Long syllabusId, Long hodId, String editNote) {
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
    public Syllabus rejectByAa(Long syllabusId, Long aaId, String reason) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại"));

        if (syllabus.getStatus() != SyllabusStatus.HOD_APPROVED
                && syllabus.getStatus() != SyllabusStatus.AA_APPROVED) {
            throw new RuntimeException("Chỉ syllabus HOD_APPROVED hoặc AA_APPROVED mới được AA reject");
        }

        syllabus.setStatus(SyllabusStatus.REJECTED);
        syllabus.setEditNote(reason);
        return syllabusRepository.save(syllabus);
    }


    //để tạm check thông tin
    @Override
    public List<Syllabus> getMySyllabus(Long lecturerId) {
        return syllabusRepository.findByCreatedBy_Id(lecturerId);
    }

    // --- TRIỂN KHAI LOGIC CHO SINH VIÊN ---

    // 3.HÀM SEARCH (Của Sinh viên)
    @Override
    public List<Syllabus> searchSyllabus(String keyword, String year, String semester) {
        return syllabusRepository.searchForStudent(keyword, year, semester);
    }

    @Override
    public Syllabus getSyllabusDetailPublic(Long id) {
        Syllabus syllabus = syllabusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found"));

        // Quan trọng: Sinh viên chỉ xem được bài ĐÃ XUẤT BẢN
        if (syllabus.getStatus() != SyllabusStatus.PUBLISHED) {
            throw new ResourceNotFoundException("Syllabus is not available publicly.");
        }
        return syllabus;
    }

    @Autowired
    private SyllabusHistoryRepository historyRepository;
    // Hàm phụ: Lưu lại phiên bản hiện tại vào lịch sử
    private void saveHistory(Syllabus syllabus) {
        SyllabusHistory history = new SyllabusHistory(syllabus);
        historyRepository.save(history);
    }

    //hàm Subscribe (Đăng ký)
    public void subscribeCourse(Long userId, Long courseId) {
        if (subRepo.existsByUserIdAndCourseId(userId, courseId)) {
            throw new RuntimeException("Bạn đã đăng ký môn này rồi!");
        }
        User user = userRepo.findById(userId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();
        subRepo.save(new Subscription(user, course));
    }

    //LẤY THÔNG BÁO
    @Override
    public List<Notification> getMyNotifications(Long userId) {
        return notiRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    }
