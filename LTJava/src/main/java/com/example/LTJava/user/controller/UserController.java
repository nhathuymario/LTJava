package com.example.LTJava.user.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.LTJava.user.dto.ImportUsersResult;


import com.example.LTJava.user.dto.CreateUserRequest;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.service.UserService;

@RestController
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
@RequestMapping("/api/admin/users")

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

    @PostMapping(value = "/import-excel", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportUsersResult> importExcel(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(userService.importUsersFromExcel(file));
    }

    // Tạo nhiều tài khoản cùng lúc
    @PostMapping("/bulk-create")
    public ResponseEntity<List<User>> createUsersBulk(@RequestBody List<CreateUserRequest> requests) {
        List<User> createdList = userService.createUsersBulk(requests);
        return new ResponseEntity<>(createdList, HttpStatus.CREATED);
    }
    //  Lấy danh sách tất cả user
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    //  Khoá tài khoản
    @PostMapping("/{id}/lock")
    public ResponseEntity<User> lockUser(@PathVariable Long id) {
        User user = userService.lockUser(id);
        return ResponseEntity.ok(user);
    }

    //  Mở khoá tài khoản
    @PostMapping("/{id}/unlock")
    public ResponseEntity<User> unlockUser(@PathVariable Long id) {
        User user = userService.unlockUser(id);
        return ResponseEntity.ok(user);
    }

    //  Đổi role cho user
    public record ChangeRoleRequest(String roleName) {}

    @PutMapping("/{id}/role")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id,
                                            @RequestBody ChangeRoleRequest req) {
        return ResponseEntity.ok(userService.changeUserRole(id, req.roleName()));
    }

    // xóa user
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Đã xoá user id = " + id);
    }

}
