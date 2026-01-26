package com.example.LTJava.syllabus.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.LTJava.outcome.entity.Clo;
import com.example.LTJava.outcome.entity.CloPloMap;
import com.example.LTJava.outcome.repository.CloPloMapRepo;
import com.example.LTJava.outcome.repository.CloRepo;
import com.example.LTJava.outcome.repository.PloRepo;
import com.example.LTJava.syllabus.dto.CourseOutcomesRequest;
import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusContent;
import com.example.LTJava.syllabus.entity.SyllabusStatus;
import com.example.LTJava.syllabus.repository.SyllabusContentRepository;
import com.example.LTJava.syllabus.repository.SyllabusRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
/**
 * Dịch vụ lưu/đồng bộ nội dung đề cương (Syllabus Content).
 * \n
 * Ý tưởng chính (lưu trữ kép):
 * - Lưu bản chụp (snapshot) toàn bộ form vào các cột JSON (LONGTEXT) của bảng syllabus_contents
 *   để phục hồi giao diện nhanh chóng.
 * - Đồng thời đồng bộ dữ liệu chuẩn hoá vào các bảng quan hệ (CLO, CLO_PLO_MAP)
 *   để có ràng buộc khoá, truy vấn ma trận CLO–PLO và toàn vẹn dữ liệu.
 */
public class SyllabusContentServiceImpl implements SyllabusContentService {

    private final SyllabusContentRepository contentRepo;
    private final SyllabusRepository syllabusRepo;
    private final ObjectMapper objectMapper;
    private final CloRepo cloRepo;
    private final PloRepo ploRepo;
    private final CloPloMapRepo mapRepo;

    private static final EnumSet<SyllabusStatus> EDITABLE = EnumSet.of(
            SyllabusStatus.DRAFT,
            SyllabusStatus.REQUESTEDIT,
            SyllabusStatus.REJECTED
    );

    public SyllabusContentServiceImpl(SyllabusContentRepository contentRepo,
                                      SyllabusRepository syllabusRepo,
                                      ObjectMapper objectMapper,
                                      CloRepo cloRepo,
                                      PloRepo ploRepo,
                                      CloPloMapRepo mapRepo) {
        this.contentRepo = contentRepo;
        this.syllabusRepo = syllabusRepo;
        this.objectMapper = objectMapper;
        this.cloRepo = cloRepo;
        this.ploRepo = ploRepo;
        this.mapRepo = mapRepo;
    }

    @Override
    @Transactional
    public SyllabusContent saveOrUpdate(Long syllabusId, CourseOutcomesRequest request, Long lecturerId) {
        // Validate đầu vào
        if (request == null) {
            throw new IllegalArgumentException("CourseOutcomes is required");
        }

        // Tải syllabus và kiểm tra quyền sửa theo trạng thái + chủ sở hữu
        Syllabus s = syllabusRepo.findById(syllabusId)
                .orElseThrow(() -> new IllegalArgumentException("Syllabus not found: " + syllabusId));

        // Validate: Lecturer có thể edit nếu syllabus ở trạng thái DRAFT
        if (!EDITABLE.contains(s.getStatus())) {
            throw new IllegalStateException("Syllabus is not editable in status: " + s.getStatus());
        }

        // Validate: Chỉ lecturer sở hữu syllabus mới được edit
        if (!s.getCreatedBy().getId().equals(lecturerId)) {
            throw new IllegalStateException("Only syllabus owner can edit course outcomes");
        }

        // Lấy (hoặc khởi tạo) bản ghi syllabus_content để lưu snapshot JSON
        SyllabusContent content = contentRepo.findBySyllabus_Id(syllabusId)
                .orElse(new SyllabusContent());

        content.setSyllabus(s);

        // Chuyển từng phần của request thành chuỗi JSON (nếu là object) rồi lưu
        try {
            if (request.generalInfo() != null) {
                // If it's already a Map, serialize it; if it's a string, use as-is
                Object generalInfoObj = request.generalInfo();
                if (generalInfoObj instanceof String) {
                    content.setGeneralInfo((String) generalInfoObj);
                } else {
                    content.setGeneralInfo(objectMapper.writeValueAsString(generalInfoObj));
                }
            }
            if (request.description() != null) {
                content.setDescription(request.description());
            }
            if (request.courseObjectives() != null) {
                Object courseObjectivesObj = request.courseObjectives();
                if (courseObjectivesObj instanceof String) {
                    content.setCourseObjectives((String) courseObjectivesObj);
                } else {
                    content.setCourseObjectives(objectMapper.writeValueAsString(courseObjectivesObj));
                }
            }
            if (request.courseLearningOutcomes() != null) {
                Object cloObj = request.courseLearningOutcomes();
                if (cloObj instanceof String) {
                    content.setCourseLearningOutcomes((String) cloObj);
                } else {
                    content.setCourseLearningOutcomes(objectMapper.writeValueAsString(cloObj));
                }
            }
            if (request.assessmentMethods() != null) {
                Object assessmentObj = request.assessmentMethods();
                if (assessmentObj instanceof String) {
                    content.setAssessmentMethods((String) assessmentObj);
                } else {
                    content.setAssessmentMethods(objectMapper.writeValueAsString(assessmentObj));
                }
            }
            if (request.studentDuties() != null) {
                content.setStudentDuties(request.studentDuties());
            }
            if (request.teachingPlan() != null) {
                Object teachingPlanObj = request.teachingPlan();
                if (teachingPlanObj instanceof String) {
                    content.setTeachingPlan((String) teachingPlanObj);
                } else {
                    content.setTeachingPlan(objectMapper.writeValueAsString(teachingPlanObj));
                }
            }
            if (request.cloMappings() != null) {
                Object cloMappingsObj = request.cloMappings();
                System.out.println("DEBUG: cloMappingsObj = " + cloMappingsObj);
                if (cloMappingsObj instanceof String) {
                    content.setCloMappings((String) cloMappingsObj);
                } else {
                    String mapped = objectMapper.writeValueAsString(cloMappingsObj);
                    System.out.println("DEBUG: cloMappings serialized = " + mapped);
                    content.setCloMappings(mapped);
                }
            }
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize course outcomes: " + e.getMessage(), e);
        }

        // Lưu snapshot JSON vào syllabus_contents
        SyllabusContent saved = contentRepo.save(content);

        // Đồng bộ dữ liệu chuẩn hoá (CLO và CLO–PLO) với request vừa lưu
        syncClosAndMappings(s, request);

        return saved;
    }

