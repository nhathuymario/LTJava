package com.example.LTJava.syllabus.repository;

import com.example.LTJava.syllabus.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId); // Lấy tin mới nhất
}
