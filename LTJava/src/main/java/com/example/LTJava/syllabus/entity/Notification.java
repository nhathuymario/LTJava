package com.example.LTJava.syllabus.entity;
import com.example.LTJava.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "user_id")
    private User user;

    private String message;
    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {}
    public Notification(User user, String message) {
        this.user = user;
        this.message = message;
    }
    // Getter & Setter bạn tự generate nhé!
    public String getMessage() { return message; }
    public boolean isRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}