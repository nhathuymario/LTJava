package com.example.LTJava.syllabus.entity;
import com.example.LTJava.user.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "subscriptions")
public class Subscription {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne @JoinColumn(name = "course_id")
    private Course course;

    public Subscription() {}
    public Subscription(User user, Course course) {
        this.user = user;
        this.course = course;
    }
    // Getter & Setter bạn tự generate nhé!
    public User getUser() { return user; }
    public Course getCourse() { return course; }
}