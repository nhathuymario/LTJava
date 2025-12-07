package com.example.LTJava;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // để Postman gửi POST không bị chặn CSRF
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // cho phép TẤT CẢ request, không cần login
                );

        return http.build();
    }
}
