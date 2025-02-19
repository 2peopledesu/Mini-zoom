package com.imap143.api.dto.response;

import com.imap143.application.dto.ChatRoomDto;
import lombok.Data;

import java.util.List;

@Data
public class ChatRoomResponse {
    private String id;
    private String name;
    private String createdBy;
    private Long createdAt;
    private int participantCount;
    private List<String> participants;
    private List<String> activeParticipants;
    
    public static ChatRoomResponse from(ChatRoomDto dto) {
        ChatRoomResponse response = new ChatRoomResponse();
        response.setId(dto.getId());
        response.setName(dto.getName());
        response.setCreatedBy(dto.getCreatedBy());
        response.setCreatedAt(dto.getCreatedAt());
        response.setParticipants(dto.getParticipants());
        response.setActiveParticipants(dto.getActiveParticipants());
        response.setParticipantCount(dto.getActiveParticipants().size());
        return response;
    }
}