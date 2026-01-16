package com.example.LTJava.course.service;

import com.example.LTJava.course.dto.AssignLecturerRequest;
import com.example.LTJava.course.dto.CreateCourseRequest;
import com.example.LTJava.course.entity.Course1;

import java.util.List;

public interface CourseService {

    Course1 create(CreateCourseRequest req);

    Course1 update(Long id, CreateCourseRequest req);

    void delete(Long id);

    Course1 assignLecturer(Long courseId, AssignLecturerRequest req);

    List<Course1> getMyCourses(Long lecturerId);

    List<Course1> getByLecturerUsername(String username);


    List<Course1> getAll();

    Course1 getById(Long id);
}
