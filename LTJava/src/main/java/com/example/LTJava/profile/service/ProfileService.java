package com.example.LTJava.profile.service;

import com.example.LTJava.profile.dto.ChangeMyPasswordRequest;
import com.example.LTJava.profile.dto.MeResponse;
import com.example.LTJava.profile.dto.UpdateMyProfileRequest;
import org.springframework.web.multipart.MultipartFile;

public interface ProfileService {
    MeResponse getMe(Long userId);
    MeResponse updateMyProfile(Long userId, UpdateMyProfileRequest req);
    void changeMyPassword(Long userId, ChangeMyPasswordRequest req);
    String uploadMyAvatar(Long userId, MultipartFile file);
}
