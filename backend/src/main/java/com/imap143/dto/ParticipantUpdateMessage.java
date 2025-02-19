package com.imap143.dto;

import java.util.List;

import lombok.Data;

@Data
public class ParticipantUpdateMessage {
    private String roomId;
    private List<String> participants;

    public ParticipantUpdateMessage(String roomId, List<String> participants) {
        this.roomId = roomId;
        this.participants = participants;
    }
} 