    @Override
    public SyllabusContent getBysyllabusId(Long syllabusId) {
        return contentRepo.findBySyllabus_Id(syllabusId)
                .orElse(null);
    }

    /**
     * Đồng bộ bảng chuẩn hoá từ request:
     * - Upsert danh sách CLO theo code (thêm mới hoặc cập nhật mô tả/active)
     * - Xoá các CLO không còn trong request
     * - Dedupe các cặp (CLO, PLO), upsert level; và prune (xoá) các mapping không còn trong payload
     */
    private void syncClosAndMappings(Syllabus syllabus, CourseOutcomesRequest request) {
        // Lấy danh sách CLO ở request (có thể null)
        List<Map<String, String>> closReq = request.courseLearningOutcomes();
        if (closReq == null) closReq = Collections.emptyList();

        // Tải CLO hiện có của syllabus và map theo code để so khớp/upsert
        List<Clo> existingClos = cloRepo.findBySyllabus_Id(syllabus.getId());
        Map<String, Clo> existingByCode = new HashMap<>();
        for (Clo c : existingClos) {
            existingByCode.put(c.getCode(), c);
        }

        // Duyệt request: chuẩn hoá code, loại trùng lặp; chuẩn bị danh sách upsert
        Set<String> desiredCodes = new LinkedHashSet<>();
        List<Clo> closToUpsert = new ArrayList<>();
        for (Map<String, String> m : closReq) {
            if (m == null) continue;
            String code = safeString(m.get("code"));
            String description = safeString(m.get("description"));
            if (code == null || code.isBlank()) continue;
            String normalized = code.trim();
            if (!desiredCodes.add(normalized)) continue; // skip duplicates in request

            Clo clo = existingByCode.get(normalized);
            if (clo == null) {
                clo = new Clo();
                clo.setSyllabus(syllabus);
                clo.setCode(normalized);
            }
            clo.setDescription(description == null ? "" : description);
            clo.setActive(true);
            closToUpsert.add(clo);
        }

        // Lưu CLO (thêm mới/cập nhật)
        List<Clo> persistedClos = closToUpsert.isEmpty() ? java.util.Collections.emptyList() : cloRepo.saveAll(closToUpsert);

        // Xoá các CLO không còn trong request (dựa theo code)
        if (!existingClos.isEmpty()) {
            List<Clo> toDelete = new ArrayList<>();
            for (Clo c : existingClos) {
                if (!desiredCodes.contains(c.getCode())) {
                    toDelete.add(c);
                }
            }
            if (!toDelete.isEmpty()) {
                cloRepo.deleteAll(toDelete);
            }
        }

        // Dựng map code -> CLO đã tồn tại để phục vụ tạo mapping
        Map<String, Clo> codeToClo = new HashMap<>();
        for (Clo c : (persistedClos.isEmpty() ? cloRepo.findBySyllabus_Id(syllabus.getId()) : persistedClos)) {
            codeToClo.put(c.getCode(), c);
        }

        // Chuẩn bị danh sách mapping từ request
        List<Map<String, Object>> mappings = castMappings(request.cloMappings());
        if (mappings.isEmpty()) return;

        // Khử trùng lặp cặp (CLO, PLO). Nếu trùng, bản ghi sau cùng sẽ ghi đè level
        Map<String, Integer> pairToLevel = new LinkedHashMap<>();
        for (Map<String, Object> item : mappings) {
            if (item == null) continue;
            String cloCode = safeString(item.get("clo"));
            Object ploObj = item.get("plo");
            Object levelObj = item.get("level");

            if (cloCode == null || cloCode.isBlank() || ploObj == null) continue;
            Clo clo = codeToClo.get(cloCode);
            if (clo == null) continue;

            Long ploId = parseLong(ploObj);
            if (ploId == null) continue;

            String key = clo.getId() + ":" + ploId;
            Integer lvl = levelObj instanceof Number ? ((Number) levelObj).intValue() : parseIntSafe(levelObj);
            pairToLevel.put(key, lvl);
        }

        // Tải các mapping hiện có của syllabus và thực hiện upsert + prune
        List<CloPloMap> existingMaps = mapRepo.findByClo_Syllabus_Id(syllabus.getId());
        Map<String, CloPloMap> existingByPair = new HashMap<>();
        for (CloPloMap m : existingMaps) {
            existingByPair.put(m.getClo().getId() + ":" + m.getPlo().getId(), m);
        }

        List<CloPloMap> mapsToUpsert = new ArrayList<>();
        Set<String> desiredPairs = pairToLevel.keySet();

        for (Map.Entry<String, Integer> e : pairToLevel.entrySet()) {
            String pair = e.getKey();
            Integer lvl = e.getValue();
            CloPloMap map = existingByPair.get(pair);
            if (map == null) {
                String[] parts = pair.split(":", 2);
                Long cloId = Long.parseLong(parts[0]);
                Long ploId = Long.parseLong(parts[1]);
                map = new CloPloMap();
                map.setClo(cloRepo.getReferenceById(cloId));
                map.setPlo(ploRepo.getReferenceById(ploId));
            }
            map.setLevel(lvl);
            mapsToUpsert.add(map);
        }

        // Xác định các mapping đã cũ (không còn trong payload) để xoá
        List<CloPloMap> toDelete = new ArrayList<>();
        for (Map.Entry<String, CloPloMap> en : existingByPair.entrySet()) {
            if (!desiredPairs.contains(en.getKey())) {
                toDelete.add(en.getValue());
            }
        }

        if (!toDelete.isEmpty()) mapRepo.deleteAllInBatch(toDelete);
        if (!mapsToUpsert.isEmpty()) mapRepo.saveAll(mapsToUpsert);
    }

