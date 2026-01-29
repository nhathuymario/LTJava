package com.example.LTJava.syllabus.repository;

import com.example.LTJava.syllabus.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    boolean existsByUser_IdAndCourse_Id(Long userId, Long courseId);

    List<Subscription> findByUser_Id(Long userId);

    List<Subscription> findByCourse_Id(Long courseId);

    void deleteByUser_IdAndCourse_Id(Long userId, Long courseId);
}
