package com.imap143.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.imap143.dto.ChatMessageDto;
import com.imap143.model.ChatMessage;
import com.imap143.repository.ChatMessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;

    public ChatMessage saveMessage(ChatMessageDto messageDto) {
        ChatMessage message = new ChatMessage();
        message.setRoomId(messageDto.getRoomId());
        message.setSenderId(messageDto.getSenderId());
        message.setSenderName(messageDto.getSenderName());
        message.setContent(messageDto.getContent());
        message.setType(messageDto.getType());
        message.setTimestamp(messageDto.getTimestamp());
        message.setImageUrl(messageDto.getImageUrl());
        
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getRoomMessages(String roomId) {
        return chatMessageRepository.findByRoomIdOrderByTimestampAsc(roomId);
    }

    public List<ChatMessage> getRoomMessagesSince(String roomId, long timestamp) {
        return chatMessageRepository.findByRoomIdAndTimestampGreaterThanOrderByTimestampAsc(
            roomId, timestamp);
    }
} 