    // Trả về chuỗi an toàn từ object (có thể null)
    private static String safeString(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    // Parse Long an toàn từ nhiều kiểu (Number/String); lỗi trả null
    private static Long parseLong(Object o) {
        try {
            if (o == null) return null;
            if (o instanceof Number n) return n.longValue();
            String s = String.valueOf(o).trim();
            if (s.isEmpty()) return null;
            return Long.parseLong(s);
        } catch (Exception e) {
            return null;
        }
    }

    // Parse Integer an toàn từ nhiều kiểu (Number/String); lỗi trả null
    private static Integer parseIntSafe(Object o) {
        try {
            if (o == null) return null;
            if (o instanceof Number n) return n.intValue();
            String s = String.valueOf(o).trim();
            if (s.isEmpty()) return null;
            return Integer.parseInt(s);
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    // Chuyển danh sách bất kỳ sang List<Map<String, Object>> phục vụ xử lý mapping
    private static List<Map<String, Object>> castMappings(List<?> list) {
        if (list == null) return Collections.emptyList();
        List<Map<String, Object>> res = new ArrayList<>();
        for (Object o : list) {
            if (o instanceof Map<?, ?> m) {
                Map<String, Object> mm = new HashMap<>();
                for (Map.Entry<?, ?> e : m.entrySet()) {
                    mm.put(String.valueOf(e.getKey()), e.getValue());
                }
                res.add(mm);
            }
        }
        return res;
    }
}
