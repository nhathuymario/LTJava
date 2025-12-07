package com.example.LTJava.user.service;

import com.example.LTJava.user.dto.CreateUserRequest;
import com.example.LTJava.user.entity.Role;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.repository.RoleRepository;
import com.example.LTJava.user.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public User createUser(CreateUserRequest request) {

        // 1. check trùng username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại");
        }

        // 2. check trùng email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // 3. lấy role
        String inputRole = request.getRoleName();
        String roleName = (inputRole == null || inputRole.isBlank())
                ? "USER"
                : inputRole;

        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));

        // 4. tạo user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword()); // demo, chưa mã hoá
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setActive(true);
        user.addRole(role);

        // 5. lưu DB
        return userRepository.save(user);
    }
}
