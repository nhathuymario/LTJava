package com.example.LTJava.syllabus.entity;

import com.example.LTJava.user.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String message;

    @Column(name="is_read")
    private boolean read = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {}

    public Notification(User user, String message) {
        this.user = user;
        this.message = message;
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }

    // ✅ getters/setters (ít nhất cần mấy cái này)
    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
