package com.example.LTJava.syllabus.service;

import com.example.LTJava.syllabus.dto.CreateSyllabusRequest;
import com.example.LTJava.syllabus.entity.Course;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusStatus;
import com.example.LTJava.syllabus.repository.CourseRepository;
import com.example.LTJava.syllabus.repository.SyllabusRepository;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SyllabusServiceImpl implements SyllabusService {

    private final SyllabusRepository syllabusRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

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
}
