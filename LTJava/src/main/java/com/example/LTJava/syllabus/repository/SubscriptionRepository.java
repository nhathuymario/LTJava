package com.example.LTJava.syllabus.repository;

import com.example.LTJava.syllabus.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByCourseId(Long courseId); // Tìm ai đang follow môn này
    boolean existsByUserIdAndCourseId(Long userId, Long courseId); // Check đã follow chưa
}
