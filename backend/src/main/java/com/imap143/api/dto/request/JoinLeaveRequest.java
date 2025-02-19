package com.imap143.api.dto.request;

import lombok.Data;

@Data
public class JoinLeaveRequest {
    private String roomId;
    private String userId;
}
