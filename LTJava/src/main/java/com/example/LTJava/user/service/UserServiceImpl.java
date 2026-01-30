package com.example.LTJava.user.service;

import com.example.LTJava.syllabus.repository.NotificationRepository;
import com.example.LTJava.user.dto.CreateUserRequest;
import com.example.LTJava.user.entity.Role;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.repository.RoleRepository;
import com.example.LTJava.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.LTJava.user.dto.ImportUsersResult;
import com.example.LTJava.user.dto.UserImportRow;
import com.example.LTJava.user.importer.ExcelUserImporter;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ExcelUserImporter excelUserImporter;
    private NotificationRepository notificationRepository;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder, PasswordEncoder passwordEncoder1,
                           ExcelUserImporter excelUserImporter,
                           NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.excelUserImporter = excelUserImporter;
        this.notificationRepository = notificationRepository;
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
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Không tìm thấy user id = " + userId);
        }
        notificationRepository.deleteByUserId(userId);

        userRepository.deleteById(userId);
    }

    @Override
    public ImportUsersResult importUsersFromExcel(MultipartFile file) {

        ExcelUserImporter.ParseResult parsed = excelUserImporter.parse(file);
        ImportUsersResult result = parsed.result();
        List<UserImportRow> rows = parsed.rows();

        int success = 0;
        DateTimeFormatter dmy = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        for (UserImportRow r : rows) {
            try {
                // ✅ LOG DỮ LIỆU ĐỌC TỪ EXCEL (thô)
                System.out.println("IMPORT ROW: " + r.getExcelRowNumber()
                        + " | cccd=" + r.getCccd()
                        + " | dob=" + r.getDateOfBirth()
                        + " | role=" + r.getRoleName());

                CreateUserRequest req = new CreateUserRequest();
                req.setFullName(r.getFullName());
                req.setCccd(r.getCccd());
                req.setRoleName(r.getRoleName());

                String dobStr = r.getDateOfBirth().format(dmy);
                // ✅ LOG DOB STRING GỬI VÀO createUser()
                System.out.println("IMPORT ROW: " + r.getExcelRowNumber()
                        + " | dobStr=" + dobStr);

                req.setDateOfBirth(dobStr);

                createUser(req);
                success++;

            } catch (Exception e) {
                // ✅ LOG LỖI THEO DÒNG
                System.out.println("IMPORT ERROR ROW: " + r.getExcelRowNumber()
                        + " | message=" + e.getMessage());

                result.getErrors().add(new ImportUsersResult.RowError(r.getExcelRowNumber(), e.getMessage()));
            }
        }

        result.setSuccessCount(success);
        result.setFailedCount(result.getErrors().size());
        return result;
    }



}
