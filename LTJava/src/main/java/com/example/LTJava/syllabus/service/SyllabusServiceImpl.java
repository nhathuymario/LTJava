package com.example.LTJava.syllabus.service;

import com.example.LTJava.syllabus.dto.CreateSyllabusRequest;
import com.example.LTJava.syllabus.entity.*;
import com.example.LTJava.syllabus.exception.ResourceNotFoundException;
import com.example.LTJava.syllabus.repository.*;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class SyllabusServiceImpl implements SyllabusService {

    private final SyllabusRepository syllabusRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    @Autowired private SubscriptionRepository subRepo;
    @Autowired private NotificationRepository notiRepo;
    @Autowired private UserRepository userRepo;

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

        if (syllabus.getStatus() != SyllabusStatus.REJECTED) {
            throw new RuntimeException("Chỉ syllabus ở trạng thái REJECTED mới được resubmit");
        }

        syllabus.setStatus(SyllabusStatus.SUBMITTED);
        syllabus.setVersion(syllabus.getVersion() + 1); // optional: tăng version khi gửi lại
        return syllabusRepository.save(syllabus);
    }
 //để tạm check thông tin
    public List<Syllabus> getMySyllabus(Long lecturerId) {
        return syllabusRepository.findByCreatedBy_Id(lecturerId);
    }

    @Override
    public Syllabus publishSyllabus(Long syllabusId) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found"));

        saveHistory(syllabus);

        // Logic: Chuyển trạng thái sang PUBLISHED (Đã xuất bản)
        syllabus.setStatus(SyllabusStatus.PUBLISHED);

        syllabus.setVersion(syllabus.getVersion() + 1); // Duyệt xong lên version mới

        // Gửi thông báo cho những ai đang theo dõi môn học này
        List<Subscription> subs = subRepo.findByCourseId(syllabus.getCourse().getId());
        for (Subscription sub : subs) {
            String msg = "Giáo trình môn " + syllabus.getCourse().getName() + " đã được cập nhật phiên bản mới!";
            notiRepo.save(new Notification(sub.getUser(), msg));
        }

        return syllabusRepository.save(syllabus);
    }

    // --- THÊM HÀM LẤY LỊCH SỬ ---
    public List<SyllabusHistory> getHistory(Long syllabusId) {
        return historyRepository.findBySyllabusIdOrderByUpdatedAtDesc(syllabusId);
    }

    // 2. THÊM HÀM REJECT (Của AA) -> Chức năng Từ chối
    @Override
    public Syllabus rejectSyllabus(Long id, String reason) {
        Syllabus syllabus = syllabusRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Giáo trình không tồn tại"));

        // Chỉ được từ chối bài đang ở trạng thái SUBMITTED
        if (syllabus.getStatus() != SyllabusStatus.SUBMITTED) {
            throw new RuntimeException("Chỉ được từ chối giáo trình đã Nộp (SUBMITTED)");
        }

        syllabus.setStatus(SyllabusStatus.REJECTED);
        // syllabus.setRejectReason(reason); // Nếu bạn có cột này trong Entity thì mở ra
        System.out.println("Lý do từ chối: " + reason); // Log tạm ra màn hình

        return syllabusRepository.save(syllabus);
    }

    @Override
    public List<Syllabus> getPendingSyllabus() {
        // Giả sử luồng là: Giảng viên nộp -> Trạng thái SUBMITTED -> AA vào duyệt
        return syllabusRepository.findByStatus(SyllabusStatus.SUBMITTED);
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
