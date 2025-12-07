package com.example.LTJava.user.controller;

import com.example.LTJava.user.dto.CreateUserRequest;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Tạo 1 tài khoản
    @PostMapping("/create")
    public ResponseEntity<User> createUser(@RequestBody CreateUserRequest request) {
        User created = userService.createUser(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // Tạo nhiều tài khoản cùng lúc
    @PostMapping("/bulk-create")
    public ResponseEntity<List<User>> createUsersBulk(@RequestBody List<CreateUserRequest> requests) {
        List<User> createdList = userService.createUsersBulk(requests);
        return new ResponseEntity<>(createdList, HttpStatus.CREATED);
    }
}
