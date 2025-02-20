package com.imap143.application.dto;

import lombok.Data;

@Data
public class MediaStatusDto {
    private boolean audioEnabled;
    private boolean videoEnabled;
    private String userId;
} 