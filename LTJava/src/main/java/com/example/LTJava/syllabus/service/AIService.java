package com.example.LTJava.syllabus.service;

import com.example.LTJava.syllabus.dto.ai.GeminiRequest;
import com.example.LTJava.syllabus.dto.ai.GeminiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AIService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // Hàm trả về mảng String: [0] là Tóm tắt, [1] là Keywords
    public String[] processSyllabusContent(String title, String description) {
        // 1. Soạn "câu thần chú" (Prompt) cho AI
        String prompt = "Bạn là trợ lý học thuật. Với môn học '" + title + "' và nội dung: '" + description + "'. " +
                "Hãy thực hiện 2 nhiệm vụ:\n" +
                "1. Tóm tắt nội dung trong khoảng 2-3 câu.\n" +
                "2. Trích xuất 5 từ khóa quan trọng nhất (cách nhau bằng dấu phẩy).\n" +
                "Trả về định dạng CHÍNH XÁC như sau (không thêm lời chào):\n" +
                "SUMMARY: <nội dung tóm tắt>\n" +
                "KEYWORDS: <từ khóa 1, từ khóa 2...>";

        try {
            // 2. Gọi API Google
            String finalUrl = apiUrl + "?key=" + apiKey;
            GeminiRequest request = new GeminiRequest(prompt);
            GeminiResponse response = restTemplate.postForObject(finalUrl, request, GeminiResponse.class);

            // 3. Xử lý kết quả trả về
            if (response != null && !response.getCandidates().isEmpty()) {
                String rawText = response.getCandidates().get(0).getContent().getParts().get(0).getText();

                // Tách chuỗi dựa trên từ khóa mình đã quy định
                String summary = "Không có tóm tắt";
                String keywords = "";

                if (rawText.contains("SUMMARY:") && rawText.contains("KEYWORDS:")) {
                    summary = rawText.substring(rawText.indexOf("SUMMARY:") + 8, rawText.indexOf("KEYWORDS:")).trim();
                    keywords = rawText.substring(rawText.indexOf("KEYWORDS:") + 9).trim();
                } else {
                    summary = rawText; // Nếu AI trả về format lạ thì lấy hết làm tóm tắt
                }

                return new String[]{summary, keywords};
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new String[]{"Lỗi kết nối AI", ""};
    }
}