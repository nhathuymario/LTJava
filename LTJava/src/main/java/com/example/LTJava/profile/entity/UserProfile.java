package com.example.LTJava.profile.entity;

import com.example.LTJava.user.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 120)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String address;

    @Column(length = 500)
    private String avatarUrl;

    @Column(length = 1000)
    private String bio;

    public UserProfile() {}

    public Long getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
