package com.imap143.application.dto;

import java.util.List;

import com.imap143.api.dto.request.CreateRoomRequest;
import com.imap143.domain.entity.ChatRoom;

import lombok.Data;

@Data
public class ChatRoomDto {
    private String name;
    private String createdBy;
    private String id;
    private Long createdAt;
    private List<String> participants;
    private List<String> activeParticipants;
    
    // Information for Create ChatRoom
    public static ChatRoomDto from(CreateRoomRequest request, String userId) {
        ChatRoomDto dto = new ChatRoomDto();
        dto.setName(request.getName());
        dto.setCreatedBy(userId);
        return dto;
    }
    
    // Information for Get ChatRoom
    public static ChatRoomDto from(ChatRoom entity) {
        ChatRoomDto dto = new ChatRoomDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setParticipants(entity.getParticipants());
        dto.setActiveParticipants(entity.getActiveParticipants());
        return dto;
    }
} 