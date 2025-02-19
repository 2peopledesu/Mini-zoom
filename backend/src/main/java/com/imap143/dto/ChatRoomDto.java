package com.imap143.dto;

import java.util.List;

import lombok.Data;

@Data
public class ChatRoomDto {
    private String id;
    private String name;
    private List<String> participants;
    private String createdBy;
    
    // Request for Create ChatRoom
    @Data
    public static class CreateRequest {
        private String name;
    }
    
    // Request for Join/Leave ChatRoom
    @Data
    public static class JoinLeaveRequest {
        private String roomId;
        private String userId;
    }
} 