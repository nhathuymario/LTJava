package com.example.LTJava.course.service;

import com.example.LTJava.course.dto.CreateCourseRequest;
import com.example.LTJava.course.entity.Course1;
import com.example.LTJava.course.repository.CourseRepository1;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository1 courseRepository;

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
        if (courseRepository.existsByCode(req.getCode())) {
            throw new RuntimeException("Course code đã tồn tại");
        }

        Course1 c = new Course1();
        c.setCode(req.getCode());
        c.setName(req.getName());
        c.setCredits(req.getCredits());
        c.setDepartment(req.getDepartment());
        c.setLecturerId(req.getLecturerId()); // ✅ GIỜ THÌ ĐÚNG

        return courseRepository.save(c);
    }

    @Override
    public List<Course1> getMyCourses(Long lecturerId) {
        return courseRepository.findByLecturerId(lecturerId);
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
    public Course1 update(Long id, CreateCourseRequest req) {
        Course1 c = getById(id);
        if (req.getCode()!=null && !req.getCode().isBlank()) c.setCode(req.getCode());
        if (req.getName()!=null && !req.getName().isBlank()) c.setName(req.getName());
        c.setCredits(req.getCredits());
        c.setDepartment(req.getDepartment());
        // lecturerId có thể cho đổi qua API assign riêng (khuyên) hoặc cho update luôn
        return courseRepository.save(c);
    }

    @Override
    public void delete(Long id) {
        if (!courseRepository.existsById(id)) throw new RuntimeException("Course không tồn tại");
        courseRepository.deleteById(id);
    }

    @Override
    public Course1 assignLecturer(Long id, Long lecturerId) {
        Course1 c = getById(id);
        c.setLecturerId(lecturerId);
        return courseRepository.save(c);
    }


}
