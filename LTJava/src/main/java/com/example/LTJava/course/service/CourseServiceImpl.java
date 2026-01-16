package com.example.LTJava.course.service;

import com.example.LTJava.course.dto.AssignLecturerRequest;
import com.example.LTJava.course.dto.CreateCourseRequest;
import com.example.LTJava.course.entity.Course1;
import com.example.LTJava.course.repository.CourseRepository1;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository1 courseRepository;
    @Autowired
    private UserRepository userRepository;


    public CourseServiceImpl(CourseRepository1 courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    public Course1 create(CreateCourseRequest req) {

        if (req.getCode() == null || req.getCode().isBlank()) {
            throw new RuntimeException("Course code không được để trống");
        }
        if (req.getName() == null || req.getName().isBlank()) {
            throw new RuntimeException("Course name không được để trống");
        }

        String code = req.getCode().trim();
        if (courseRepository.existsByCode(code)) {
            throw new RuntimeException("Course code đã tồn tại");
        }

        if (req.getLecturerUsername() == null || req.getLecturerUsername().isBlank()) {
            throw new RuntimeException("lecturerUsername không được để trống");
        }
        String lecturerUsername = req.getLecturerUsername().trim();

        // ✅ lookup user theo username (username DB của bạn = CCCD)
        User lecturer = userRepository.findByUsername(lecturerUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên: " + lecturerUsername));

        // ✅ check role LECTURER
        boolean isLecturer = lecturer.getRoles().stream()
                .anyMatch(r -> "LECTURER".equalsIgnoreCase(r.getName()));
        if (!isLecturer) {
            throw new RuntimeException("User này không có role LECTURER");
        }

        Course1 c = new Course1();
        c.setCode(code);
        c.setName(req.getName().trim());
        c.setCredits(req.getCredits());
        c.setDepartment(req.getDepartment());

        // ✅ set cả 2 để DB không lỗi NOT NULL
        c.setLecturerId(lecturer.getId());
        c.setLecturerUsername(lecturer.getUsername()); // chuẩn DB

        return courseRepository.save(c);
    }





    @Override
    public Course1 update(Long id, CreateCourseRequest req) {
        Course1 c = getById(id);

        if (req.getCode() != null && !req.getCode().isBlank()) {
            String newCode = req.getCode().trim();
            if (!newCode.equals(c.getCode()) && courseRepository.existsByCode(newCode)) {
                throw new RuntimeException("Course code đã tồn tại");
            }
            c.setCode(newCode);
        }
        if (req.getName() != null && !req.getName().isBlank()) c.setName(req.getName().trim());

        if (req.getCredits() != null) c.setCredits(req.getCredits());
        if (req.getDepartment() != null) c.setDepartment(req.getDepartment());

        // ❗ không đổi lecturer ở đây — đổi qua endpoint assign cho rõ nghiệp vụ
        return courseRepository.save(c);
    }

    @Override
    public void delete(Long id) {
        if (!courseRepository.existsById(id)) throw new RuntimeException("Course không tồn tại");
        courseRepository.deleteById(id);
    }

    @Override
    public Course1 assignLecturer(Long courseId, AssignLecturerRequest req) {
        Course1 c = getById(courseId);

        if (req.getLecturerId() == null) {
            throw new RuntimeException("lecturerId không được để trống");
        }
        if (req.getLecturerUsername() == null || req.getLecturerUsername().isBlank()) {
            throw new RuntimeException("lecturerUsername không được để trống");
        }

        c.setLecturerId(req.getLecturerId());
        c.setLecturerUsername(req.getLecturerUsername().trim());

        return courseRepository.save(c);
    }

    @Override
    public List<Course1> getAll() {
        return courseRepository.findAll();
    }

    @Override
    public Course1 getById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course không tồn tại"));
    }

    @Override
    public List<Course1> getMyCourses(Long lecturerId) {
        if (lecturerId == null) {
            throw new RuntimeException("lecturerId không hợp lệ");
        }
        return courseRepository.findByLecturerId(lecturerId);
    }

    @Override
    public List<Course1> getByLecturerUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new RuntimeException("username không hợp lệ");
        }
        return courseRepository.findByLecturerUsername(username.trim());
    }

}
