package com.example.LTJava.user.service;

import com.example.LTJava.user.dto.CreateUserRequest;
import com.example.LTJava.user.entity.Role;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.repository.RoleRepository;
import com.example.LTJava.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder, PasswordEncoder passwordEncoder1) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder1;
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

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        LocalDate dob;
        try {
            dob = LocalDate.parse(dobStr, formatter);
        } catch (DateTimeParseException e) {
            throw new RuntimeException("Ngày sinh không đúng định dạng dd/MM/yyyy");
        }

        // password gốc = ddMMyyyy
        String rawPassword = dob.format(DateTimeFormatter.ofPattern("ddMMyyyy"));

        // MÃ HOÁ BCRYPT TRƯỚC KHI LƯU
        String hashedPassword = passwordEncoder.encode(rawPassword);

        // ===== 5. Lấy role =====
        String reqRole = request.getRoleName();
        String finalRoleName = (reqRole == null || reqRole.isBlank()) ? "USER" : reqRole;

        Role role = roleRepository.findByName(finalRoleName)
                .orElseGet(() -> roleRepository.save(new Role(finalRoleName)));

        // ===== 6. Tạo user =====
        User user = new User();
        user.setCccd(cccd);
        user.setUsername(username);
        user.setPassword(hashedPassword);      // dùng ngày sinh
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

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User lockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user id = " + userId));
        user.setActive(false); // khóa
        return userRepository.save(user);
    }

    @Override
    public User unlockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user id = " + userId));
        user.setActive(true); // mở khóa
        return userRepository.save(user);
    }

    @Override
    public User changeUserRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user id = " + userId));

        if (roleName == null || roleName.isBlank()) {
            throw new RuntimeException("Role name không được để trống");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));

        // hiện tại ta cho mỗi user chỉ 1 role chính
        user.getRoles().clear();
        user.addRole(role);

        return userRepository.save(user);
    }
    // xóa user
    @Override
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Không tìm thấy user id = " + userId);
        }
        userRepository.deleteById(userId);
    }


}
