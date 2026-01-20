package com.example.LTJava.profile.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.stream.Collectors;
import java.io.File;
import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.LTJava.profile.dto.ChangeMyPasswordRequest;
import com.example.LTJava.profile.dto.MeResponse;
import com.example.LTJava.profile.dto.UpdateMyProfileRequest;
import com.example.LTJava.profile.entity.UserProfile;
import com.example.LTJava.profile.repository.UserProfileRepository;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.repository.UserRepository;

@Service
@Transactional
public class ProfileServiceImpl implements ProfileService {

    @Value("${app.upload.base-dir}")
    private String uploadBaseDir;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileServiceImpl(
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public MeResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // ✅ đổi sang findByUserId (tránh lỗi findByUser_Id không resolve)
        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);

        return toMeResponse(user, profile);
    }

    @Override
    public MeResponse updateMyProfile(Long userId, UpdateMyProfileRequest req) {
        if (req == null) throw new RuntimeException("Thiếu dữ liệu cập nhật");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // ✅ update fullName (thuộc User core)
        String fullName = req.getFullName();
        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setFullName(fullName.trim());
        }

        // ✅ profile: upsert
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserProfile p = new UserProfile();
                    p.setUser(user);
                    return p;
                });

        // ✅ dùng getter thay vì req.email/phone/... (tránh "Cannot resolve symbol")
        String email = req.getEmail();
        if (email != null) profile.setEmail(email.trim());

        String phone = req.getPhone();
        if (phone != null) profile.setPhone(phone.trim());

        String address = req.getAddress();
        if (address != null) profile.setAddress(address.trim());

        String avatarUrl = req.getAvatarUrl();
        if (avatarUrl != null) profile.setAvatarUrl(avatarUrl.trim());

        String bio = req.getBio();
        if (bio != null) profile.setBio(bio.trim());

        userRepository.save(user);
        userProfileRepository.save(profile);

        return toMeResponse(user, profile);
    }

    @Override
    public void changeMyPassword(Long userId, ChangeMyPasswordRequest req) {
        if (req == null || req.getCurrentPassword() == null || req.getNewPassword() == null) {
            throw new RuntimeException("Thiếu dữ liệu đổi mật khẩu");
        }
        if (req.getNewPassword().length() < 6) {
            throw new RuntimeException("Mật khẩu mới tối thiểu 6 ký tự");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public String uploadMyAvatar(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File avatar rỗng");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Chỉ cho phép upload file ảnh");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserProfile p = new UserProfile();
                    p.setUser(user);
                    return p;
                });

        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID() + ext;

        // ✅ lưu vào: ${app.upload.base-dir}/avatars/<fileName>
        Path avatarDir = Paths.get(uploadBaseDir, "avatars");
        try {
            Files.createDirectories(avatarDir);
            Path dest = avatarDir.resolve(fileName).normalize();
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Không lưu được file avatar", e);
        }

        String avatarUrl = "/uploads/avatars/" + fileName;
        profile.setAvatarUrl(avatarUrl);
        userProfileRepository.save(profile);

        return avatarUrl;
    }

    private MeResponse toMeResponse(User user, UserProfile profile) {
        MeResponse res = new MeResponse();
        res.id = user.getId();
        res.username = user.getUsername();
        res.cccd = user.getCccd();
        res.fullName = user.getFullName();
        res.dateOfBirth = user.getDateOfBirth();
        res.active = user.isActive();

        res.roles = user.getRoles().stream()
                .map(r -> r.getName())
                .collect(Collectors.toSet());

        MeResponse.ProfileDto p = new MeResponse.ProfileDto();
        if (profile != null) {
            p.email = profile.getEmail();
            p.phone = profile.getPhone();
            p.address = profile.getAddress();
            p.avatarUrl = profile.getAvatarUrl();
            p.bio = profile.getBio();
        }
        res.profile = p;

        return res;
    }
}
