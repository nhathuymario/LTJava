package com.example.LTJava.course.service;

import com.example.LTJava.course.dto.CreateCourseRequest;
import com.example.LTJava.course.entity.Course1;

import java.util.List;

public interface CourseService {
    Course1 create(CreateCourseRequest req);

    List<Course1> getAll();

    Course1 getById(Long id);
}
