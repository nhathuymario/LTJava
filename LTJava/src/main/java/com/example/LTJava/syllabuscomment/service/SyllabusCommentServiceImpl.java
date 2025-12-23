package com.example.LTJava.syllabuscomment.service;

import com.example.LTJava.syllabus.entity.Syllabus;
import com.example.LTJava.syllabus.entity.SyllabusStatus;
import com.example.LTJava.syllabus.repository.SyllabusRepository;
import com.example.LTJava.syllabuscomment.dto.CommentResponse;
import com.example.LTJava.syllabuscomment.entity.CommentStatus;
import com.example.LTJava.syllabuscomment.entity.SyllabusComment;
import com.example.LTJava.syllabuscomment.repository.SyllabusCommentRepository;
import com.example.LTJava.user.entity.User;
import com.example.LTJava.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SyllabusCommentServiceImpl implements SyllabusCommentService {

    private final SyllabusRepository syllabusRepo;
    private final UserRepository userRepo;
    private final SyllabusCommentRepository commentRepo;

    public SyllabusCommentServiceImpl(
            SyllabusRepository syllabusRepo,
            UserRepository userRepo,
            SyllabusCommentRepository commentRepo) {
        this.syllabusRepo = syllabusRepo;
        this.userRepo = userRepo;
        this.commentRepo = commentRepo;
    }

    @Override
    public CommentResponse addComment(Long syllabusId, Long lecturerId, String content) {

        Syllabus syllabus = syllabusRepo.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus không tồn tại"));

        if (syllabus.getStatus() != SyllabusStatus.SUBMITTED) {
            throw new RuntimeException("Chỉ được comment khi syllabus ở trạng thái SUBMITTED");
        }

        User commenter = userRepo.findById(lecturerId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        SyllabusComment c = new SyllabusComment();
        c.setSyllabus(syllabus);
        c.setCommenter(commenter);
        c.setContent(content);

        return toDTO(commentRepo.save(c));
    }

    @Override
    public List<CommentResponse> getComments(Long syllabusId) {
        return commentRepo
                .findBySyllabus_IdAndStatusOrderByCreatedAtAsc(
                        syllabusId, CommentStatus.ACTIVE)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public CommentResponse updateComment(Long commentId, Long lecturerId, String content) {

        SyllabusComment c = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment không tồn tại"));

        if (!c.getCommenter().getId().equals(lecturerId)) {
            throw new RuntimeException("Bạn không có quyền sửa comment này");
        }

        c.setContent(content);
        return toDTO(commentRepo.save(c));
    }

    @Override
    public void deleteComment(Long commentId, Long lecturerId) {

        SyllabusComment c = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment không tồn tại"));

        if (!c.getCommenter().getId().equals(lecturerId)) {
            throw new RuntimeException("Bạn không có quyền xóa comment này");
        }

        c.setStatus(CommentStatus.DELETED);
        commentRepo.save(c);
    }

    private CommentResponse toDTO(SyllabusComment c) {
        CommentResponse dto = new CommentResponse();
        dto.setId(c.getId());
        dto.setContent(c.getContent());
        dto.setCommenterId(c.getCommenter().getId());
        dto.setCommenterName(c.getCommenter().getFullName());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }
}
