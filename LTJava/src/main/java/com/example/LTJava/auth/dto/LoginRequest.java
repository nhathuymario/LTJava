package com.example.LTJava.auth.dto;

public class LoginRequest {

    private String username; // cccd
    private String password; // ngày sinh ddMMyyyy

    public LoginRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
