package com.example.LTJava.user.controller;

import com.example.LTJava.user.dto.CreateUserRequest;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Tạo tài khoản
    @PostMapping("/create")
    public ResponseEntity<User> createUser(@RequestBody CreateUserRequest request) {
        User created = userService.createUser(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}
