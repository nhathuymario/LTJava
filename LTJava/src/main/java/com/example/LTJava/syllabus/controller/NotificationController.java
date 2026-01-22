package com.example.LTJava.syllabus.controller;

import java.util.List;

import com.example.LTJava.auth.security.CustomUserDetails;
import com.example.LTJava.syllabus.entity.Notification;
import com.example.LTJava.syllabus.service.SyllabusService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final SyllabusService syllabusService;

    public NotificationController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    // GET /api/notifications/me
    @GetMapping("/me")
    public ResponseEntity<List<Notification>> myNotifications(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        Long userId = currentUser.getId();
        return ResponseEntity.ok(syllabusService.getMyNotifications(userId));
    }

    // GET /api/notifications/me/unread
    @GetMapping("/me/unread")
    public ResponseEntity<Long> unreadCount(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        Long userId = currentUser.getId();
        return ResponseEntity.ok(syllabusService.countUnread(userId));
    }

    // PATCH /api/notifications/me/{id}/read
    @PatchMapping("/me/{notificationId}/read")
    public ResponseEntity<Void> markRead(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long notificationId
    ) {
        Long userId = currentUser.getId();
        syllabusService.markNotificationRead(userId, notificationId);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/notifications/me/read-all
    @PatchMapping("/me/read-all")
    public ResponseEntity<Void> readAll(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        Long userId = currentUser.getId();
        syllabusService.readAllNotifications(userId);
        return ResponseEntity.noContent().build();
    }
}
