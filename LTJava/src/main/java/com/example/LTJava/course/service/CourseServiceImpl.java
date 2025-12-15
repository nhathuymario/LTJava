package com.example.LTJava.course.service;

import com.example.LTJava.course.dto.CreateCourseRequest;
import com.example.LTJava.course.entity.Course1;
import com.example.LTJava.course.repository.CourseRepository1;
import org.springframework.stereotype.Service;

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

        return courseRepository.save(c);
    }
}
