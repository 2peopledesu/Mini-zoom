package com.imap143.domain.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "messages")
public class ChatMessage {
    @Id
    private String id;
    private String roomId;
    private String senderId;
    private String senderName;
    private String content;
    private String imageUrl;
    private MessageType type;
    private long timestamp;

    public enum MessageType {
        CHAT,           
        JOIN,           
        LEAVE,          
        IMAGE,          // add image type
        OFFER,          // WebRTC offer
        ANSWER,         // WebRTC answer
        ICE_CANDIDATE   // WebRTC ICE candidate
    }
} 