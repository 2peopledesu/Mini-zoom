package com.imap143.api.dto.response;

import java.util.List;

import com.imap143.domain.entity.ChatMessage;
import com.imap143.domain.entity.ChatMessage.MessageType;

import lombok.Data;

@Data
public class ChatMessageResponse {
    private String id;
    private String roomId;
    private String senderId;
    private String senderName;
    private String content;
    private String imageUrl;
    private MessageType type;
    private long timestamp;
    
    public static ChatMessageResponse from(ChatMessage message) {
        ChatMessageResponse response = new ChatMessageResponse();
        response.setId(message.getId());
        response.setRoomId(message.getRoomId());
        response.setSenderId(message.getSenderId());
        response.setSenderName(message.getSenderName());
        response.setContent(message.getContent());
        response.setImageUrl(message.getImageUrl());
        response.setType(message.getType());
        response.setTimestamp(message.getTimestamp());
        return response;
    }
    
    public static List<ChatMessageResponse> fromList(List<ChatMessage> messages) {
        return messages.stream()
            .map(ChatMessageResponse::from)
            .toList();
    }
} 