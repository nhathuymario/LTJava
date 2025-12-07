package com.example.LTJava.user.service;

import com.example.LTJava.user.dto.CreateUserRequest;
import com.example.LTJava.user.entity.User;

public interface UserService {
    User createUser(CreateUserRequest request);
}
