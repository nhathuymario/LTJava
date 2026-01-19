package com.example.LTJava.syllabus.repository;

import com.example.LTJava.syllabus.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId);

    // UNREAD COUNT (property name = read)
    long countByUser_IdAndReadFalse(Long userId);

    // dùng cho read-all nếu muốn lấy list unread
    List<Notification> findByUser_IdAndReadFalse(Long userId);
}
