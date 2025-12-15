package com.example.LTJava.course.service;

import com.example.LTJava.course.dto.CreateCourseRequest;
import com.example.LTJava.course.entity.Course1;

public interface CourseService {
    Course1 create(CreateCourseRequest req);
}
