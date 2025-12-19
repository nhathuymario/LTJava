package com.example.LTJava.config;

import com.example.LTJava.user.entity.Role;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.repository.RoleRepository;
import com.example.LTJava.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedSystemAdmin(UserRepository userRepo,
                                      RoleRepository roleRepo,
                                      PasswordEncoder encoder) {

        return args -> {

            // ===== 1. Tạo role SYSTEM_ADMIN nếu chưa có =====
            Role adminRole = roleRepo.findByName("SYSTEM_ADMIN")
                    .orElseGet(() -> {
                        Role r = new Role();
                        r.setName("SYSTEM_ADMIN");
                        return roleRepo.save(r);
                    });

            // ===== 2. Thông tin admin =====
            String adminCccd = "000000000000";      // 12 số, không trùng
            String adminUsername = adminCccd;       // username = cccd

            boolean adminExists =
                    userRepo.findByUsername(adminUsername).isPresent()
                            || userRepo.findByCccd(adminCccd).isPresent();

            if (!adminExists) {

                User admin = new User();
                admin.setCccd(adminCccd);
                admin.setUsername(adminUsername);
                admin.setFullName("System Admin");
                admin.setDateOfBirth(LocalDate.of(2000, 1, 1));
                admin.setPassword(encoder.encode("123456"));
                admin.setActive(true);
                admin.setRoles(new HashSet<>());
                admin.getRoles().add(adminRole);
                userRepo.save(admin);





                userRepo.save(admin);
                System.out.println("✅ Seeded SYSTEM_ADMIN account");
                System.out.println("👉 Login with CCCD: " + adminCccd + " | password: 123456");
            } else {
                System.out.println("ℹ️ SYSTEM_ADMIN already exists, skip seeding");
            }
        };
    }
}
