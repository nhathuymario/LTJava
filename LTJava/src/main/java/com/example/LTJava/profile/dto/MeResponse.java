package com.example.LTJava.profile.dto;

import java.time.LocalDate;
import java.util.Set;

public class MeResponse {
    public Long id;
    public String username;
    public String cccd;
    public String fullName;
    public LocalDate dateOfBirth;
    public boolean active;
    public Set<String> roles;

    public ProfileDto profile;

    public static class ProfileDto {
        public String email;
        public String phone;
        public String address;
        public String avatarUrl;
        public String bio;
    }
}
