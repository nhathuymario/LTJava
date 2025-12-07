package com.example.LTJava.user.service;

import com.example.LTJava.user.dto.CreateUserRequest;
import com.example.LTJava.user.entity.Role;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.repository.RoleRepository;
import com.example.LTJava.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    // bạn có thể cho domain vào cấu hình, ở đây hard-code cho dễ nhìn
    private static final String EMAIL_DOMAIN = "@example.com";

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public User createUser(CreateUserRequest request) {

        // 1. validate cccd

        // ===== 1. Lấy và validate CCCD =====
        String cccd = request.getCccd();
        if (cccd == null || cccd.isBlank()) {
            throw new RuntimeException("CCCD không được để trống");
        }

        if (userRepository.existsByCccd(cccd)) {
            throw new RuntimeException("CCCD đã tồn tại trong hệ thống");
        }

        // ===== 2. Generate username từ CCCD =====
        String username = cccd;
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username đã tồn tại: " + username);
        }

        // ===== 3. Validate fullName =====
        String fullName = request.getFullName();
        if (fullName == null || fullName.isBlank()) {
            throw new RuntimeException("Full name không được để trống");
        }

        // ===== 4. Generate email =====
        String email = buildEmailFromFullNameAndCccd(fullName, cccd);
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email đã tồn tại: " + email);
        }

        // ===== 5. Lấy role =====
        String reqRole = request.getRoleName();
        String finalRoleName = (reqRole == null || reqRole.isBlank()) ? "USER" : reqRole;

        Role role = roleRepository.findByName(finalRoleName)
                .orElseGet(() -> roleRepository.save(new Role(finalRoleName)));

        // ===== 6. Tạo user =====
        User user = new User();
        user.setCccd(cccd);          // <<< QUAN TRỌNG
        user.setUsername(username);
        user.setPassword(request.getPassword());
        user.setFullName(fullName);
        user.setEmail(email);
        user.setActive(true);
        user.addRole(role);

        // ===== 7. Lưu DB =====
        return userRepository.save(user);
    }
    // Hàm build email: chữ cái đầu mỗi từ + 4 số cuối cccd + domain
    private String buildEmailFromFullNameAndCccd(String fullName, String cccd) {
        String[] parts = fullName.trim().toLowerCase().split("\\s+");
        StringBuilder initials = new StringBuilder();
        for (String p : parts) {
            initials.append(p.charAt(0));
        }

        String last4 = cccd.substring(cccd.length() - 4);

        return initials.toString() + last4 + "@example.com";
    }

    // ====== TẠO HÀNG LOẠT (BULK) ======
    @Override
    public List<User> createUsersBulk(List<CreateUserRequest> requests) {
        return requests.stream()
                .map(this::createUser)
                .toList();
    }
}
