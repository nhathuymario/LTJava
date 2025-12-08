package com.example.LTJava.user.service;

import com.example.LTJava.user.dto.CreateUserRequest;
import com.example.LTJava.user.entity.Role;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.repository.RoleRepository;
import com.example.LTJava.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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


        // 1. CCCD
        String cccd = request.getCccd();
        if (cccd == null || cccd.isBlank()) {
            throw new RuntimeException("CCCD không được để trống");
        }
        if (userRepository.existsByCccd(cccd)) {
            throw new RuntimeException("CCCD đã tồn tại");
        }

        // 2. username = cccd
        String username = cccd;
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username đã tồn tại: " + username);
        }

        // 3. Họ tên
        String fullName = request.getFullName();
        if (fullName == null || fullName.isBlank()) {
            throw new RuntimeException("Full name không được để trống");
        }

        // 4. Ngày sinh + password
        String dobStr = request.getDateOfBirth();
        if (dobStr == null || dobStr.isBlank()) {
            throw new RuntimeException("Ngày sinh không được để trống");
        }

        // Format ngày sinh: dd/MM/yyyy  (ví dụ: 01/12/2003)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        LocalDate dob;
        try {
            dob = LocalDate.parse(dobStr, formatter);
        } catch (DateTimeParseException e) {
            throw new RuntimeException("Ngày sinh không đúng định dạng dd/MM/yyyy");
        }

        // password = ddMMyyyy
        String password = dob.format(DateTimeFormatter.ofPattern("ddMMyyyy"));

        // ===== 5. Lấy role =====
        String reqRole = request.getRoleName();
        String finalRoleName = (reqRole == null || reqRole.isBlank()) ? "USER" : reqRole;

        Role role = roleRepository.findByName(finalRoleName)
                .orElseGet(() -> roleRepository.save(new Role(finalRoleName)));

        // ===== 6. Tạo user =====
        User user = new User();
        user.setCccd(cccd);
        user.setUsername(username);
        user.setPassword(password);      // <-- dùng ngày sinh
        user.setFullName(fullName);
        user.setDateOfBirth(dob);        // lưu ngày sinh
        user.setActive(true);
        user.addRole(role);

        // ===== 7. Lưu DB =====
        return userRepository.save(user);
    }
    // ====== TẠO HÀNG LOẠT (BULK) ======
    @Override
    public List<User> createUsersBulk(List<CreateUserRequest> requests) {
        return requests.stream()
                .map(this::createUser)
                .toList();
    }
}
