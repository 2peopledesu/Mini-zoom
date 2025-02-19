package com.imap143.dto;

import com.imap143.model.ChatMessage.MessageType;

import lombok.Data;

@Data
public class ChatMessageDto {
    private String roomId;
    private String senderId;
    private String senderName;
    private String content;
    private String imageUrl;
    private MessageType type;
    private long timestamp;
    
    @Data
    public static class SignalRequest {
        private String roomId;
        private String senderId;
        private String targetId;  // Send Signal to Specific User
        private Object signal;    // WebRTC Signal data (offer, answer, ice candidate)
        private MessageType type;
    }
} 