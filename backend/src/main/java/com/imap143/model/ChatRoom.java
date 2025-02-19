package com.imap143.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "chatRooms")
@Data
@NoArgsConstructor
public class ChatRoom {
    @Id
    private String id;
    private String name;
    private String createdBy;
    private Long createdAt;
    
    @Field("participants")
    private List<String> participants = new ArrayList<>();
    
    @Field("active_participants")
    private List<String> activeParticipants = new ArrayList<>();
} 