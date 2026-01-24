package com.example.LTJava.outcome.dto;

import lombok.Data;

@Data
public class UpdateMappingStatusRequest {
    private Long cloId;
    private Long ploId;
    private MappingStatus status;
    private String note;
}


