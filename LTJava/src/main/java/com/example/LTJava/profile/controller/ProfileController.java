package com.example.LTJava.profile.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import com.example.LTJava.auth.security.CustomUserDetails;
import com.example.LTJava.profile.dto.ChangeMyPasswordRequest;
import com.example.LTJava.profile.dto.MeResponse;
import com.example.LTJava.profile.dto.UpdateMyProfileRequest;
import com.example.LTJava.profile.service.ProfileService;

@RestController
@RequestMapping("/api/users/me")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(profileService.getMe(currentUser.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<MeResponse> updateProfile(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody UpdateMyProfileRequest req
    ) {
        return ResponseEntity.ok(profileService.updateMyProfile(currentUser.getId(), req));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody ChangeMyPasswordRequest req
    ) {
        profileService.changeMyPassword(currentUser.getId(), req);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam("file") MultipartFile file
    ) {
        String avatarUrl = profileService.uploadMyAvatar(currentUser.getId(), file);
        return ResponseEntity.ok().body(avatarUrl);
    }

}
