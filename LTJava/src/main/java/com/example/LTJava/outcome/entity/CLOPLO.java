package com.example.LTJava.outcome.entity;

import com.example.LTJava.outcome.dto.MappingStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter // Tự sinh Getter
@Setter // Tự sinh Setter
@NoArgsConstructor // Constructor không đối số
@AllArgsConstructor // Constructor đầy đủ đối số
@Entity
@Table(
        name = "clo_plo",
        uniqueConstraints = @UniqueConstraint(columnNames = {"clo_id", "plo_id"})
)
public class CLOPLO {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "clo_id")
    private CLO clo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "plo_id")
    private PLO plo;

    @Enumerated(EnumType.STRING) private MappingStatus status;

    public void setNote(String note) {}

    // getters/setters
}
