package com.example.LTJava.syllabus.service;

import com.example.LTJava.syllabus.dto.ai.GeminiRequest;
import com.example.LTJava.syllabus.dto.ai.GeminiResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper = new ObjectMapper(); // Dùng để đọc JSON

    public String[] processSyllabusContent(String title, String description) {
        // 1. Prompt yêu cầu trả về JSON chuẩn
        String prompt = "Bạn là chuyên gia tóm tắt giáo trình. \n" +
                "Đầu vào: Môn '" + title + "', Nội dung: '" + description + "'.\n" +
                "Nhiệm vụ: \n" +
                "1. Viết lại tóm tắt mới ngắn gọn (khoảng 2 câu), văn phong học thuật, KHÔNG copy y nguyên văn bản gốc.\n" +
                "2. Trích xuất 5 từ khóa quan trọng.\n" +
                "YÊU CẦU BẮT BUỘC: Chỉ trả về đúng 1 đoạn JSON duy nhất theo mẫu sau (không markdown, không giải thích):\n" +
                "{ \"summary\": \"...nội dung tóm tắt...\", \"keywords\": \"...từ khóa...\" }";

        try {
            String finalUrl = apiUrl + "?key=" + apiKey;
            GeminiRequest request = new GeminiRequest(prompt);
            GeminiResponse response = restTemplate.postForObject(finalUrl, request, GeminiResponse.class);

            if (response != null && !response.getCandidates().isEmpty()) {
                String rawText = response.getCandidates().get(0).getContent().getParts().get(0).getText();

                // Lọc bỏ ký tự thừa nếu AI lỡ gửi markdown (```json ... ```)
                rawText = rawText.replaceAll("```json", "").replaceAll("```", "").trim();

                // Đọc JSON để lấy dữ liệu chính xác
                JsonNode rootNode = objectMapper.readTree(rawText);
                String summary = rootNode.path("summary").asText("Không thể tóm tắt");
                String keywords = rootNode.path("keywords").asText("");

                return new String[]{summary, keywords};
            }
        } catch (Exception e) {
            System.out.println("AI Processing Error: " + e.getMessage());
            // In ra console để debug nếu cần
            e.printStackTrace();
        }
        return new String[]{"Lỗi xử lý AI", ""};
    }

    // ... (Code cũ giữ nguyên) ...

    // --- HÀM MỚI: VIẾT THÔNG BÁO ---
    public String createNotificationMessage(String courseName, String summary, Integer version) {
        String versionText = (version != null ? ("v" + version) : "phiên bản mới");

        String prompt =
                "Bạn là trợ lý lớp học vui tính. " +
                        "Môn học '" + courseName + "' vừa cập nhật giáo trình " + versionText + " với nội dung: '" + summary + "'. " +
                        "Hãy viết một thông báo ngắn (dưới 30 từ) gửi đến sinh viên để nhắc họ vào xem. " +
                        "Yêu cầu: Văn phong Gen Z, hài hước, dùng emoji, không quá nghiêm túc. " +
                        "Chỉ trả về nội dung thông báo, không có lời dẫn.";

        try {
            String finalUrl = apiUrl + "?key=" + apiKey;
            GeminiRequest request = new GeminiRequest(prompt);
            GeminiResponse response = restTemplate.postForObject(finalUrl, request, GeminiResponse.class);

            if (response != null && !response.getCandidates().isEmpty()) {
                return response.getCandidates().get(0).getContent().getParts().get(0).getText().trim();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // fallback nếu AI lỗi
        return "🔥 Giáo trình môn " + courseName + " vừa lên " + versionText + ". Vào xem ngay!";
    }

    // AIService.java
    public String createRoleNotificationMessage(
            String recipientRole,
            String action,
            String courseName,
            String syllabusTitle,
            Integer version,
            String note,
            Long syllabusId
    ) {
        String versionText = (version != null ? ("v" + version) : "phiên bản mới");
        String noteSafe = (note == null ? "" : note.trim());

        String toneRule =
                // staff roles: ngắn gọn, rõ việc, KHÔNG emoji
                "Văn phong: chuyên nghiệp, ngắn gọn, rõ việc, KHÔNG emoji, KHÔNG lan man. " +
                        "Dưới 45 từ. Chỉ trả về đúng nội dung thông báo, không lời dẫn.";

        String prompt =
                "Bạn là trợ lý quy trình duyệt giáo trình trong trường.\n" +
                        "Người nhận role: " + recipientRole + "\n" +
                        "Hành động cần truyền đạt: " + action + "\n" +
                        "Môn: " + courseName + "\n" +
                        "Syllabus: '" + syllabusTitle + "', " + versionText + ", syllabusId=" + syllabusId + "\n" +
                        (noteSafe.isEmpty() ? "" : ("Ghi chú/Reason: " + noteSafe + "\n")) +
                        "Yêu cầu: " + toneRule;

        try {
            String finalUrl = apiUrl + "?key=" + apiKey;
            GeminiRequest request = new GeminiRequest(prompt);
            GeminiResponse response = restTemplate.postForObject(finalUrl, request, GeminiResponse.class);

            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                String text = response.getCandidates().get(0).getContent().getParts().get(0).getText();
                if (text != null) return text.trim();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // fallback nếu AI lỗi
        String base = "[" + recipientRole + "] " + action + " - " + courseName + " (" + versionText + "), syllabusId=" + syllabusId;
        if (!noteSafe.isEmpty()) base += ". Ghi chú: " + noteSafe;
        return base;
    }


}