package com.example.LTJava.user.service;

import com.example.LTJava.user.dto.CreateUserRequest;
import com.example.LTJava.user.dto.ImportUsersResult;
import com.example.LTJava.user.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {

    User createUser(CreateUserRequest request);

    List<User> createUsersBulk(List<CreateUserRequest> requests);

    List<User> getAllUsers();

    User lockUser(Long userId);

    User unlockUser(Long userId);

    User changeUserRole(Long userId, String roleName);

    void deleteUser(Long userId);

    // ✅ IMPORT EXCEL
    ImportUsersResult importUsersFromExcel(MultipartFile file);

}
