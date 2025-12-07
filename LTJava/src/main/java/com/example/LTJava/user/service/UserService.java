package com.example.LTJava.user.service;

import com.example.LTJava.user.dto.CreateUserRequest;
import com.example.LTJava.user.entity.User;

import java.util.List;

public interface UserService {

    User createUser(CreateUserRequest request);

    List<User> createUsersBulk(List<CreateUserRequest> requests);
}
