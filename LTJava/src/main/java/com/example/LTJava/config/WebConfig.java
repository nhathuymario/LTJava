package com.example.LTJava.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.base-dir}")
    private String uploadBaseDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // URL public: /uploads/**
        // Map tới thư mục thật trên ổ đĩa
        String location = "file:" + uploadBaseDir + "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}
